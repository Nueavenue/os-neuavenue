/**
 * os.neu HTML Deck runtime — shared by html-templates/* and psst-ir-pack.
 * Features: thumbs, Present, surgical Agent, drag-reorder, insert-after, image→HTML.
 */
(async function () {
  const base = new URL('.', location.href)
  const app = document.getElementById('app')
  const thumbsEl = document.getElementById('thumbs')
  const stage = document.getElementById('stageFrame')
  const meta = document.getElementById('pageMeta')
  const log = document.getElementById('log')
  const promptEl = document.getElementById('prompt')
  const csBox = document.getElementById('csBox')
  const imageIn = document.getElementById('imageIn')

  let slides = []
  let i = 0
  let manifest = null
  let presenting = false
  let pendingCs = null
  let agentStatus = 'idle'
  let dragFrom = -1
  let packId = 'html-deck'
  let editMode = false
  let selectedEditId = null
  /** auto = Vision/hybrid · faithful = screenshot pixels as slide · html = file as-is */
  let importMode = 'auto'

  const PAPER = {
    fonts: "Inter, 'Noto Sans KR', sans-serif",
    colors: { paper: '#ECE3D2', ember: '#BC4F2B', teal: '#1F3D44', ink: '#14181D' },
    size: { w: 1920, h: 1080 },
  }

  function ovKey() { return 'os.neu.html-deck.overrides.v1.' + packId }
  function orderKey() { return 'os.neu.html-deck.order.v1.' + packId }
  function csKey() { return 'os.neu.html-deck.changeset.v1.' + packId }
  function extraKey() { return 'os.neu.html-deck.extra.v1.' + packId }
  function labelsKey() { return 'os.neu.html-deck.labels.v1.' + packId }

  function overrides() {
    try { return JSON.parse(localStorage.getItem(ovKey()) || '{}') } catch { return {} }
  }
  function saveOverrides(map) { localStorage.setItem(ovKey(), JSON.stringify(map)) }

  function savedOrder() {
    try { return JSON.parse(localStorage.getItem(orderKey()) || 'null') } catch { return null }
  }
  function saveOrder(ids) { localStorage.setItem(orderKey(), JSON.stringify(ids)) }

  function savedExtras() {
    try { return JSON.parse(localStorage.getItem(extraKey()) || '[]') } catch { return [] }
  }
  function saveExtras(rows) { localStorage.setItem(extraKey(), JSON.stringify(rows || [])) }

  function savedLabels() {
    try { return JSON.parse(localStorage.getItem(labelsKey()) || '{}') } catch { return {} }
  }
  function saveLabels(map) { localStorage.setItem(labelsKey(), JSON.stringify(map || {})) }

  function baseSlideTitle(label) {
    return String(label || '').replace(/^\d+\s+/, '').trim()
  }

  function patchSlideTitleInHtml(html, title) {
    const safe = String(title || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    let out = String(html || '')
    if (!out) return out
    if (/<title\b/i.test(out)) out = out.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '<title>' + safe + '</title>')
    if (/<h1\b/i.test(out)) out = out.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/i, '<h1$1>' + safe + '</h1>')
    return out
  }

  function renameSlide(index, titleRaw, opts) {
    const idx = Math.max(0, Math.min(slides.length - 1, Number(index)))
    const slide = slides[idx]
    if (!slide) return false
    const title = String(titleRaw || '').replace(/[<>]/g, '').trim().slice(0, 80)
    if (!title) return false
    const labels = savedLabels()
    labels[slide.id] = title
    saveLabels(labels)
    const extras = savedExtras().map((ex) => (ex && ex.id === slide.id ? { ...ex, label: title } : ex))
    if (extras.some((ex) => ex && ex.id === slide.id)) saveExtras(extras)
    slide.label = title
    // Patch stored HTML h1 when this slide has an override (inserted / imported)
    const map = overrides()
    if (map[slide.id] && map[slide.id].html) {
      map[slide.id] = {
        ...map[slide.id],
        html: patchSlideTitleInHtml(map[slide.id].html, title),
        at: Date.now(),
      }
      saveOverrides(map)
    }
    relabelSlides()
    renderThumbs()
    show(idx)
    if (!opts || opts.log !== false) {
      setLog('장 이름 변경 · ' + slides[idx].label, true)
    }
    return true
  }

  function parseRenameIntent(instruction) {
    const text = String(instruction || '').trim()
    if (!text || !slides.length) return null
    const looksRename =
      /(?:장\s*)?(?:이름|제목|label)\s*[:：]|이름\s*(?:을|를)?\s*(?:변경|바꿔|개명)|제목\s*(?:을|를)?\s*(?:변경|바꿔)|rename\s+(?:slide|title)|슬라이드\s*이름|장\s*이름/i.test(
        text,
      ) || /(?:이름|제목)\s*(?:을|를)\s*.{1,40}(?:으로|로)\s*(?:변경|바꿔|해|줘)?/i.test(text)
    if (!looksRename) return null
    if (/(추가|insert|add\s+slide|다음\s*장)/i.test(text) && !/(이름|개명|변경|rename|바꿔)/i.test(text)) return null
    let title = ''
    const colon = text.match(/(?:장\s*)?(?:이름|제목|label|title)\s*[:：]\s*[「"']?([^」"'\n]+)[」"']?/i)
    if (colon) title = colon[1].trim()
    const toName =
      text.match(/(?:이름|제목)\s*(?:을|를)?\s*[「"']?([^」"'\n]{1,60}?)[」"']?\s*(?:으로|로)\s*(?:변경|바꿔|개명|해|줘)?/i) ||
      text.match(/rename\s+(?:slide|title)\s+to\s+[「"']?([^」"'\n]+)[」"']?/i)
    if (!title && toName) title = toName[1].trim()
    title = title
      .replace(/^(?:을|를|이|가)\s*/, '')
      .replace(/\s*(?:으로|로|변경|바꿔|개명|해|줘|주세요)\s*$/i, '')
      .replace(/[<>]/g, '')
      .slice(0, 80)
    if (!title) return null
    let index = i
    if (/현재\s*(장|슬라이드)|이\s*(장|슬라이드)|선택\s*(장|슬라이드)|this\s*slide/i.test(text)) {
      index = i
    } else {
      const num = text.match(/(?:^|\s)0*(\d+)\s*(?:번|장)/)
      if (num) {
        const n = Number(num[1])
        const byPos = n - 1
        if (byPos >= 0 && byPos < slides.length) index = byPos
        else {
          const pad = String(n).padStart(2, '0')
          const byLabel = slides.findIndex(
            (s) => String(s.label || '').startsWith(pad + ' ') || String(s.label || '').startsWith(String(n) + ' '),
          )
          if (byLabel >= 0) index = byLabel
        }
      }
    }
    return { type: 'rename', index, title, reason: 'rename #' + (index + 1) + ' → ' + title }
  }

  function askRenameSlide(index) {
    const idx = index == null ? i : index
    const slide = slides[idx]
    if (!slide) return
    const cur = baseSlideTitle(slide.label)
    const next = window.prompt('장 이름 변경 (번호는 자동: 05 …)', cur || '새 슬라이드')
    if (next == null) return
    if (!String(next).trim()) {
      setLog('이름이 비어 있습니다.', false)
      return
    }
    renameSlide(idx, next)
  }

  function setRoute(step, failed) {
    agentStatus = step
    document.querySelectorAll('#routeList li').forEach((li) => {
      const s = li.getAttribute('data-step')
      li.classList.remove('on', 'done', 'fail')
      const order = ['idle', 'thinking', 'planning', 'previewing', 'waiting_approval', 'applying', 'completed']
      const a = order.indexOf(s)
      const b = order.indexOf(step)
      if (s === step) li.classList.add(failed ? 'fail' : 'on')
      else if (a >= 0 && b >= 0 && a < b) li.classList.add('done')
    })
  }

  function setLog(msg, ok) {
    log.textContent = msg
    log.className = 'log ' + (ok === true ? 'status-ok' : ok === false ? 'status-err' : '')
  }

  function setCsUi() {
    const apply = document.getElementById('applyCs')
    const reject = document.getElementById('rejectCs')
    if (!pendingCs) {
      csBox.className = 'changeset'
      csBox.textContent = 'ChangeSet: 없음 · 슬라이드를 고르고 프롬프트를 실행하세요.'
      apply.disabled = true
      reject.disabled = true
      return
    }
    csBox.className = 'changeset proposed'
    csBox.textContent =
      'ChangeSet ' + pendingCs.id + '\n' +
      'status: ' + pendingCs.status + '\n' +
      'scope: ' + pendingCs.scope + '\n' +
      'action: ' + pendingCs.action + '\n' +
      'source: ' + pendingCs.source + '\n' +
      'reason: ' + (pendingCs.reason || '')
    apply.disabled = pendingCs.status !== 'proposed'
    reject.disabled = pendingCs.status !== 'proposed'
  }

  function slideUrl(slide, bust) {
    const ov = overrides()[slide.id]
    if (ov && ov.html) {
      return URL.createObjectURL(new Blob([ov.html], { type: 'text/html;charset=utf-8' }))
    }
    const u = new URL('slides/' + slide.file, base)
    if (bust) u.searchParams.set('t', String(Date.now()))
    return u.href
  }

  async function fetchSlideHtml(slide) {
    const ov = overrides()[slide.id]
    if (ov && ov.html) return ov.html
    const res = await fetch(new URL('slides/' + slide.file, base).href + '?t=' + Date.now())
    return await res.text()
  }

  function stageDoc() {
    try { return stage.contentDocument || (stage.contentWindow && stage.contentWindow.document) } catch (_) { return null }
  }

  function ensureRegionIds(doc) {
    if (!doc) return
    const root = doc.querySelector('.slide-container') || doc.body
    let nodes = Array.from(doc.querySelectorAll('[data-object="true"]'))
    if (!nodes.length && root) {
      nodes = Array.from(root.children).filter((el) => {
        if (el.nodeType !== 1) return false
        const st = el.getAttribute('style') || ''
        return /position\s*:\s*absolute/i.test(st) || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'DIV'
      })
      nodes.forEach((el) => {
        if (!el.getAttribute('data-object')) el.setAttribute('data-object', 'true')
        if (!el.getAttribute('data-object-type')) {
          const t = (el.textContent || '').trim()
          el.setAttribute('data-object-type', t ? 'textbox' : 'shape')
        }
      })
    }
    let n = 0
    nodes.forEach((el) => {
      if (!el.getAttribute('data-edit-id')) {
        n += 1
        el.setAttribute('data-edit-id', 'r' + n)
      }
    })
  }

  function injectRegionEditCss(doc) {
    if (!doc || doc.getElementById('osneu-region-edit-css')) return
    const style = doc.createElement('style')
    style.id = 'osneu-region-edit-css'
    style.textContent =
      'html.deck-editing [data-edit-id],html.deck-editing [data-object="true"]{cursor:pointer;outline:1px dashed rgba(188,79,43,.35);outline-offset:2px;}' +
      'html.deck-editing [data-edit-id]:hover,html.deck-editing [data-object="true"]:hover{outline-color:#E8A37E;}' +
      'html.deck-editing .region-selected{outline:2px solid #BC4F2B !important;outline-offset:3px;box-shadow:0 0 0 4px rgba(188,79,43,.2);}'
    ;(doc.head || doc.documentElement).appendChild(style)
  }

  function clearRegionSelection(doc) {
    if (!doc) return
    doc.querySelectorAll('.region-selected').forEach((el) => el.classList.remove('region-selected'))
  }

  function readRegionFields(el) {
    const cs = stage.contentWindow.getComputedStyle(el)
    const textEl = el.querySelector('h1,h2,p,li,span') || el
    return {
      id: el.getAttribute('data-edit-id') || '',
      kind: el.getAttribute('data-object-type') || 'other',
      label: el.id || el.getAttribute('data-edit-id') || 'region',
      text: (textEl.innerText || textEl.textContent || '').trim(),
      fontSize: (textEl.style && textEl.style.fontSize) || cs.fontSize || '',
      color: (textEl.style && textEl.style.color) || cs.color || '',
      fontWeight: (textEl.style && textEl.style.fontWeight) || cs.fontWeight || '',
      fontFamily: (textEl.style && textEl.style.fontFamily) || '',
      left: el.style.left || '',
      top: el.style.top || '',
      width: el.style.width || '',
      background: el.style.background || el.style.backgroundColor || '',
    }
  }

  function fillRegionPanel(fields) {
    const panel = document.getElementById('regionPanel')
    if (!panel) return
    panel.classList.add('on')
    document.getElementById('regionId').textContent = fields.id + ' · ' + fields.kind + ' · ' + fields.label
    document.getElementById('regionText').value = fields.text || ''
    document.getElementById('regionFontSize').value = fields.fontSize || ''
    document.getElementById('regionColor').value = fields.color || ''
    document.getElementById('regionWeight').value = fields.fontWeight || ''
    document.getElementById('regionLeft').value = fields.left || ''
    document.getElementById('regionTop').value = fields.top || ''
    document.getElementById('regionWidth').value = fields.width || ''
    document.getElementById('regionBg').value = fields.background || ''
    const isShape = fields.kind === 'shape' && !(fields.text || '').trim()
    document.getElementById('regionText').disabled = isShape
  }

  function selectRegionEl(el) {
    const doc = stageDoc()
    if (!doc || !el) return
    clearRegionSelection(doc)
    el.classList.add('region-selected')
    selectedEditId = el.getAttribute('data-edit-id')
    fillRegionPanel(readRegionFields(el))
    setLog('영역 선택 · ' + selectedEditId + ' · 오른쪽 패널에서만 수정 후 「영역 적용」', true)
  }

  function wireRegions() {
    const doc = stageDoc()
    if (!doc) return
    ensureRegionIds(doc)
    injectRegionEditCss(doc)
    doc.documentElement.classList.toggle('deck-editing', editMode)
    clearRegionSelection(doc)
    selectedEditId = null
    const panel = document.getElementById('regionPanel')
    if (panel && !editMode) panel.classList.remove('on')
    doc.querySelectorAll('[data-edit-id], [data-object="true"]').forEach((el) => {
      el.onclick = (e) => {
        if (!editMode) return
        e.preventDefault()
        e.stopPropagation()
        selectRegionEl(el)
      }
    })
  }

  function serializeStageHtml() {
    const doc = stageDoc()
    if (!doc || !doc.documentElement) return ''
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
  }

  function applyRegionPanel() {
    if (!editMode) { setLog('먼저 Edit 모드를 켜세요.', false); return }
    const doc = stageDoc()
    if (!doc || !selectedEditId) { setLog('수정할 영역을 슬라이드에서 클릭하세요.', false); return }
    const el = doc.querySelector('[data-edit-id="' + selectedEditId + '"]')
    if (!el) { setLog('영역을 찾을 수 없습니다.', false); return }
    const text = document.getElementById('regionText').value
    const fontSize = document.getElementById('regionFontSize').value.trim()
    const color = document.getElementById('regionColor').value.trim()
    const weight = document.getElementById('regionWeight').value.trim()
    const left = document.getElementById('regionLeft').value.trim()
    const top = document.getElementById('regionTop').value.trim()
    const width = document.getElementById('regionWidth').value.trim()
    const bg = document.getElementById('regionBg').value.trim()
    if (left) el.style.left = left
    if (top) el.style.top = top
    if (width) el.style.width = width
    if (bg) el.style.background = bg
    const kind = el.getAttribute('data-object-type') || ''
    if (kind !== 'shape' || (text || '').trim()) {
      let textEl = el.querySelector('h1,h2,p')
      if (!textEl) {
        textEl = doc.createElement('p')
        textEl.style.margin = '0'
        el.appendChild(textEl)
      }
      textEl.textContent = text
      if (fontSize) textEl.style.fontSize = fontSize
      if (color) textEl.style.color = color
      if (weight) textEl.style.fontWeight = weight
    }
    const html = serializeStageHtml()
    if (!html || html.length < 50) { setLog('직렬화 실패', false); return }
    const slide = slides[i]
    if (!slide) return
    const map = overrides()
    map[slide.id] = {
      html,
      instruction: 'region-edit:' + selectedEditId,
      source: 'region-editor',
      at: Date.now(),
    }
    saveOverrides(map)
    refreshThumb(i)
    meta.textContent = (i + 1) + ' / ' + slides.length + ' · ' + slide.label + ' · modified · region'
    setLog('영역 적용 완료 · ' + selectedEditId + '만 변경 · 다른 박스는 유지', true)
  }

  function setEditMode(on) {
    editMode = Boolean(on)
    app.classList.toggle('editing', editMode)
    const btn = document.getElementById('editModeBtn')
    if (btn) {
      btn.textContent = editMode ? 'Edit ON' : 'Edit'
      btn.classList.toggle('primary', editMode)
    }
    try { stage.style.pointerEvents = editMode ? 'auto' : '' } catch (_) {}
    wireRegions()
    setLog(
      editMode
        ? 'Edit 모드 · 슬라이드에서 영역(박스)을 클릭 → 오른쪽에서 그 영역만 수정'
        : 'Edit 모드 종료',
      true,
    )
  }

  /** srcdoc wins over src in browsers — always clear the unused channel. */
  function setStageHtml(html, onReady) {
    const ready = typeof onReady === 'function' ? onReady : () => { wireRegions(); fitScales() }
    try {
      if (stage._previewBlob) {
        URL.revokeObjectURL(stage._previewBlob)
        stage._previewBlob = ''
      }
    } catch (_) {}
    stage.onload = () => ready()
    stage.removeAttribute('src')
    // Force reload even when HTML string is identical to previous srcdoc
    stage.removeAttribute('srcdoc')
    stage.srcdoc = String(html || '')
  }

  function setStageUrl(url, onReady) {
    const ready = typeof onReady === 'function' ? onReady : () => { wireRegions(); fitScales() }
    try {
      if (stage._previewBlob) {
        URL.revokeObjectURL(stage._previewBlob)
        stage._previewBlob = ''
      }
    } catch (_) {}
    stage.onload = () => ready()
    stage.removeAttribute('srcdoc')
    stage.src = String(url || '')
  }

  function setStagePreviewHtml(html) {
    // srcdoc (not blob src) so preview replaces any previous slide and region edit works
    setStageHtml(html)
  }

  async function loadStageSlide(slide) {
    try {
      const html = await fetchSlideHtml(slide)
      setStageHtml(html)
    } catch (err) {
      setStageUrl(slideUrl(slide, true))
      setLog('스테이지 로드 폴백: ' + err, false)
    }
  }

  function fitScales() {
    thumbsEl.querySelectorAll('.thumb-frame').forEach((frame) => {
      const scaleEl = frame.querySelector('.thumb-scale')
      if (!scaleEl) return
      const w = frame.clientWidth || frame.offsetWidth || 240
      if (w < 8) return
      scaleEl.style.transform = 'scale(' + (w / 1920) + ')'
    })
    const vp = document.getElementById('viewport')
    const inner = document.getElementById('viewportInner')
    if (vp && inner) {
      const s = Math.min(vp.clientWidth / 1920, vp.clientHeight / 1080) || 0.4
      inner.style.transform = 'scale(' + s + ')'
      inner.style.left = Math.max(0, (vp.clientWidth - 1920 * s) / 2) + 'px'
      inner.style.top = Math.max(0, (vp.clientHeight - 1080 * s) / 2) + 'px'
    }
  }

  function refreshThumb(idx) {
    const btn = thumbsEl.children[idx]
    if (!btn || !slides[idx]) return
    const fr = btn.querySelector('iframe')
    if (fr) fr.src = slideUrl(slides[idx], true)
    const badge = btn.querySelector('.thumb-badge')
    if (badge) badge.textContent = overrides()[slides[idx].id] ? 'modified' : ''
  }

  function show(n) {
    if (!slides.length) return
    i = Math.max(0, Math.min(slides.length - 1, n))
    const slide = slides[i]
    selectedEditId = null
    void loadStageSlide(slide)
    meta.textContent = (i + 1) + ' / ' + slides.length + ' · ' + slide.label + ' · ' + slide.file +
      (overrides()[slide.id] ? ' · modified' : '') + (editMode ? ' · EDIT' : '')
    Array.from(thumbsEl.children).forEach((btn, idx) => btn.classList.toggle('active', idx === i))
    if (agentStatus === 'idle' || agentStatus === 'completed') setRoute('idle')
    fitScales()
  }

  function enterPresent() {
    presenting = true
    app.classList.add('presenting')
    try {
      stage.setAttribute('tabindex', '-1')
      stage.style.pointerEvents = 'none'
      if (stage.blur) stage.blur()
    } catch (_) {}
    fitScales()
    try { app.setAttribute('tabindex', '-1'); app.focus({ preventScroll: true }) } catch (_) {}
    try { if (app.requestFullscreen) void app.requestFullscreen() } catch (_) {}
    setTimeout(fitScales, 80)
    setTimeout(fitScales, 300)
  }
  function exitPresent() {
    presenting = false
    app.classList.remove('presenting')
    try { stage.style.pointerEvents = '' } catch (_) {}
    if (document.fullscreenElement) {
      try { document.exitFullscreen() } catch (_) {}
    }
    fitScales()
  }
  function presentNext() { show(i + 1) }
  function presentPrev() { show(i - 1) }

  function applyOrder(ids, opts) {
    const map = new Map(slides.map((s) => [s.id, s]))
    const next = []
    ids.forEach((id) => { if (map.has(id)) { next.push(map.get(id)); map.delete(id) } })
    map.forEach((s) => next.push(s))
    const activeId = slides[i] && slides[i].id
    slides = next.map((s, idx) => ({
      ...s,
      label: String(idx + 1).padStart(2, '0') + ' ' + String(s.label || s.id).replace(/^\d+\s*/, ''),
    }))
    saveOrder(slides.map((s) => s.id))
    renderThumbs()
    const ni = Math.max(0, slides.findIndex((s) => s.id === activeId))
    show(ni >= 0 ? ni : 0)
    if (opts && opts.log !== false) {
      setLog('슬라이드 순서 저장 · ' + slides.map((s) => s.id).join(' → '), true)
    }
  }

  function moveIndex(from, to) {
    if (from < 0 || to < 0 || from >= slides.length || to >= slides.length || from === to) return
    const ids = slides.map((s) => s.id)
    const [row] = ids.splice(from, 1)
    ids.splice(to, 0, row)
    applyOrder(ids)
  }

  function narrativeRank(id) {
    const order = [
      'cover', 'problem', 'pain', 'solution', 'product', 'market', 'audience', 'message',
      'channels', 'architecture', 'components', 'technology', 'business-model', 'model',
      'traction', 'metrics', 'financial', 'funding', 'roadmap', 'timeline', 'plan',
      'milestones', 'team', 'governance', 'risks', 'ask', 'next', 'closing', 'resources',
    ]
    const lower = String(id || '').toLowerCase()
    let best = 900
    order.forEach((k, idx) => { if (lower.includes(k)) best = Math.min(best, idx) })
    return best
  }

  function autoNarrativeOrder() {
    const ranked = slides
      .map((s, idx) => ({ id: s.id, r: narrativeRank(s.id), idx }))
      .sort((a, b) => (a.r - b.r) || (a.idx - b.idx))
    return ranked.map((r) => r.id)
  }

  function parseReorderIntent(instruction) {
    const text = String(instruction || '').trim()
    if (!text) return null
    if (/자동\s*순서|auto\s*order|narrative\s*order|순서\s*정렬/i.test(text)) {
      return { type: 'auto', order: autoNarrativeOrder() }
    }
    const coverFirst = /표지\s*를?\s*맨\s*앞|cover\s*first|표지를\s*맨\s*앞으로/i.test(text)
    if (coverFirst) {
      const ids = slides.map((s) => s.id)
      const cover = ids.find((id) => /cover|표지/.test(id)) || ids[0]
      return { type: 'move', order: [cover, ...ids.filter((id) => id !== cover)] }
    }
    const m = text.match(/(\d+)\s*번\s*(?:을|를)?\s*(\d+)\s*번\s*(?:으로|뒤로|앞에)?\s*이동/)
    if (m) {
      const from = Number(m[1]) - 1
      const to = Number(m[2]) - 1
      const ids = slides.map((s) => s.id)
      if (from >= 0 && from < ids.length && to >= 0 && to < ids.length) {
        const [row] = ids.splice(from, 1)
        ids.splice(to, 0, row)
        return { type: 'move', order: ids, from, to }
      }
    }
    const m2 = text.match(/순서\s*[:：]\s*(.+)/i)
    if (m2) {
      const tokens = m2[1].split(/[→,>\s]+/).map((t) => t.trim()).filter(Boolean)
      if (tokens.length >= 2) {
        const ids = []
        tokens.forEach((tok) => {
          const hit = slides.find((s) => s.id === tok || s.label.includes(tok) || String(s.file).includes(tok))
          if (hit && !ids.includes(hit.id)) ids.push(hit.id)
        })
        slides.forEach((s) => { if (!ids.includes(s.id)) ids.push(s.id) })
        return { type: 'list', order: ids }
      }
    }
    return null
  }

  function resolveSlideIndex(token) {
    const raw = String(token || '').trim()
    if (!raw || !slides.length) return -1
    const num = raw.match(/^0*(\d+)/)
    if (num) {
      const n = Number(num[1]) - 1
      if (n >= 0 && n < slides.length) return n
    }
    const lower = raw.toLowerCase()
    return slides.findIndex(
      (s) =>
        s.id === raw ||
        String(s.id).includes(raw) ||
        String(s.file || '').includes(raw) ||
        String(s.label || '').includes(raw) ||
        String(s.label || '').toLowerCase().includes(lower),
    )
  }

  function parseInsertIntent(instruction) {
    const text = String(instruction || '').trim()
    if (!text || !slides.length) return null
    if (!/(추가|insert|add\s+(a\s+)?slide|새\s*슬라이드|다음\s*장)/i.test(text)) return null
    if (/이동|reorder|순서\s*정렬|자동\s*순서/i.test(text) && !/추가|insert|add/i.test(text)) return null

    let title
    const titleM = text.match(/(?:제목|title)\s*[:：]\s*[「"']?([^」"'\n]+)[」"']?/i)
    if (titleM) title = titleM[1].trim().slice(0, 80)

    if (/현재\s*(장|슬라이드)|이\s*(장|슬라이드)|this\s*slide|선택\s*슬라이드/i.test(text) && /다음|after|뒤에|추가/i.test(text)) {
      return { type: 'insert-after', afterIndex: i, title, reason: 'insert after current' }
    }

    const afterNum = text.match(
      /(?:^|\s)0*(\d+)\s*(?:번)?[\s\S]{0,48}?(?:에\s*)?(?:다음|뒤)(?:\s*장)?\s*(?:에\s*)?(?:새\s*)?(?:슬라이드\s*)?추가/,
    )
    if (afterNum) {
      const idx = Number(afterNum[1]) - 1
      if (idx >= 0 && idx < slides.length) {
        return { type: 'insert-after', afterIndex: idx, title, reason: 'insert after #' + (idx + 1) }
      }
    }

    const afterEn = text.match(/insert\s+(?:a\s+)?slide\s+after\s+(\d+)/i)
    if (afterEn) {
      const idx = Number(afterEn[1]) - 1
      if (idx >= 0 && idx < slides.length) {
        return { type: 'insert-after', afterIndex: idx, title, reason: 'insert after #' + (idx + 1) }
      }
    }

    const labelAfter = text.match(
      /[「"']?([^」"'\n]{2,48}?)[」"']?\s*(?:슬라이드|장)?\s*(?:에\s*)?(?:다음|뒤)(?:\s*장)?\s*(?:에\s*)?(?:새\s*)?(?:슬라이드\s*)?추가/,
    )
    if (labelAfter) {
      const tok = labelAfter[1].replace(/^0*\d+\s*/, '').trim()
      let idx = resolveSlideIndex(tok)
      if (idx < 0) {
        const n = labelAfter[1].match(/^0*(\d+)/)
        if (n) idx = Number(n[1]) - 1
      }
      if (idx >= 0 && idx < slides.length) {
        return { type: 'insert-after', afterIndex: idx, title, reason: 'insert after ' + slides[idx].id }
      }
    }

    if (/^(?:새\s*)?(?:슬라이드|장)\s*추가$|다음\s*장\s*추가|add\s+slide\s+here/i.test(text)) {
      return { type: 'insert-after', afterIndex: i, title, reason: 'insert after current (bare)' }
    }
    return null
  }

  function blankPaperSlideHtml(title) {
    const t = String(title || '새 슬라이드').replace(/[<>]/g, '')
    const pack = String((manifest && (manifest.titleKo || manifest.title)) || packId || 'HTML Deck').replace(/[<>]/g, '')
    const accent = PAPER.colors.ember
    const paper = PAPER.colors.paper
    const ink = PAPER.colors.ink
    return '<!DOCTYPE html>\n<html lang="ko"><head><meta charset="utf-8"><title>' + t + '</title>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+KR:wght@400;700;800&display=swap" rel="stylesheet">\n' +
      '<style>:root{--paper:' + paper + ';--ink:' + ink + ';--ink-soft:#4A4D52;--ember:' + accent + ';}' +
      'body{margin:0;overflow:hidden;font-family:Inter,\'Noto Sans KR\',sans-serif;background:var(--paper);color:var(--ink);}p,h1{margin:0;}</style></head>\n<body>\n' +
      '<div class="slide-container" data-slide-key="inserted" style="position:relative;width:1920px;height:1080px;background:var(--paper);">' +
      '<div style="position:absolute;left:0;top:0;width:12px;height:1080px;background:var(--ember);"></div>' +
      '<p style="position:absolute;left:96px;top:72px;font-size:14px;font-weight:700;letter-spacing:.14em;color:var(--ember);">' + pack.toUpperCase() + ' · NEW</p>' +
      '<h1 style="position:absolute;left:96px;top:200px;width:1600px;font-size:56px;font-weight:800;line-height:1.15;">' + t + '</h1>' +
      '<p style="position:absolute;left:96px;top:360px;width:1400px;font-size:26px;line-height:1.45;color:var(--ink-soft);">플레이스홀더 · Agent로 문구·폰트 부분 수정. 레이아웃·색 유지.</p>' +
      '<ul style="position:absolute;left:96px;top:480px;margin:0;padding:0;list-style:none;width:1600px;">' +
      '<li style="margin:0 0 24px;padding-left:28px;border-left:4px solid var(--ember);font-size:26px;">요점 하나</li>' +
      '<li style="margin:0 0 24px;padding-left:28px;border-left:4px solid var(--ember);font-size:26px;">요점 둘</li>' +
      '<li style="margin:0 0 24px;padding-left:28px;border-left:4px solid var(--ember);font-size:26px;">요점 셋</li></ul>' +
      '<p style="position:absolute;left:96px;top:980px;font-size:15px;color:var(--ink-soft);">Inserted slide · editable HTML</p>' +
      '</div></body></html>'
  }

  function relabelSlides() {
    slides = slides.map((s, idx) => ({
      ...s,
      label: String(idx + 1).padStart(2, '0') + ' ' + String(s.label || s.id).replace(/^\d+\s*/, ''),
    }))
  }

  function ensureInsertGuide() {
    const chips = document.getElementById('chips')
    if (chips && !chips.querySelector('[data-insert-chip]')) {
      const specs = [
        ['다음 장 추가', '현재 장 다음에 새 슬라이드 추가'],
        ['카테고리 다음', '04 새로운 카테고리 슬라이드에 다음 장 추가'],
        ['장 이름 변경', '현재 장 제목을 제품구조로'],
      ]
      specs.forEach(([label, prompt]) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'chip'
        b.setAttribute('data-insert-chip', '1')
        b.setAttribute('data-prompt', prompt)
        b.textContent = label
        chips.appendChild(b)
      })
    }
    if (promptEl && !promptEl.dataset.insertGuide) {
      promptEl.dataset.insertGuide = '1'
      promptEl.placeholder =
        '예: 현재 장 제목을 제품구조로  ·  HTML Import  ·  이미지 그대로'
      const lab = document.querySelector('label[for="prompt"]')
      if (lab) {
        lab.textContent =
          '프롬프트 · 장이름 · 부분수정 · Edit · Import · 이미지'
      }
    }
  }

  function ensureImportControls() {
    if (imageIn) {
      imageIn.setAttribute(
        'accept',
        'image/*,.png,.jpg,.jpeg,.webp,.html,.htm,text/html',
      )
      const lab = document.querySelector('label.file-lab[for="imageIn"]') || document.querySelector('label[for="imageIn"]')
      if (lab) lab.textContent = 'Import · 이미지 또는 HTML 파일'
    }
    const chips = document.getElementById('chips')
    if (!chips) return
    if (!chips.querySelector('[data-rename-chip]')) {
      const rb = document.createElement('button')
      rb.type = 'button'
      rb.className = 'chip'
      rb.setAttribute('data-rename-chip', '1')
      rb.textContent = '장 이름…'
      rb.title = '현재 장 이름 바꾸기'
      rb.onclick = () => askRenameSlide(i)
      chips.appendChild(rb)
    }
    const specs = [
      ['HTML Import', 'HTML 파일 그대로 Import', 'html'],
      ['이미지 그대로', '이미지 픽셀 그대로(재작성 없음)', 'faithful'],
      ['이미지→HTML(근사)', '이미지에서 레이아웃 추출', 'auto'],
    ]
    specs.forEach(([label, prompt, mode]) => {
      if (chips.querySelector('[data-import-mode="' + mode + '"]')) return
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'chip'
      b.setAttribute('data-import-mode', mode)
      b.setAttribute('data-prompt', prompt)
      b.textContent = label
      chips.appendChild(b)
    })
  }

  function ensureRegionEditor() {
    const nav = document.querySelector('.topbar .navbtns') || document.querySelector('.navbtns')
    if (nav && !document.getElementById('editModeBtn')) {
      const b = document.createElement('button')
      b.type = 'button'
      b.id = 'editModeBtn'
      b.textContent = 'Edit'
      b.title = '영역별 수정 모드'
      b.onclick = () => setEditMode(!editMode)
      nav.insertBefore(b, nav.firstChild)
    }
    const body = document.querySelector('.agent-body')
    if (!body || document.getElementById('regionPanel')) return
    const panel = document.createElement('div')
    panel.id = 'regionPanel'
    panel.className = 'region-panel'
    panel.innerHTML =
      '<div class="region-title">영역 에디터 · 선택한 박스만</div>' +
      '<div class="region-id" id="regionId">슬라이드에서 영역 클릭</div>' +
      '<label>텍스트</label><textarea id="regionText" rows="4" placeholder="이 영역의 글씨만"></textarea>' +
      '<div class="region-grid">' +
      '<label>font-size<input id="regionFontSize" placeholder="48px" /></label>' +
      '<label>color<input id="regionColor" placeholder="#14181D" /></label>' +
      '<label>weight<input id="regionWeight" placeholder="800" /></label>' +
      '<label>left<input id="regionLeft" placeholder="96px" /></label>' +
      '<label>top<input id="regionTop" placeholder="100px" /></label>' +
      '<label>width<input id="regionWidth" placeholder="800px" /></label>' +
      '<label>background<input id="regionBg" placeholder="#BC4F2B" /></label>' +
      '</div>' +
      '<div class="navbtns"><button type="button" class="btn primary" id="applyRegion">영역 적용</button></div>' +
      '<p class="region-hint">방법: Edit ON → 영역 클릭 → 수정 → 영역 적용. 다른 박스는 건드리지 않음.</p>'
    const lock = document.getElementById('lockBox')
    if (lock && lock.parentNode) lock.parentNode.insertBefore(panel, lock.nextSibling)
    else body.insertBefore(panel, body.firstChild)
    document.getElementById('applyRegion').onclick = () => applyRegionPanel()
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, n | 0)).toString(16).padStart(2, '0')).join('')
  }

  function analyzeImageBitmap(img) {
    const canvas = document.createElement('canvas')
    const W = 64
    const H = 36
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, W, H)
    const data = ctx.getImageData(0, 0, W, H).data
    const buckets = new Map()
    let sumR = 0, sumG = 0, sumB = 0, n = 0
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4
        const r = data[o], g = data[o + 1], b = data[o + 2], a = data[o + 3]
        if (a < 200) continue
        sumR += r; sumG += g; sumB += b; n++
        const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
        buckets.set(key, (buckets.get(key) || 0) + 1)
      }
    }
    const palette = [...buckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key]) => {
        const r = ((key >> 8) & 0xf) * 17
        const g = ((key >> 4) & 0xf) * 17
        const b = (key & 0xf) * 17
        return rgbToHex(r, g, b)
      })
    const bg = n ? rgbToHex(sumR / n, sumG / n, sumB / n) : '#ECE3D2'
    // Region scan: 4x3 blocks for text-like contrast
    const regions = []
    const bx = 4, by = 3
    for (let gy = 0; gy < by; gy++) {
      for (let gx = 0; gx < bx; gx++) {
        let minL = 255, maxL = 0, count = 0, sr = 0, sg = 0, sb = 0
        const x0 = Math.floor((gx * W) / bx)
        const x1 = Math.floor(((gx + 1) * W) / bx)
        const y0 = Math.floor((gy * H) / by)
        const y1 = Math.floor(((gy + 1) * H) / by)
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const o = (y * W + x) * 4
            const r = data[o], g = data[o + 1], b = data[o + 2]
            const L = 0.2126 * r + 0.7152 * g + 0.0722 * b
            minL = Math.min(minL, L); maxL = Math.max(maxL, L)
            sr += r; sg += g; sb += b; count++
          }
        }
        const contrast = maxL - minL
        const left = Math.round((gx / bx) * 1920)
        const top = Math.round((gy / by) * 1080)
        const width = Math.round((1 / bx) * 1920)
        const height = Math.round((1 / by) * 1080)
        regions.push({
          left, top, width, height,
          contrast,
          avg: count ? rgbToHex(sr / count, sg / count, sb / count) : bg,
          likelyText: contrast > 28,
          fontSize: Math.max(18, Math.min(72, Math.round(height * 0.18))),
        })
      }
    }
    const ink = palette.find((c) => c.toLowerCase() !== bg.toLowerCase()) || '#14181D'
    const accent = palette[1] || palette[0] || '#BC4F2B'
    return {
      width: img.naturalWidth || img.width || 1920,
      height: img.naturalHeight || img.height || 1080,
      background: bg,
      ink,
      accent,
      soft: palette[2] || '#4A4D52',
      palette,
      regions: regions.filter((r) => r.likelyText).slice(0, 6),
      fontFamily: PAPER.fonts,
    }
  }

  function ensureOrigBar() {
    let bar = document.getElementById('origBar')
    if (bar) return bar
    const body = document.querySelector('.agent-body')
    if (!body) return null
    bar = document.createElement('div')
    bar.id = 'origBar'
    bar.className = 'orig-bar'
    bar.innerHTML =
      '<span id="origHint">원본 슬라이드 후보</span>' +
      '<button type="button" id="openOrigSlide">원본 HTML 열기</button>'
    const fileLab = body.querySelector('.file-lab') || imageIn
    if (fileLab && fileLab.parentNode) fileLab.parentNode.insertBefore(bar, fileLab)
    else body.appendChild(bar)
    document.getElementById('openOrigSlide').onclick = () => openOriginalSlide()
    return bar
  }

  function showOrigBar(matchId, note) {
    const bar = ensureOrigBar()
    if (!bar) return
    bar.classList.add('on')
    bar.dataset.slideId = matchId || ''
    const hint = document.getElementById('origHint')
    if (hint) {
      hint.textContent = note || (matchId
        ? '원본 후보: ' + matchId + ' · Reject 후 이 버튼으로 이동'
        : 'Reject 후 원본 후보가 있으면 여기로')
    }
  }

  function hideOrigBar() {
    const bar = document.getElementById('origBar')
    if (bar) {
      bar.classList.remove('on')
      bar.dataset.slideId = ''
    }
  }

  function openOriginalSlide(explicitId) {
    const bar = document.getElementById('origBar')
    const id = explicitId || (bar && bar.dataset.slideId) || (pendingCs && pendingCs.matchedSlideId) || ''
    if (!id) {
      setLog('원본 슬라이드 id가 없습니다. PSST 풀 팩에서 product-structure 를 직접 고르세요.', false)
      return
    }
    const idx = slides.findIndex((s) => s.id === id || s.file === id || s.file === id + '.html' || String(s.label || '').includes(id))
    if (idx >= 0) {
      show(idx)
      setLog('원본 슬라이드 열림 · ' + slides[idx].label + ' · 이후 Agent로 폰트/글자 부분 수정', true)
      return
    }
    // Cross-pack: load known PSST file into stage even if not in current manifest
    const file = id.endsWith('.html') ? id : id + '.html'
    setStageUrl('/psst-ir-pack/slides/' + file + '?t=' + Date.now())
    setLog('원본 HTML 스테이지 로드 · /psst-ir-pack/slides/' + file + '\nPSST 풀 팩 Decks에서 같은 장을 열면 썸네일·Agent 전체가 연결됩니다.', true)
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Pixel-faithful: keep the bitmap (no Vision rewrite).
   * contain = no stretch (뭉개짐 방지) · ~16:9면 fill.
   */
  function faithfulImageHtml(dataUrl, fileName, naturalW, naturalH) {
    const safe = String(dataUrl || '').replace(/"/g, '')
    const label = String(fileName || 'import').replace(/[<>]/g, '')
    const nw = Number(naturalW) || 0
    const nh = Number(naturalH) || 0
    const slideAr = 1920 / 1080
    const imgAr = nw > 0 && nh > 0 ? nw / nh : slideAr
    const near169 = Math.abs(imgAr - slideAr) / slideAr < 0.03
    const fit = near169 ? 'fill' : 'contain'
    const imgStyle = fit === 'contain'
      ? 'position:absolute;left:0;top:0;right:0;bottom:0;margin:auto;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;z-index:1;'
      : 'position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:fill;z-index:1;'
    return '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>' + label + '</title>' +
      '<style>body{margin:0;overflow:hidden;background:#ECE3D2;}</style></head><body>' +
      '<div class="slide-container" data-import="faithful-image" data-fit="' + fit + '" data-object="true" data-object-type="shape" data-edit-id="r1" ' +
      'style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#ECE3D2;">' +
      '<img alt="" src="' + safe + '" style="' + imgStyle + '" />' +
      '</div></body></html>'
  }

  function normalizeImportedHtml(raw) {
    let html = String(raw || '').trim()
    if (!html) return ''
    // Soft sanitize: drop remote beacons / module scripts that break offline preview
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    if (!/<html[\s>]/i.test(html) && /slide-container/i.test(html)) {
      html = '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>Imported</title></head><body>' +
        html + '</body></html>'
    }
    if (!/<!DOCTYPE/i.test(html) && /<html/i.test(html)) {
      html = '<!DOCTYPE html>\n' + html
    }
    return html
  }

  function isHtmlFile(file) {
    if (!file) return false
    const name = String(file.name || '').toLowerCase()
    const type = String(file.type || '').toLowerCase()
    return type.includes('html') || name.endsWith('.html') || name.endsWith('.htm')
  }

  function isImageFile(file) {
    if (!file) return false
    const name = String(file.name || '').toLowerCase()
    const type = String(file.type || '').toLowerCase()
    return type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(name)
  }

  function hybridImageHtml(dataUrl, analysis, title, originalHint) {
    const regions = (analysis.regions.length ? analysis.regions : [{ left: 96, top: 200, width: 1400, height: 120, fontSize: 48 }]).slice(0, 5)
    const overlays = regions.map((r, idx) => {
      const label = idx === 0 ? (title || '제목 · 폰트 수정 가능') : ('텍스트 ' + (idx + 1) + ' · Agent로 교체')
      return '<p contenteditable="true" data-edit="1" style="position:absolute;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;margin:0;padding:8px;font-size:' + r.fontSize + 'px;font-weight:' + (idx === 0 ? 800 : 600) + ';line-height:1.25;color:' + analysis.ink + ';font-family:' + analysis.fontFamily + ';background:rgba(236,227,210,.72);border:1px dashed ' + analysis.accent + ';z-index:5;">' + label.replace(/[<>]/g, '') + '</p>'
    }).join('\n')
    const hint = originalHint
      ? '<p style="position:absolute;left:96px;top:1000px;margin:0;font-size:14px;color:' + analysis.accent + ';z-index:6;">원본 후보: ' + originalHint + ' · Reject 후 「원본 HTML 열기」</p>'
      : '<p style="position:absolute;left:96px;top:1000px;margin:0;font-size:14px;color:' + analysis.soft + ';z-index:6;">Vision 실패 · 배경=스크린샷 · 오버레이 텍스트만 폰트 편집</p>'
    return '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>Image hybrid</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+KR:wght@400;700;800&display=swap" rel="stylesheet">' +
      '<style>body{margin:0;overflow:hidden;background:' + analysis.background + ';font-family:' + analysis.fontFamily + ';}</style></head><body>' +
      '<div class="slide-container" data-import="hybrid" style="position:relative;width:1920px;height:1080px;overflow:hidden;background:' + analysis.background + ';">' +
      '<img alt="" src="' + dataUrl.replace(/"/g, '') + '" style="position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:fill;z-index:1;opacity:.92;" />' +
      overlays + hint + '</div></body></html>'
  }

  async function officeHeaders() {
    const headers = { 'content-type': 'application/json' }
    try {
      const boot = await fetch('/api/ui-session', { method: 'GET' })
      const tok = boot.headers.get('x-osneu-ui') || ''
      if (tok.trim()) headers['x-osneu-ui'] = tok.trim()
      else {
        const row = await boot.json().catch(() => null)
        if (row && (row.token || row.uiToken)) headers['x-osneu-ui'] = String(row.token || row.uiToken)
      }
    } catch (_) {}
    return headers
  }

  async function visionImageToHtml(dataUrl, analysis, instruction) {
    const model =
      localStorage.getItem('os.neu.officeModel') ||
      localStorage.getItem('os.neu.mvp.model') ||
      'gpt-4o'
    const packHints = slides.slice(0, 24).map((s) => ({ id: s.id, file: s.file, label: s.label }))
    try {
      const res = await fetch('/api/office/image-to-html', {
        method: 'POST',
        headers: await officeHeaders(),
        body: JSON.stringify({
          image: dataUrl,
          model,
          instruction: instruction || 'Rebuild screenshot as editable 1920x1080 HTML. Real text nodes so fonts can be edited later.',
          packHints,
          analysis: {
            background: analysis.background,
            ink: analysis.ink,
            accent: analysis.accent,
            palette: analysis.palette,
          },
        }),
        signal: AbortSignal.timeout(180000),
      })
      const row = await res.json()
      return row
    } catch (err) {
      return { ok: false, reason: err && err.name === 'TimeoutError' ? 'timeout' : 'network' }
    }
  }

  async function readCurrentBeforeHtml(slide) {
    try {
      const ov = overrides()[slide.id]
      if (ov && ov.html) return ov.html
      return await (await fetch(new URL('slides/' + slide.file, base))).text()
    } catch (_) {
      return ''
    }
  }

  async function proposeImportedHtml(opts) {
    const slide = slides[i]
    if (!slide) throw new Error('no-slide')
    const beforeHtml = await readCurrentBeforeHtml(slide)
    const afterHtml = opts.afterHtml
    if (!afterHtml || afterHtml.length < 40) throw new Error('empty-html')
    pendingCs = {
      id: opts.id || ('cs-imp-' + Date.now().toString(36)),
      scope: 'slide',
      slideId: slide.id,
      file: slide.file,
      action: opts.action || 'IMPORT_FILE',
      beforeHtml,
      afterHtml,
      reason: opts.reason || '',
      source: opts.source || 'import',
      status: 'proposed',
      at: Date.now(),
      matchedSlideId: opts.matchedSlideId || null,
      imageName: opts.fileName || '',
      imageSize: opts.fileSize || 0,
    }
    if (opts.matchedSlideId) showOrigBar(opts.matchedSlideId, '원본 후보 · ' + opts.matchedSlideId)
    setStagePreviewHtml(afterHtml)
    setRoute('waiting_approval')
    setCsUi()
    setLog(opts.log || ('Import ChangeSet · source: ' + pendingCs.source), true)
  }

  async function importHtmlFile(file) {
    if (!file) return
    pendingCs = null
    setCsUi()
    hideOrigBar()
    setRoute('thinking')
    const stamp = Date.now().toString(36)
    setLog('HTML 파일 Import · 그대로 읽기 · ' + (file.name || 'slide.html') + ' · #' + stamp, true)
    try {
      const raw = await file.text()
      const afterHtml = normalizeImportedHtml(raw)
      if (!afterHtml || afterHtml.length < 80) throw new Error('HTML이 비었거나 너무 짧음')
      if (!/slide-container|1920|position\s*:\s*absolute/i.test(afterHtml)) {
        setLog('경고: 1920 슬라이드 마크업이 약함 · 그래도 파일 내용 그대로 제안', false)
      }
      setRoute('planning')
      await proposeImportedHtml({
        id: 'cs-html-' + stamp,
        action: 'HTML_IMPORT',
        afterHtml,
        source: 'html-import',
        reason: 'HTML 파일 그대로 Import · ' + (file.name || ''),
        fileName: file.name || '',
        fileSize: file.size || 0,
        log:
          'HTML Import ChangeSet · 변환 없음 · file: ' + (file.name || '') + '\n' +
          'Apply = 현재 장에 파일 내용 그대로 반영 · Reject = 변경 없음',
      })
    } catch (err) {
      setRoute('completed', true)
      setLog('HTML Import 실패: ' + err, false)
    } finally {
      importMode = 'auto'
      try { if (imageIn) imageIn.value = '' } catch (_) {}
    }
  }

  async function importImageFile(file) {
    if (!file) return
    pendingCs = null
    setCsUi()
    hideOrigBar()
    setRoute('thinking')
    const stamp = Date.now().toString(36)
    const mode = importMode === 'faithful' ? 'faithful' : 'auto'
    setLog(
      '이미지 → HTML · mode=' + mode + ' · ' + (file.name || 'image') +
      ' · ' + Math.round((file.size || 0) / 1024) + 'KB · #' + stamp,
      true,
    )
    const blobUrl = URL.createObjectURL(file)
    try {
      const dataUrl = await fileToDataUrl(file)
      const img = new Image()
      img.decoding = 'async'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = blobUrl
      })
      if (mode === 'faithful') {
        setRoute('planning')
        const afterHtml = faithfulImageHtml(
          dataUrl,
          file.name,
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
        )
        await proposeImportedHtml({
          id: 'cs-img-f-' + stamp,
          action: 'IMAGE_FAITHFUL',
          afterHtml,
          source: 'image-faithful',
          reason:
            '비트맵 그대로(Vision 없음) · ' +
            (img.naturalWidth || '?') + '×' + (img.naturalHeight || '?') +
            ' · ' + (file.name || ''),
          fileName: file.name || '',
          fileSize: file.size || 0,
          matchedSlideId: null,
          log:
            '이미지 그대로 · 뭉개짐 방지(비율 유지 contain / 16:9면 fill)\n' +
            '글자는 아직 개별 Edit 불가 · 편집 HTML이 필요하면 HTML Import',
        })
        return
      }

      setRoute('planning')
      const analysis = analyzeImageBitmap(img)
      const creamDark = (() => {
        const bg = String(analysis.background || '').toLowerCase()
        const palette = (analysis.palette || []).map((c) => String(c).toLowerCase())
        const cream = /^#e[0-9a-f]{5}$/i.test(bg) || palette.some((c) => c.includes('ece') || c.includes('e8e') || /^#e[89a-f]/i.test(c))
        const dark = palette.some((c) => /^#1[0-9a-f]{5}$/i.test(c) || /^#2[0-9a-f]{5}$/i.test(c) || c === '#111112' || c === '#222222')
        return cream && dark
      })()

      setLog('Vision 재구성 요청 중… (픽셀 그대로가 아님 · 근사 HTML)')
      const vision = await visionImageToHtml(dataUrl, analysis, promptEl.value || '')
      let afterHtml = ''
      let source = 'image-analyzer'
      let reason = ''
      let matchedSlideId = (vision && vision.matchedSlideId) || (creamDark ? 'differentiation-moat' : null)

      if (vision && vision.ok && vision.html && vision.html.length > 400 && vision.source !== 'pack-original') {
        afterHtml = vision.html
        source = vision.source || 'vision'
        reason = vision.reason || 'Vision HTML (근사 · 원본 PNG와 다를 수 있음)'
        matchedSlideId = vision.matchedSlideId || matchedSlideId
      } else if (vision && vision.ok && vision.html && vision.source === 'pack-original') {
        afterHtml = hybridImageHtml(dataUrl, analysis, file.name.replace(/\.[^.]+$/, ''), matchedSlideId || '')
        source = 'hybrid-over-pack-hint'
        reason = '팩 힌트만 · hybrid(이번 이미지). 픽셀 그대로는 칩 「이미지 그대로」.'
        matchedSlideId = vision.matchedSlideId || matchedSlideId
      } else {
        afterHtml = hybridImageHtml(dataUrl, analysis, file.name.replace(/\.[^.]+$/, ''), matchedSlideId || '')
        source = 'hybrid-fallback:' + ((vision && vision.reason) || 'no-vision')
        reason = 'Vision 미가용 · hybrid. 픽셀 그대로는 「이미지 그대로」 · 편집 HTML은 파일 Import.'
      }

      await proposeImportedHtml({
        id: 'cs-img-' + stamp,
        action: 'IMAGE_TO_HTML',
        afterHtml,
        source,
        reason,
        matchedSlideId: matchedSlideId || null,
        fileName: file.name || '',
        fileSize: file.size || 0,
        log:
          '이미지 → HTML ChangeSet · source: ' + source + ' · file: ' + (file.name || '') + '\n' +
          '※ Vision/hybrid는 근사본이라 원본 PNG와 달라질 수 있음\n' +
          (matchedSlideId ? '원본 링크: ' + matchedSlideId + ' · Reject 후 「원본 HTML 열기」\n' : '') +
          '픽셀 유지: 칩 「이미지 그대로」 · 편집 가능 원본: HTML Import / 팩 슬라이드',
      })
    } catch (err) {
      setRoute('completed', true)
      setLog('이미지 분석 실패: ' + err, false)
    } finally {
      importMode = 'auto'
      try { URL.revokeObjectURL(blobUrl) } catch (_) {}
      try { if (imageIn) imageIn.value = '' } catch (_) {}
    }
  }

  async function importSlideFile(file) {
    if (!file) return
    if (isHtmlFile(file) || importMode === 'html') {
      importMode = 'html'
      return importHtmlFile(file)
    }
    if (isImageFile(file)) return importImageFile(file)
    setLog('지원 형식: .html / .htm / 이미지(png·jpg·webp)', false)
    importMode = 'auto'
  }

  function applyOps(html, ops) {
    let out = html
    for (const row of ops || []) {
      const op = String(row.op || row.type || '').toLowerCase()
      if (op === 'replace' || op === 'replace_text') {
        const find = String(row.find || row.from || '')
        const rep = String(row.replace || row.to || '')
        if (find) out = out.split(find).join(rep)
      } else if (op === 'delete_contains' || op === 'delete') {
        const find = String(row.text || row.find || '')
        if (find) out = out.split(find).join('')
      } else if (op === 'delete_regex') {
        try { out = out.replace(new RegExp(String(row.pattern || ''), String(row.flags || 'g')), '') } catch (_) {}
      }
    }
    return out
  }

  function extractOpsPayload(text) {
    if (!text) return null
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const raw = (fence ? fence[1] : text).trim()
    try {
      const j = JSON.parse(raw.match(/\{[\s\S]*\}/)[0])
      if (j && Array.isArray(j.ops) && j.ops.length) return j
      if (j && j.changeset && Array.isArray(j.changeset.ops)) return j.changeset
    } catch (_) {}
    return null
  }

  function extractHtmlFromModel(text) {
    if (!text) return null
    const fence = text.match(/```html\s*([\s\S]*?)```/i)
    if (fence) return fence[1].trim()
    const doc = text.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i)
    if (doc) return doc[1].trim()
    return null
  }

  function wantsFullRewrite(instruction) {
    return /전체\s*재작성|full\s*rewrite|rewrite\s*whole|슬라이드\s*전체/i.test(instruction || '')
  }

  function localPatch(html, instruction) {
    let out = html
    let action = 'REWRITE_CONTENT'
    const lower = instruction.toLowerCase()
    if (/lock|ai os|operating system|독립\s*os|usb/.test(lower)) {
      action = 'REPLACE_TEXT'
      out = out
        .replace(/AI Operating System/gi, 'Trusted Agent Seat')
        .replace(/AI desktop operating system/gi, 'Trusted Agent Seat')
        .replace(/검색 운영체제/g, 'Intent-first Trusted Agent Seat')
    }
    if (/짧게|shorten/.test(instruction)) {
      out = out.replace(/font-size:(\d+)px/g, (_, n) => 'font-size:' + Math.max(14, Math.round(Number(n) * 0.92)) + 'px')
    }
    const stamp = '<!-- html-deck-agent:' + instruction.replace(/--/g, '—').slice(0, 160) + ' -->'
    if (!out.includes('html-deck-agent:')) out = out.replace('<body>', '<body>\n' + stamp)
    return { html: out, action }
  }

  function localSurgical(html, instruction) {
    const m = instruction.match(/삭제\s*[:：]\s*[「"'](.+?)[」"']/)
    const m2 = instruction.match(/delete\s*[:：]\s*[「"'](.+?)[」"']/i)
    const quoted = (m && m[1]) || (m2 && m2[1]) || ''
    if (quoted) {
      return { html: applyOps(html, [{ op: 'delete_contains', text: quoted }]), action: 'REPLACE_TEXT', source: 'local-quote-delete' }
    }
    return { ...localPatch(html, instruction), source: 'local-lock-patch' }
  }

  async function seatRewrite(slide, instruction, beforeHtml) {
    const model =
      localStorage.getItem('os.neu.officeModel') ||
      localStorage.getItem('os.neu.mvp.model') ||
      'local'
    const full = wantsFullRewrite(instruction)
    const systemHint = full
      ? 'You may return full HTML only because user asked for whole-slide rewrite. Keep 1920x1080. Return ```html ...```. Never invent revenue/USB-shipped/AI OS claims.'
      : 'SURGICAL EDIT ONLY. Do NOT return a full HTML page. Return JSON only: ' +
        '{"version":1,"action":"REPLACE_TEXT","ops":[{"op":"replace","find":"...","replace":"..."},{"op":"delete_contains","text":"..."}],"reason":"..."}. ' +
        'Preserve layout. LOCK: Trusted Agent Seat / Agent Operating Layer.'
    const content = beforeHtml.length > 28000 ? beforeHtml.slice(0, 28000) + '\n<!-- truncated -->' : beforeHtml
    try {
      const headers = { 'content-type': 'application/json' }
      try {
        const boot = await fetch('/api/ui-session', { method: 'GET' })
        const tok = boot.headers.get('x-osneu-ui') || ''
        if (tok.trim()) headers['x-osneu-ui'] = tok.trim()
        else {
          const row = await boot.json().catch(() => null)
          if (row && (row.token || row.uiToken)) headers['x-osneu-ui'] = String(row.token || row.uiToken)
        }
      } catch (_) {}
      const res = await fetch('/api/office/assist', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          app: 'slides',
          model,
          mode: 'rewrite',
          instruction: systemHint + '\n\nUser instruction:\n' + instruction + '\n\nSlide id: ' + slide.id,
          content,
          title: 'HTML Deck · ' + slide.label,
        }),
        signal: AbortSignal.timeout(130000),
      })
      const row = await res.json()
      if (!row || !row.ok || !row.text) return { ok: false, reason: (row && row.reason) || 'seat-failed' }
      if (!full) {
        const payload = extractOpsPayload(row.text)
        if (payload && payload.ops) {
          const after = applyOps(beforeHtml, payload.ops)
          if (after === beforeHtml) return { ok: false, reason: 'ops-no-change' }
          return { ok: true, html: after, source: 'seat-ops:' + (row.model || model), action: payload.action || 'REPLACE_TEXT', reason: payload.reason || 'Surgical ops' }
        }
        if (extractHtmlFromModel(row.text)) return { ok: false, reason: 'full-html-rejected' }
        return { ok: false, reason: 'no-ops-in-reply' }
      }
      const after = extractHtmlFromModel(row.text)
      if (!after || after.length < 200) return { ok: false, reason: 'no-html-in-reply' }
      return { ok: true, html: after, source: 'seat-full:' + (row.model || model), action: 'REWRITE_CONTENT', reason: 'Whole-slide rewrite' }
    } catch (err) {
      return { ok: false, reason: err && err.name === 'TimeoutError' ? 'timeout' : 'network' }
    }
  }

  async function proposeChange(instruction) {
    const rename = parseRenameIntent(instruction)
    if (rename && rename.type === 'rename') {
      setRoute('thinking')
      const ok = renameSlide(rename.index, rename.title)
      setRoute(ok ? 'completed' : 'completed', !ok)
      if (ok) setRoute('idle')
      return
    }
    const insert = parseInsertIntent(instruction)
    if (insert && insert.type === 'insert-after') {
      setRoute('thinking')
      const after = slides[insert.afterIndex]
      const title = insert.title || '새 슬라이드'
      const newId = 'inserted-' + Date.now().toString(36)
      const afterHtml = blankPaperSlideHtml(title)
      pendingCs = {
        id: 'cs-ins-' + Date.now().toString(36),
        scope: 'deck-insert',
        slideId: newId,
        file: newId + '.html',
        action: 'INSERT_SLIDE',
        beforeHtml: '',
        afterHtml,
        reason: instruction.slice(0, 160),
        source: 'insert:' + insert.reason,
        status: 'proposed',
        at: Date.now(),
        afterIndex: insert.afterIndex,
        newSlide: {
          id: newId,
          file: newId + '.html',
          label: title,
          inserted: true,
        },
      }
      setStagePreviewHtml(afterHtml)
      setRoute('waiting_approval')
      setCsUi()
      setLog(
        '새 슬라이드 ChangeSet 제안 · Apply 시 ' +
          (after ? after.label : '#' + (insert.afterIndex + 1)) +
          ' 다음에 삽입\n제목: ' + title + '\n(Reject면 추가 없음)',
        true,
      )
      return
    }
    const reorder = parseReorderIntent(instruction)
    if (reorder && reorder.order) {
      setRoute('thinking')
      pendingCs = {
        id: 'cs-ord-' + Date.now().toString(36),
        scope: 'deck-order',
        slideId: '*',
        file: '',
        action: 'REORDER_SLIDES',
        beforeHtml: '',
        afterHtml: '',
        reason: instruction.slice(0, 160),
        source: 'reorder:' + reorder.type,
        status: 'proposed',
        at: Date.now(),
        order: reorder.order,
      }
      setRoute('waiting_approval')
      setCsUi()
      setLog('순서 ChangeSet 제안 · Apply 시 덱 이동\n' + reorder.order.join(' → '), true)
      return
    }
    if (/HTML\s*파일\s*그대로|HTML\s*Import|html\s*import|\.html\s*가져/i.test(instruction || '')) {
      importMode = 'html'
      setLog('HTML 파일을 선택하세요 · 변환 없이 그대로 Import.', true)
      pickImageForImport()
      return
    }
    if (/이미지\s*픽셀\s*그대로|이미지\s*그대로|재작성\s*없음|faithful/i.test(instruction || '')) {
      importMode = 'faithful'
      setLog('이미지 파일을 선택하세요 · 픽셀 그대로(글자 재작성 없음).', true)
      pickImageForImport()
      return
    }
    if (/이미지|image\s*→|image\s*to\s*html|레이아웃\s*추출/i.test(instruction || '')) {
      importMode = 'auto'
      setLog('이미지 파일을 선택하세요 (Vision 근사 · 원본과 다를 수 있음).', true)
      pickImageForImport()
      return
    }

    const slide = slides[i]
    if (!slide) return
    if (!instruction.trim()) { setLog('프롬프트를 입력하세요.', false); return }
    pendingCs = null
    setCsUi()
    setRoute('thinking')
    setLog('thinking · 선택 슬라이드 HTML 로드…')
    let beforeHtml = ''
    try {
      const ov = overrides()[slide.id]
      if (ov && ov.html) beforeHtml = ov.html
      else beforeHtml = await (await fetch(new URL('slides/' + slide.file, base))).text()
    } catch (err) {
      setRoute('completed', true)
      setLog('로드 실패: ' + err, false)
      return
    }
    setRoute('planning')
    let result = await seatRewrite(slide, instruction, beforeHtml)
    if (!result.ok) {
      setLog('Seat 실패 (' + result.reason + ') · 로컬 부분 수정 폴백…')
      const local = localSurgical(beforeHtml, instruction)
      result = { ok: true, html: local.html, source: local.source, action: local.action, reason: 'Local surgical / LOCK patch' }
    }
    setRoute('previewing')
    pendingCs = {
      id: 'cs-' + Date.now().toString(36),
      scope: 'slide',
      slideId: slide.id,
      file: slide.file,
      action: result.action || 'REWRITE_CONTENT',
      beforeHtml,
      afterHtml: result.html,
      reason: result.reason || instruction.slice(0, 120),
      source: result.source || 'unknown',
      status: 'proposed',
      at: Date.now(),
    }
    try { sessionStorage.setItem(csKey(), JSON.stringify({ id: pendingCs.id, slideId: pendingCs.slideId, status: 'proposed' })) } catch (_) {}
    setStagePreviewHtml(pendingCs.afterHtml)
    setRoute('waiting_approval')
    setCsUi()
    setLog('ChangeSet proposed · Apply / Reject\nsource: ' + pendingCs.source, true)
  }

  function applyChange() {
    if (!pendingCs || pendingCs.status !== 'proposed') return
    setRoute('applying')
    if (pendingCs.action === 'INSERT_SLIDE' && pendingCs.newSlide) {
      const row = pendingCs.newSlide
      const afterIndex = Math.max(0, Math.min(slides.length - 1, Number(pendingCs.afterIndex) || 0))
      const map = overrides()
      map[row.id] = {
        html: pendingCs.afterHtml,
        instruction: pendingCs.reason,
        changesetId: pendingCs.id,
        source: pendingCs.source,
        inserted: true,
        at: Date.now(),
      }
      saveOverrides(map)
      const extras = savedExtras().filter((e) => e && e.id !== row.id)
      extras.push({ id: row.id, file: row.file, label: row.label })
      saveExtras(extras)
      slides.splice(afterIndex + 1, 0, { id: row.id, file: row.file, label: row.label, inserted: true })
      relabelSlides()
      saveOrder(slides.map((s) => s.id))
      renderThumbs()
      const ni = afterIndex + 1
      show(ni)
      pendingCs.status = 'applied'
      setRoute('completed')
      setLog('새 슬라이드 Apply 완료 · ' + (afterIndex + 2) + '번째 · ' + row.label + '\n이제 Agent로 문구·폰트 부분 수정 가능', true)
      pendingCs = null
      setCsUi()
      return
    }
    if (pendingCs.action === 'REORDER_SLIDES' && pendingCs.order) {
      applyOrder(pendingCs.order)
      pendingCs.status = 'applied'
      setRoute('completed')
      setLog('순서 Apply 완료', true)
      pendingCs = null
      setCsUi()
      return
    }
    const map = overrides()
    map[pendingCs.slideId] = {
      html: pendingCs.afterHtml,
      instruction: pendingCs.reason,
      changesetId: pendingCs.id,
      source: pendingCs.source,
      at: Date.now(),
    }
    saveOverrides(map)
    pendingCs.status = 'applied'
    const idx = slides.findIndex((s) => s.id === pendingCs.slideId)
    if (idx >= 0) refreshThumb(idx)
    show(i)
    setRoute('completed')
    setLog('Apply 완료 · ' + pendingCs.slideId, true)
    pendingCs = null
    setCsUi()
  }

  function rejectChange() {
    if (!pendingCs) return
    const matched = pendingCs.matchedSlideId
    const wasImage = pendingCs.action === 'IMAGE_TO_HTML'
    pendingCs.status = 'rejected'
    setRoute('completed', true)
    pendingCs = null
    setCsUi()
    show(i)
    if (wasImage && matched) {
      showOrigBar(matched, 'Reject 완료 · 원본 「' + matched + '」 열기')
      setLog('Reject · 변경 없음. 원본 슬라이드 링크 준비됨 → 「원본 HTML 열기」', false)
      // Auto-jump to pack original when it exists in this deck
      const idx = slides.findIndex((s) => s.id === matched || s.file === matched + '.html')
      if (idx >= 0) {
        show(idx)
        setLog('Reject → 원본 슬라이드로 이동 · ' + slides[idx].label + '\n폰트/글자는 Agent 부분 수정으로.', true)
      }
    } else {
      hideOrigBar()
      setLog('Reject · 덱 변경 없음', false)
    }
    setRoute('idle')
  }

  function bindThumbDrag(btn, idx) {
    btn.draggable = true
    btn.addEventListener('dragstart', (e) => {
      dragFrom = idx
      btn.classList.add('dragging')
      try {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(idx))
      } catch (_) {}
    })
    btn.addEventListener('dragend', () => {
      btn.classList.remove('dragging')
      Array.from(thumbsEl.children).forEach((el) => el.classList.remove('drag-over'))
      dragFrom = -1
    })
    btn.addEventListener('dragover', (e) => {
      e.preventDefault()
      btn.classList.add('drag-over')
      try { e.dataTransfer.dropEffect = 'move' } catch (_) {}
    })
    btn.addEventListener('dragleave', () => btn.classList.remove('drag-over'))
    btn.addEventListener('drop', (e) => {
      e.preventDefault()
      btn.classList.remove('drag-over')
      const from = dragFrom >= 0 ? dragFrom : Number((e.dataTransfer && e.dataTransfer.getData('text/plain')) || -1)
      const to = Array.from(thumbsEl.children).indexOf(btn)
      if (from >= 0 && to >= 0 && from !== to) moveIndex(from, to)
    })
  }

  function renderThumbs() {
    thumbsEl.innerHTML = ''
    slides.forEach((slide, idx) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'thumb' + (idx === i ? ' active' : '')
      btn.dataset.slideId = slide.id
      btn.innerHTML =
        '<div class="thumb-frame"><div class="thumb-scale"><iframe loading="lazy" sandbox="allow-same-origin" tabindex="-1" title=""></iframe></div></div>' +
        '<div class="thumb-label"><span class="thumb-badge"></span></div>'
      btn.querySelector('.thumb-label').insertAdjacentText('afterbegin', slide.label)
      if (overrides()[slide.id]) btn.querySelector('.thumb-badge').textContent = 'modified'
      const fr = btn.querySelector('iframe')
      fr.addEventListener('load', () => fitScales())
      if (idx < 8) fr.src = slideUrl(slide, false)
      else fr.dataset.src = slideUrl(slide, false)
      btn.addEventListener('click', () => show(idx))
      btn.addEventListener('dblclick', (e) => {
        e.preventDefault()
        e.stopPropagation()
        askRenameSlide(idx)
      })
      btn.title = (slide.label || '') + ' · 더블클릭=이름 변경'
      bindThumbDrag(btn, idx)
      thumbsEl.appendChild(btn)
    })
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        const fr = en.target.querySelector('iframe')
        if (fr && fr.dataset.src && !fr.getAttribute('src')) {
          fr.src = fr.dataset.src
          delete fr.dataset.src
        }
        fitScales()
      })
    }, { root: thumbsEl, rootMargin: '160px' })
    Array.from(thumbsEl.children).forEach((btn) => io.observe(btn))
  }

  async function exportCream() {
    setLog('크림 내보내기 준비…')
    const recipe = { version: 1, title: (manifest && (manifest.titleKo || manifest.title)) || 'HTML Deck', slides: [] }
    for (const slide of slides.slice(0, 20)) {
      let html = ''
      try {
        const ov = overrides()[slide.id]
        html = ov && ov.html ? ov.html : await (await fetch(new URL('slides/' + slide.file, base))).text()
      } catch (_) { html = '' }
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      const title = (tmp.querySelector('h1') && tmp.querySelector('h1').textContent.trim()) || slide.label
      const paras = Array.from(tmp.querySelectorAll('p')).map((p) => p.textContent.trim()).filter(Boolean).slice(0, 6)
      recipe.slides.push({
        layout: paras.length ? 'bullets' : 'title',
        title: title.slice(0, 120),
        body: paras.join('\n'),
        bullets: paras,
        table: null,
        primitive: 'html-template',
      })
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' }))
    a.download = (packId || 'html-deck') + '-cream-recipe.json'
    a.click()
    setLog('크림 recipe JSON 다운로드', true)
  }

  async function loadManifest() {
    const res = await fetch(new URL('manifest.json', base))
    manifest = await res.json()
    packId = manifest.id || 'html-deck'
    let list = (manifest.slides || []).slice()
    const extras = savedExtras()
    ;(extras || []).forEach((ex) => {
      if (!ex || !ex.id) return
      if (!list.some((s) => s.id === ex.id)) {
        list.push({ id: ex.id, file: ex.file || ex.id + '.html', label: ex.label || '새 슬라이드', inserted: true })
      }
    })
    const ord = savedOrder()
    if (Array.isArray(ord) && ord.length) {
      const map = new Map(list.map((s) => [s.id, s]))
      const next = []
      ord.forEach((id) => { if (map.has(id)) { next.push(map.get(id)); map.delete(id) } })
      map.forEach((s) => next.push(s))
      list = next
    }
    slides = list
    const labelMap = savedLabels()
    slides.forEach((s) => {
      if (labelMap[s.id]) s.label = labelMap[s.id]
    })
    relabelSlides()
    document.getElementById('deckTitle').textContent = (manifest.titleKo || manifest.title) + ' · HTML Deck'
    const rail = document.getElementById('railTitle')
    if (rail) rail.textContent = (manifest.title || packId).toUpperCase()
    document.getElementById('lockBox').textContent = 'LOCK · ' + (manifest.locks || []).join(' · ')
    ensureInsertGuide()
    renderThumbs()
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => fitScales())
      ro.observe(thumbsEl)
      const vp = document.getElementById('viewport')
      if (vp) ro.observe(vp)
    }
    const q = new URLSearchParams(location.search).get('slide')
    const start = q ? Math.max(0, slides.findIndex((s) => s.id === q || s.file === q)) : 0
    show(start >= 0 ? start : 0)
    requestAnimationFrame(() => {
      fitScales()
      setTimeout(fitScales, 50)
      setTimeout(fitScales, 250)
      setTimeout(fitScales, 800)
    })
  }

  document.getElementById('prev').onclick = () => presentPrev()
  document.getElementById('next').onclick = () => presentNext()
  document.getElementById('presentBtn').onclick = () => (presenting ? exitPresent() : enterPresent())
  document.getElementById('presentHitPrev').onclick = () => presentPrev()
  document.getElementById('presentHitNext').onclick = () => presentNext()
  document.getElementById('presentFabPrev').onclick = () => presentPrev()
  document.getElementById('presentFabNext').onclick = () => presentNext()
  document.getElementById('presentFabExit').onclick = () => exitPresent()
  document.getElementById('exportCream').onclick = () => exportCream()
  document.getElementById('openRaw').onclick = () => {
    const slide = slides[i]
    if (!slide) return
    stage.style.pointerEvents = ''
    const ov = overrides()[slide.id]
    if (ov && ov.html) {
      setStagePreviewHtml(ov.html)
      setLog('저장본 HTML(삽입/수정)을 스테이지에 표시', true)
      return
    }
    setStageUrl(new URL('slides/' + slide.file, base).href + '?t=' + Date.now())
    setLog('원본 HTML을 스테이지에 표시', true)
  }
  document.getElementById('runAgent').onclick = () => proposeChange(promptEl.value || '')
  document.getElementById('applyCs').onclick = () => applyChange()
  document.getElementById('rejectCs').onclick = () => rejectChange()
  document.getElementById('restore').onclick = () => {
    const slide = slides[i]
    if (!slide) return
    const map = overrides()
    delete map[slide.id]
    saveOverrides(map)
    pendingCs = null
    setCsUi()
    refreshThumb(i)
    show(i)
    setRoute('idle')
    setLog('원본 복원: ' + slide.file, true)
  }
  document.getElementById('chips').addEventListener('click', (e) => {
    const t = e.target.closest('[data-prompt]')
    if (!t) return
    promptEl.value = t.getAttribute('data-prompt') || ''
  })
  /** Always open a clean picker — never reuse the previous FileList. */
  function pickImageForImport() {
    if (!imageIn) {
      setLog('파일 입력 컨트롤이 없습니다.', false)
      return
    }
    try { imageIn.value = '' } catch (_) {}
    setTimeout(() => {
      try { imageIn.value = '' } catch (_) {}
      imageIn.click()
    }, 0)
  }

  if (imageIn) {
    imageIn.addEventListener('change', (e) => {
      const input = e.target
      const file = input && input.files && input.files[0]
      if (!file) return
      const chosen = file
      try { input.value = '' } catch (_) {}
      void importSlideFile(chosen)
    })
  }
  document.getElementById('chips')?.addEventListener('click', (e) => {
    const t = e.target.closest('[data-import-mode]')
    if (!t) return
    const mode = t.getAttribute('data-import-mode') || 'auto'
    importMode = mode
    if (mode === 'html') {
      setLog('HTML 파일 선택 · 그대로 Import', true)
      pickImageForImport()
    } else if (mode === 'faithful') {
      setLog('이미지 선택 · 픽셀 그대로', true)
      pickImageForImport()
    } else {
      setLog('이미지 선택 · Vision 근사 HTML', true)
      pickImageForImport()
    }
  })
  ensureInsertGuide()
  ensureImportControls()
  ensureRegionEditor()

  window.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName
    if (!presenting && (tag === 'TEXTAREA' || tag === 'INPUT')) return
    if (e.key === 'Escape' && presenting) { e.preventDefault(); exitPresent(); return }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (presenting && (e.key === ' ' || e.key === 'Enter'))) {
      e.preventDefault(); presentNext(); return
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (presenting && e.key === 'Backspace')) {
      e.preventDefault(); presentPrev(); return
    }
    if ((e.key === 'f' || e.key === 'F') && !presenting && !e.metaKey && !e.ctrlKey) {
      e.preventDefault(); enterPresent()
    }
  }, true)
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && presenting) exitPresent()
    else if (document.fullscreenElement) setTimeout(fitScales, 50)
  })
  window.addEventListener('resize', fitScales)

  if (new URLSearchParams(location.search).get('embed') === '1') {
    app.classList.add('embed')
    document.title = (document.title || 'HTML Deck') + ' (embed)'
  }

  try {
    await loadManifest()
    setRoute('idle')
  } catch (err) {
    setLog('manifest 로드 실패: ' + err, false)
  }
})()
