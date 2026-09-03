/**
 * Optional Worker in front of static assets.
 * Secrets stay in Cloudflare (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY).
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

    // In-window browser for the hosted SPA (iframe → same-origin proxy).
    if (url.pathname === '/api/browse' && request.method === 'GET') {
      const target = url.searchParams.get('url') || ''
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
