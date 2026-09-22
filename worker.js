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
 *
 * /api/browse — CDN in-window browser (Leader option 1). Mirrors neuOS
 * server/browse.ts: fetch remote HTML, inject <base>, strip frame blockers.
 */

const BROWSE_MAX_BYTES = 2_000_000
const BROWSE_TIMEOUT_MS = 12_000

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
  return new Response(res.body, { status: res.status, headers })
}

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function browseErrorPage(url, reason) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>OS.neu v1.0</title>
<style>body{font-family:sans-serif;background:#0b0c0a;color:#f4efe6;padding:48px}</style>
</head><body><h1>That address could not be opened</h1>
<p>${escapeHtml(url)}</p><p>${escapeHtml(reason)}</p></body></html>`
}

function isBlockedBrowseHost(hostname) {
  const h = String(hostname || '')
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
  if (!h) return true
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1' || h.endsWith('.local')) return true
  if (h === 'metadata.google.internal' || h === 'metadata') return true
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true
  if (h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80:')) return true
  return false
}

function parseBrowseUrl(raw) {
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (isBlockedBrowseHost(url.hostname)) return null
    return url
  } catch {
    return null
  }
}

async function fetchBrowsePage(target) {
  const url = parseBrowseUrl(target)
  if (!url) {
    return {
      status: 400,
      contentType: 'text/html; charset=utf-8',
      body: browseErrorPage(target, 'Only public http(s) addresses can be opened.'),
      finalUrl: target,
    }
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), BROWSE_TIMEOUT_MS)
  try {
    const res = await fetch(url.toString(), {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 neuOS/0.1',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    // Re-check final URL after redirects (SSRF).
    let finalUrl = res.url || url.toString()
    try {
      const finalParsed = new URL(finalUrl)
      if (isBlockedBrowseHost(finalParsed.hostname)) {
        return {
          status: 400,
          contentType: 'text/html; charset=utf-8',
          body: browseErrorPage(target, 'That address redirected to a blocked host.'),
          finalUrl,
        }
      }
    } catch {
      /* keep finalUrl */
    }

    const buf = new Uint8Array(await res.arrayBuffer())
    if (buf.byteLength > BROWSE_MAX_BYTES) {
      return {
        status: 413,
        contentType: 'text/html; charset=utf-8',
        body: browseErrorPage(finalUrl, 'That page is too large.'),
        finalUrl,
      }
    }

    const contentType = res.headers.get('content-type') || 'text/html; charset=utf-8'
    let body = buf
    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      let html = new TextDecoder('utf-8', { fatal: false }).decode(buf)
      html = html
        .replace(/<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '')
        .replace(/<meta[^>]+http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '')
      const base = `<base href="${escapeAttr(finalUrl)}">`
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${base}`)
      } else {
        html = `${base}\n${html}`
      }
      body = new TextEncoder().encode(html)
    }

    return {
      status: res.status,
      contentType,
      body,
      finalUrl,
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'fetch-failed'
    return {
      status: 502,
      contentType: 'text/html; charset=utf-8',
      body: browseErrorPage(target, reason),
      finalUrl: target,
    }
  } finally {
    clearTimeout(timer)
  }
}

