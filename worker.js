/**
 * Optional Worker in front of static assets.
 * Secrets stay in Cloudflare (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY,
 * OPENAI_API_KEY; optional COACH_VOICE/MODEL_NAME/JUDGE_MODEL overrides).
 * Never commit those values to git.
 *
 * / is the Vite os.neu screen (same as local 127.0.0.1:5173).
 * docs.neuavenue.com serves /docs/* at the hostname root.
 * wrangler.toml must set assets.run_worker_first = true so / on the docs
 * host is not swallowed by the SPA index.html.
 */
function assetRequest(request, path) {
  const url = new URL(request.url)
  url.pathname = path
  return new Request(url, { method: request.method, headers: request.headers })
}

async function serveAsset(env, request, path) {
  const res = await env.ASSETS.fetch(assetRequest(request, path))
  if (!path.endsWith('.md')) return res
  const headers = new Headers(res.headers)
  headers.set('access-control-allow-origin', '*')
  headers.set('content-type', 'text/plain; charset=utf-8')
  return new Response(res.body, { status: res.status, headers })
}

// WO-UI-NEU-WEB-NARRATOR-VOICE-121: hosted mirror of the desktop bridge's
// /api/speak/chat (server/speak.ts coachChat) so os.neuavenue.com's one-box
// speaker uses the same OpenAI COACH_VOICE clip as the desktop app, instead
// of falling back to Chrome's speechSynthesis. Key stays a Cloudflare
// secret (env.OPENAI_API_KEY) — never in this file, never in git, never
// sent to the browser. If the secret is unset this returns 503
// openai-unconfigured and the existing frontend try/catch in
// src/state/store.tsx's pushCoach() already falls back to speakBrowser —
// same behavior as today, just without needing 4178.
const COACH_SYSTEM_PROMPT = `You are OS.neu Speak v1.0, a warm English speaking coach for the OS.neu first screen (NeuSpeak method).
The learner may speak Korean or another language. Understand what they said, then reply in natural conversational English, like a friendly native-speaking tutor.
Keep replies short (1-3 sentences). If the learner made a grammar or word-choice mistake, gently model the correct phrasing inside your reply.
When they ask you to do something on this computer (check internet, open a browser, install software), first restate what you heard and ask them to look at the screen and confirm. After they confirm, use any facts in their message (online/offline, which page opened, install command) and ask them to say whether they see it.
Filter rambling or off-topic audio into one clear English idea. Do not dump a boring status line. Offer a choice or a next tiny step.
Always end with a short follow-up question to keep them talking.`

async function openaiChatCompletion(key, messages, opts) {
  const body = { model: opts.model, messages }
  if (opts.audio) {
    body.modalities = ['text', 'audio']
    body.audio = { voice: opts.voice, format: 'wav' }
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`openai-${res.status}`)
  const data = await res.json()
  const messageOut = data.choices && data.choices[0] && data.choices[0].message
  const reply = ((messageOut && messageOut.audio && messageOut.audio.transcript) ?? (messageOut && messageOut.content) ?? '').trim()
  if (!reply) throw new Error('empty-reply')
  const audioData = messageOut && messageOut.audio && messageOut.audio.data
  return audioData ? { reply, audio: { data: audioData, format: 'wav' } } : { reply }
}

function coachChatText(key, messages, env) {
  return openaiChatCompletion(key, messages, { audio: false, model: env.JUDGE_MODEL || 'gpt-4o-mini' })
}

async function coachChatAudio(key, messages, env) {
  try {
    // Same voice as desktop's COACH_VOICE (default 'nova' female — server/speak.ts).
    return await openaiChatCompletion(key, messages, {
      audio: true,
      voice: env.COACH_VOICE || 'nova',
      model: env.MODEL_NAME || 'gpt-audio-1.5',
    })
  } catch {
    // Mirrors desktop coachChat()'s own fallback: if the audio-modality
    // call fails, still return a text reply rather than erroring out.
    return await coachChatText(key, messages, env)
  }
}

