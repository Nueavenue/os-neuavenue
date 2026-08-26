(() => {
  const toggle = document.querySelector('[data-menu-toggle]')
  const menu = document.getElementById('mobile-menu')
  const iconOpen = document.getElementById('icon-open')
  const iconClose = document.getElementById('icon-close')
  if (!toggle || !menu) return

  const setOpen = (open) => {
    menu.classList.toggle('open', open)
    toggle.setAttribute('aria-expanded', String(open))
    if (iconOpen && iconClose) {
      iconOpen.hidden = open
      iconClose.hidden = !open
    }
  }

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')))
  menu.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('click', () => setOpen(false))
  })
})()
