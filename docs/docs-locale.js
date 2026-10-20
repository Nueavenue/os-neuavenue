;(function () {
  var KEY = 'neuos.lang'
  var KO = 'ko'

  function readLocale() {
    try {
      var q = new URLSearchParams(location.search).get('lang')
      if (q) return q
      var saved = localStorage.getItem(KEY)
      if (saved) return saved
    } catch (_err) {
      /* ignore */
    }
    return 'en'
  }

  function isKo(lang) {
    return lang === KO
  }

  function applyEmbedClass() {
    try {
      if (new URLSearchParams(location.search).get('embed') === '1') {
        document.documentElement.classList.add('docs-embed')
      } else {
        document.documentElement.classList.remove('docs-embed')
      }
    } catch (_err) {
      /* ignore */
    }
  }

  function applyDocsLocale() {
    var lang = readLocale()
    document.documentElement.lang = lang
    document.documentElement.classList.remove('font-ko', 'font-en')
    document.documentElement.classList.add(isKo(lang) ? 'font-ko' : 'font-en')
    document.documentElement.dataset.locale = lang
    applyEmbedClass()
    return lang
  }

  function t(lang, ko, en) {
    return isKo(lang) ? ko : en
  }

  function isEmbed() {
    try {
      return (
        new URLSearchParams(location.search).get('embed') === '1' ||
        document.documentElement.classList.contains('docs-embed')
      )
    } catch (_err) {
      return document.documentElement.classList.contains('docs-embed')
    }
  }

  function withLocaleEmbed(href) {
    var dest = new URL(href, location.href)
    var lang = document.documentElement.dataset.locale || readLocale()
    dest.searchParams.set('lang', lang)
    if (isEmbed()) dest.searchParams.set('embed', '1')
    return dest.href
  }

  function goDocsBack() {
    if (history.length > 1) history.back()
    else location.href = withLocaleEmbed(new URL('/docs/index.html', location.origin).href)
  }

  function installDocsBack() {
    if (document.getElementById('docs-back') || document.getElementById('nav-docs-link')) return
    var lang = document.documentElement.dataset.locale || readLocale()
    var navInner = document.querySelector('.nav .nav-inner')
    if (navInner) {
      document.documentElement.classList.add('docs-nav-chrome')
      var brand = navInner.querySelector('.brand')
      var docsLink = document.createElement('a')
      docsLink.id = 'nav-docs-link'
      docsLink.className = 'nav-docs-link'
      docsLink.href = withLocaleEmbed(new URL('/docs/index.html', location.origin).href)
      docsLink.textContent = 'os.neu docs'
      if (!isEmbed()) {
        var back = document.createElement('button')
        back.type = 'button'
        back.className = 'docs-back'
        back.id = 'docs-back'
        back.textContent = '← Back'
        back.addEventListener('click', goDocsBack)
        if (brand) brand.after(back, docsLink)
        else navInner.prepend(back, docsLink)
      } else if (brand) {
        brand.after(docsLink)
      } else {
        navInner.prepend(docsLink)
      }
      return
    }
    if (isEmbed()) return
    var bar = document.createElement('div')
    bar.className = 'docs-back-bar'
    bar.innerHTML =
      '<button type="button" class="docs-back" id="docs-back"></button>' +
      '<a class="nav-docs-link" href="index.html">os.neu docs</a>'
    bar.querySelector('#docs-back').textContent = '← Back'
    document.body.insertBefore(bar, document.body.firstChild)
    document.getElementById('docs-back').addEventListener('click', goDocsBack)
  }

  function rewriteKnownLink(href) {
    try {
      var url = new URL(href, location.href)
      var host = url.hostname.replace(/^www\./, '').toLowerCase()
      var path = url.pathname.replace(/\/+$/, '') || '/'
      var os = host === 'os.neuavenue.com' || host === 'neuos.neuavenue.com'
      var docs = host === 'docs.neuavenue.com'
      if (path.indexOf('/downloads/') !== -1 || /\.(tar\.gz|iso)$/.test(path)) return null
      if (docs && (path === '/' || path === '/docs' || path === '/docs/index.html' || path === '/index.html')) {
        return new URL('/docs/index.html', location.origin).href
      }
      if ((os || path === '/tutorial' || path === '/tutorial.html') && (path === '/tutorial' || path === '/tutorial.html')) {
        return new URL('/tutorial.html', location.origin).href
      }
      if (os && (path === '/' || path === '')) {
        return new URL('/docs/public-home.html', location.origin).href
      }
    } catch (_err) {
      return null
    }
    return null
  }

  function interceptDocsLinks() {
    document.addEventListener('click', function (event) {
      var node = event.target
      if (!node || !node.closest) return
      var a = node.closest('a')
      if (!a || !a.href) return
      var raw = a.getAttribute('href') || a.href
      var next = rewriteKnownLink(raw)
      if (next) {
        event.preventDefault()
        location.href = withLocaleEmbed(next)
        return
      }
      if (!isEmbed()) return
      try {
        var url = new URL(raw, location.href)
        if (url.origin !== location.origin) return
        if (url.pathname.indexOf('/downloads/') !== -1) return
        event.preventDefault()
        location.href = withLocaleEmbed(url.href)
      } catch (_err) {
        /* leave the link */
      }
    })
  }

  window.osneuDocs = {
    readLocale: readLocale,
    applyDocsLocale: applyDocsLocale,
    applyEmbedClass: applyEmbedClass,
    installDocsBack: installDocsBack,
    interceptDocsLinks: interceptDocsLinks,
    t: t,
    isKo: isKo,
  }
})()