async function handleSpeakChat(request, env) {
  const key = (env.OPENAI_API_KEY || '').trim()
  if (!key) return Response.json({ ok: false, reason: 'openai-unconfigured' }, { status: 503 })
  let payload
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }
  const message = String((payload && payload.message) || '').trim()
  if (!message) return Response.json({ ok: false, reason: 'empty' }, { status: 400 })
  const rawHistory = Array.isArray(payload && payload.history) ? payload.history : []
  const history = rawHistory
    .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant') && String(turn.content || '').trim())
    .slice(-8)
    .map((turn) => ({ role: turn.role, content: String(turn.content) }))
  const messages = [{ role: 'system', content: COACH_SYSTEM_PROMPT }, ...history, { role: 'user', content: message }]
  try {
    const result =
      payload && payload.audio === true
        ? await coachChatAudio(key, messages, env)
        : await coachChatText(key, messages, env)
    return Response.json({ ok: true, ...result })
  } catch {
    return Response.json({ ok: false, reason: 'coach-unavailable' }, { status: 502 })
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const docsHost = url.hostname === 'docs.neuavenue.com' || url.hostname.startsWith('docs.')

    if (url.pathname === '/api/config') {
      return Response.json(
        {
          supabaseUrl: env.PUBLIC_SUPABASE_URL ?? '',
          supabaseAnonKey: env.PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        { headers: { 'cache-control': 'no-store' } },
      )
    }

    if (url.pathname === '/api/speak/chat' && request.method === 'POST') {
      return handleSpeakChat(request, env)
    }

    if (docsHost) {
      let path = url.pathname
      if (path === '/' || path === '' || path === '/index.html') path = '/docs/index.html'
      else if (path === '/docs' || path === '/docs/') path = '/docs/index.html'
      else if (!path.startsWith('/docs/') && !path.startsWith('/brand/')) {
        path = '/docs' + (path.startsWith('/') ? path : `/${path}`)
      }
      if (path.endsWith('.md') && !url.searchParams.has('raw')) {
        const dest = new URL('/docs/view.html', url.origin)
        dest.searchParams.set('doc', path.replace(/^\/docs\//, ''))
        return Response.redirect(dest.toString(), 302)
      }
      return serveAsset(env, request, path)
    }

    if (url.pathname === '/login' || url.pathname === '/login/') {
      return env.ASSETS.fetch(assetRequest(request, '/login.html'))
    }
    if (url.pathname === '/tutorial' || url.pathname === '/tutorial/') {
      return env.ASSETS.fetch(assetRequest(request, '/tutorial.html'))
    }

    // neuos-live.iso (~360MB) exceeds the 25MB Workers static-asset file
    // limit, so it is hosted as a GitHub Release asset and redirected from
    // here (WO-UI-NEU-DOWNLOAD-1). Update the release tag below if rebuilt.
    if (url.pathname === '/downloads/neuos-live.iso') {
      return Response.redirect(
        'https://github.com/Nueavenue/os-neuavenue/releases/download/neuos-live-iso-2026-11-25/neuos-live.iso',
        302,
      )
    }

    // os.neu-Setup.exe (~91MB) exceeds Workers 25MB static.
    // Same-origin URL 302 → GitHub Release (Slice 1 packaged v1.0).
    if (url.pathname === '/downloads/os.neu-Setup.exe') {
      return Response.redirect(
        'https://github.com/Nueavenue/os-neuavenue/releases/download/os-neu-setup-1.0.29-2026-11-26/os.neu-Setup.exe',
        302,
      )
    }

    // os.neu-win-0.1.0-x64.zip (~106MB) exceeds Workers 25MB static.
    // Same-origin URL 302 → GitHub Release (WIN11 refresh 2026-10-02). Seat Face.
    if (url.pathname === '/downloads/os.neu-win-0.1.0-x64.zip') {
      return Response.redirect(
        'https://github.com/Nueavenue/os-neuavenue/releases/download/os-neu-win-0.1.0-x64/os.neu-win-0.1.0-x64.zip',
        302,
      )
    }

    // Legacy bridge-only paths (dev localhost used these against the Node
    // bridge). Redirect to the static prod equivalents so old bookmarks/
    // embeds keep working (WO-UI-NEU-DOWNLOAD-1).
    const legacyDownloads = {
      '/api/download/pack': '/downloads/neuos-boot-kit.tar.gz',
      '/api/download/iso': '/downloads/neuos-live.iso',
      '/api/download/linux': '/downloads/neuos-linux.tar.gz',
      '/api/download/windows': '/downloads/os.neu-Setup.exe',
    }
    if (url.pathname in legacyDownloads) {
      url.pathname = legacyDownloads[url.pathname]
      return Response.redirect(url.toString(), 302)
    }

    return env.ASSETS.fetch(request)
  },
}
