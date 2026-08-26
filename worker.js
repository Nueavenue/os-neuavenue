/**
 * Optional Worker in front of static assets.
 * Secrets stay in Cloudflare (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY).
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
  return new Response(res.body, { status: res.status, headers })
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

    return env.ASSETS.fetch(request)
  },
}
