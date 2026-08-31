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
