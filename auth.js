(() => {
  const status = document.getElementById('auth-status')
  const signed = document.getElementById('signed-in')
  const form = document.getElementById('auth-form')
  const email = document.getElementById('email')
  const password = document.getElementById('password')
  const signOutBtn = document.querySelector('[data-action="signout"]')
  if (!form || !status) return

  const setStatus = (text, err = false) => {
    status.textContent = text
    status.classList.toggle('err', err)
  }

  const paintUser = (user) => {
    if (!signed || !signOutBtn) return
    if (user) {
      signed.hidden = false
      signed.textContent = `Signed in as ${user.email ?? user.id}`
      signOutBtn.hidden = false
    } else {
      signed.hidden = true
      signed.textContent = ''
      signOutBtn.hidden = true
    }
  }

  const boot = async () => {
    const res = await fetch('/api/config', { cache: 'no-store' })
    const cfg = await res.json()
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      setStatus('Sign-in is not configured on this host yet.', true)
      return null
    }
    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, detectSessionInUrl: true },
    })
    const { data } = await client.auth.getSession()
    paintUser(data.session?.user ?? null)
    client.auth.onAuthStateChange((_event, session) => paintUser(session?.user ?? null))
    return client
  }

  void boot().then((client) => {
    if (!client) return

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      setStatus('Signing in…')
      const { error } = await client.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value,
      })
      setStatus(error ? error.message : 'Signed in.', Boolean(error))
    })

    form.querySelector('[data-action="signup"]')?.addEventListener('click', async () => {
      setStatus('Creating account…')
      const { error } = await client.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      })
      setStatus(
        error ? error.message : 'Check your email to confirm the account.',
        Boolean(error),
      )
    })

    form.querySelector('[data-action="magic"]')?.addEventListener('click', async () => {
      setStatus('Sending link…')
      const { error } = await client.auth.signInWithOtp({
        email: email.value.trim(),
        options: { emailRedirectTo: `${window.location.origin}/login` },
      })
      setStatus(error ? error.message : 'Check your email for the sign-in link.', Boolean(error))
    })

    signOutBtn?.addEventListener('click', async () => {
      await client.auth.signOut()
      setStatus('Signed out.')
    })
  })
})()
