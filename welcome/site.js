(() => {
  const toggle = document.querySelector('[data-menu-toggle]')
  const menu = document.getElementById('mobile-menu')
  const iconOpen = document.getElementById('icon-open')
  const iconClose = document.getElementById('icon-close')
  const nav = document.querySelector('.nav')

  const setOpen = (open) => {
    if (!menu || !toggle) return
    menu.classList.toggle('open', open)
    toggle.setAttribute('aria-expanded', String(open))
    if (iconOpen && iconClose) {
      iconOpen.hidden = open
      iconClose.hidden = !open
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')))
    menu.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('click', () => setOpen(false))
    })
  }

  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  }

  // Same rules as src/engine/detectOs.ts detectGuestOs + heroPrimaryForGuestOs.
  function detectGuestOs(ua, platformHint) {
    const p = String(platformHint || '').toLowerCase()
    const u = String(ua || '').toLowerCase()
    if (p.includes('cros') || u.includes('cros')) return 'chromeos'
    if (p === 'macos' || p.includes('mac') || u.includes('mac os') || u.includes('macintosh')) return 'macos'
    if (p === 'windows' || p === 'win32' || u.includes('windows')) return 'windows'
    if (p === 'linux' || u.includes('linux')) return 'linux'
    return 'unknown'
  }

  function heroPrimaryForGuestOs(os) {
    if (os === 'windows') {
      return {
        href: '/downloads/os.neu-Setup.exe',
        label: 'Download os.neu for Windows',
        file: 'os.neu-Setup.exe',
      }
    }
    return {
      href: '/downloads/neuos-boot-kit.tar.gz',
      label: 'Download boot kit',
      file: 'neuos-boot-kit.tar.gz',
    }
  }

  const heroPrimary = document.querySelector('.hero .actions .btn-primary')
  if (heroPrimary) {
    const nav = navigator
    const hint = (nav.userAgentData && nav.userAgentData.platform) || nav.platform || ''
    const pack = heroPrimaryForGuestOs(detectGuestOs(nav.userAgent, hint))
    heroPrimary.setAttribute('href', pack.href)
    heroPrimary.setAttribute('download', pack.file)
    const label = heroPrimary.querySelector('[data-hero-label]')
    if (label) label.textContent = pack.label
  }

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy')
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        const prev = btn.textContent
        btn.textContent = 'copied'
        setTimeout(() => { btn.textContent = prev }, 1400)
      } catch {
        btn.textContent = 'failed'
      }
    })
  })
})()
