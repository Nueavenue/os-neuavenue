/**
 * Optional Worker in front of static assets.
 * Secrets stay in Cloudflare (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY).
 * Never commit those values to git.
 *
 * / is the Vite os.neu screen (same as local 127.0.0.1:5173).
 * docs.neuavenue.com serves /docs/* at the hostname root.
 */
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
      if (path === '/' || path === '') path = '/docs/index.html'
      else if (!path.startsWith('/docs/') && !path.startsWith('/brand/') && path !== '/docs') {
        path = '/docs' + (path.startsWith('/') ? path : `/${path}`)
      } else if (path === '/docs') {
        path = '/docs/index.html'
      }
      return env.ASSETS.fetch(new Request(new URL(path, url.origin), request))
    }

    if (url.pathname === '/login' || url.pathname === '/login/') {
      return env.ASSETS.fetch(new Request(new URL('/login.html', url.origin), request))
    }
    if (url.pathname === '/tutorial' || url.pathname === '/tutorial/') {
      return env.ASSETS.fetch(new Request(new URL('/tutorial.html', url.origin), request))
    }

    return env.ASSETS.fetch(request)
  },
}