function browseResponse(page) {
  return new Response(page.body, {
    status: page.status,
    headers: {
      'content-type': page.contentType,
      'cache-control': 'no-store',
      'x-frame-options': 'SAMEORIGIN',
      'content-security-policy': "frame-ancestors 'self'",
      'x-neuos-final-url': page.finalUrl,
    },
  })
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
    // Same voice as desktop's COACH_VOICE (default 'alloy' — server/speak.ts).
    return await openaiChatCompletion(key, messages, {
      audio: true,
      voice: env.COACH_VOICE || 'alloy',
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

// WO-UI-NEU-HOSTED-ASK-AI-121 — office Ask AI on the CDN. No Ollama here.
const OFFICE_MODELS = ['os.neu-local', 'gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']
const officeHits = new Map()

function pickHostedOpenAiKey(request, env) {
  const user = (request.headers.get('x-neuos-openai-key') || '').trim()
  if (user.startsWith('sk-') && user.length >= 20 && user.length < 500) return user
  return (env.OPENAI_API_KEY || '').trim()
}

function mapHostedOfficeModel(raw) {
  const model = OFFICE_MODELS.includes(raw) ? raw : 'gpt-4o-mini'
  if (model === 'os.neu-local') return { model: 'gpt-4o-mini', mappedFrom: 'os.neu-local' }
  return { model, mappedFrom: null }
}

function officeSystemFor(app) {
  if (app === 'sheet') {
    return 'You write spreadsheet content. Reply as TSV (tab-separated) with a header row, then up to 8 data rows. No markdown.'
  }
  if (app === 'slides') {
    return (
      'You write a slide deck as JSON only — no markdown, no code fences, no commentary. ' +
      'Schema: {"version":1,"title":"optional deck title","slides":[...]} max 8 slides. ' +
      'Each slide is one of: ' +
      '{"layout":"title","title":"string","body":"optional subtitle"}; ' +
      '{"layout":"bullets","title":"string","bullets":["max 6 short lines"]}; ' +
      '{"layout":"table","title":"string","table":{"headers":["max 5"],"rows":[["max 5 cols"], "max 8 rows"]}}. ' +
      'Only use numbers the user gave you in the instruction or current content — never invent NeuAvenue revenue, ARR, or KPI figures; ' +
      'if you must illustrate with made-up numbers, label the slide title or a cell "EXAMPLE". Reply with the JSON object only.'
    )
  }
  return 'You write a document. Reply with a title on the first line, then the body. Keep it useful and concise.'
}

function officeRateLimited(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'anon'
  const now = Date.now()
  const row = officeHits.get(ip) || { n: 0, t: now }
  if (now - row.t > 10 * 60 * 1000) {
    row.n = 0
    row.t = now
  }
  row.n += 1
  officeHits.set(ip, row)
  return row.n > 30
}

async function officeChatText(key, model, messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: 1500, temperature: 0.3 }),
  })
  if (!res.ok) throw new Error(`openai-${res.status}`)
  const data = await res.json()
  const text = String((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim()
  if (!text) throw new Error('empty-reply')
  return text
}

function handleLlmSettings(request, env) {
  const siteKey = Boolean((env.OPENAI_API_KEY || '').trim())
  if (request.method === 'GET') {
    return Response.json({
      ok: true,
      hosted: true,
      provider: 'openai',
      localModel: '',
      hasKey: siteKey,
      keyHint: siteKey ? 'site' : '',
      ready: siteKey ? { ok: true, via: 'openai' } : { ok: false, reason: 'hosted-no-local' },
      reason: 'hosted-no-ollama',
    })
  }
  return Response.json({
    ok: true,
    hosted: true,
    hasKey: siteKey,
    provider: 'openai',
    reason: 'hosted-session-key',
  })
}

async function handleLlmPing(request, env) {
  const key = pickHostedOpenAiKey(request, env)
  if (!key) return Response.json({ ok: false, reason: 'no-llm' }, { status: 503 })
  const payload = await request.json().catch(() => ({}))
  const mapped = mapHostedOfficeModel(String(payload.model || ''))
  const t0 = Date.now()
  try {
    await officeChatText(key, mapped.model, [
      { role: 'system', content: 'Reply with the single word pong.' },
      { role: 'user', content: 'ping' },
    ])
    return Response.json({
      ok: true,
      provider: 'openai',
      model: mapped.model,
      mappedFrom: mapped.mappedFrom,
      ms: Date.now() - t0,
    })
  } catch (err) {
    return Response.json({ ok: false, reason: err instanceof Error ? err.message : 'ping-error' }, { status: 502 })
  }
}

async function handleOfficeAssist(request, env, asStream) {
  if (officeRateLimited(request)) {
    return Response.json({ ok: false, reason: 'rate-limit' }, { status: 429 })
  }
  const key = pickHostedOpenAiKey(request, env)
  if (!key) return Response.json({ ok: false, reason: 'no-llm' }, { status: 503 })
  const payload = await request.json().catch(() => ({}))
  const app = payload.app === 'doc' || payload.app === 'slides' ? payload.app : 'sheet'
  const instruction = String(payload.instruction || '').trim().slice(0, 2000)
  if (!instruction) return Response.json({ ok: false, reason: 'empty' }, { status: 400 })
  const mapped = mapHostedOfficeModel(String(payload.model || ''))
  const content = String(payload.content || '').slice(0, 6000)
  const history = (Array.isArray(payload.history) ? payload.history : [])
    .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant'))
    .slice(-6)
    .map((turn) => ({ role: turn.role, content: String(turn.content || '').slice(0, 1500) }))
  const messages = [
    { role: 'system', content: officeSystemFor(app) },
    ...history,
    { role: 'user', content: `Instruction: ${instruction}\nCurrent content:\n${content}` },
  ]
  try {
    const text = await officeChatText(key, mapped.model, messages)
    const result = { ok: true, text, model: mapped.model, provider: 'openai', mappedFrom: mapped.mappedFrom }
    if (!asStream) return Response.json(result)
    const lines = [
      JSON.stringify({ ok: true, piece: text, full: text, done: true, model: result.model, provider: 'openai' }),
    ]
    return new Response(lines.join('\n') + '\n', {
      headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-cache' },
    })
  } catch (err) {
    return Response.json({ ok: false, reason: err instanceof Error ? err.message : 'assist-error' }, { status: 502 })
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

    if (url.pathname === '/api/llm/settings' && (request.method === 'GET' || request.method === 'POST')) {
      return handleLlmSettings(request, env)
    }
    if (url.pathname === '/api/llm/ping' && request.method === 'POST') {
      return handleLlmPing(request, env)
    }
    if (url.pathname === '/api/office/assist' && request.method === 'POST') {
      return handleOfficeAssist(request, env, false)
    }
    if (url.pathname === '/api/office/assist/stream' && request.method === 'POST') {
      return handleOfficeAssist(request, env, true)
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return Response.json(
        {
          ok: true,
          driver: 'dry-run',
          vlm: 'graph',
          browse: 'proxy',
          detail: 'os.neuavenue.com web preview — device bridge is not on this host',
        },
        { headers: { 'cache-control': 'no-store' } },
      )
    }

    if (url.pathname === '/api/jeos/ask' && request.method === 'POST') {
      const lang = (request.headers.get('accept-language') || '').toLowerCase()
      const ko = lang.startsWith('ko')
      return Response.json(
        {
          ok: true,
          act: 'preview',
          reply: ko
            ? 'os.neuavenue.com 웹 미리보기입니다. os.neu는 여기 있습니다. 기기 콘솔 답은 설치형 os.neu 또는 로컬 실행에서만 연결됩니다.'
            : 'This is the os.neuavenue.com web preview — os.neu is here. The device console answers only in installed os.neu or local try-now.',
          health: { ok: true, t: Date.now(), stage: 'web-preview', jeos: false },
        },
        { headers: { 'cache-control': 'no-store' } },
      )
    }

    // In-window browser for the hosted SPA (iframe → same-origin proxy).
    if (url.pathname === '/api/browse' && request.method === 'GET') {
      const target = url.searchParams.get('url') || ''
      if (url.searchParams.get('probe') === '1') {
        const parsed = parseBrowseUrl(target)
        if (!parsed) {
          return Response.json({ ok: false, status: 400, finalUrl: target }, { headers: { 'cache-control': 'no-store' } })
        }
        try {
          const res = await fetch(parsed.toString(), {
            redirect: 'follow',
            signal: AbortSignal.timeout(BROWSE_TIMEOUT_MS),
            headers: {
              'user-agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 neuOS/0.1',
              accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          })
          let finalUrl = res.url || parsed.toString()
          try {
            if (isBlockedBrowseHost(new URL(finalUrl).hostname)) {
              return Response.json(
                { ok: false, status: 400, finalUrl },
                { headers: { 'cache-control': 'no-store' } },
              )
            }
          } catch {
            /* keep */
          }
          return Response.json(
            { ok: res.ok, status: res.status, finalUrl },
            { headers: { 'cache-control': 'no-store' } },
          )
        } catch {
          return Response.json({ ok: false, status: 502, finalUrl: target }, { headers: { 'cache-control': 'no-store' } })
        }
      }
      const page = await fetchBrowsePage(target)
      return browseResponse(page)
    }

    if (docsHost) {
      let path = url.pathname
      if (path === '/' || path === '' || path === '/index.html') path = '/docs/index.html'
      else if (path === '/docs' || path === '/docs/') path = '/docs/index.html'
      else if (!path.startsWith('/docs/') && !path.startsWith('/brand/')) {
        path = '/docs' + (path.startsWith('/') ? path : `/${path}`)
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
        'https://github.com/Nueavenue/os-neuavenue/releases/download/neuos-live-iso-2026-08-31/neuos-live.iso',
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
    }
    if (url.pathname in legacyDownloads) {
      url.pathname = legacyDownloads[url.pathname]
      return Response.redirect(url.toString(), 302)
    }

    return env.ASSETS.fetch(request)
  },
}
