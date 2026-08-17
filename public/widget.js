(function () {
  'use strict'

  var script = document.currentScript

  if (!script) {
    var scripts = document.getElementsByTagName('script')

    for (var index = scripts.length - 1; index >= 0; index -= 1) {
      if (/\/widget\.js(?:\?|$)/.test(scripts[index].src)) {
        script = scripts[index]
        break
      }
    }
  }

  if (!script || script.getAttribute('data-maku-widget-loaded') === 'true') {
    return
  }

  script.setAttribute('data-maku-widget-loaded', 'true')

  var assistantId = script.getAttribute('data-assistant-id')

  if (!assistantId) {
    console.error('MAKU Widget: data-assistant-id is missing.')
    return
  }

  var origin = new URL(script.src, window.location.href).origin
  var launcher = document.createElement('button')
  var frame = document.createElement('iframe')
  var isOpen = false

  launcher.type = 'button'
  launcher.setAttribute('aria-label', 'Open MAKU Business Assistant')
  launcher.setAttribute('aria-expanded', 'false')
  launcher.textContent = 'Chat'

  Object.assign(launcher.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    minWidth: '60px',
    height: '60px',
    padding: '0 18px',
    border: '1px solid #FFB3DF',
    borderRadius: '999px',
    background: '#FC72C2',
    color: '#FFFFFF',
    font: '600 14px/1 system-ui, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(252, 114, 194, 0.35)',
    zIndex: '2147483647',
  })

  frame.src = origin + '/widget/' + encodeURIComponent(assistantId)
  frame.title = 'MAKU Business Assistant'
  frame.setAttribute('aria-label', 'MAKU Business Assistant')
  frame.setAttribute('loading', 'lazy')

  Object.assign(frame.style, {
    position: 'fixed',
    right: '20px',
    bottom: '92px',
    width: '390px',
    height: '620px',
    maxWidth: 'calc(100vw - 40px)',
    maxHeight: 'calc(100vh - 112px)',
    border: '1px solid #FFB3DF',
    borderRadius: '16px',
    background: '#FFF7FC',
    boxShadow: '0 15px 50px rgba(17, 24, 39, 0.2)',
    zIndex: '2147483646',
    display: 'none',
  })

  function applyResponsiveLayout() {
    if (window.innerWidth <= 480) {
      launcher.style.right = '12px'
      launcher.style.bottom = '12px'
      frame.style.right = '12px'
      frame.style.bottom = '84px'
      frame.style.width = 'calc(100vw - 24px)'
      frame.style.height = 'min(620px, calc(100vh - 96px))'
      frame.style.maxWidth = 'none'
      frame.style.maxHeight = 'none'
      frame.style.borderRadius = '12px'
      return
    }

    launcher.style.right = '20px'
    launcher.style.bottom = '20px'
    frame.style.right = '20px'
    frame.style.bottom = '92px'
    frame.style.width = '390px'
    frame.style.height = '620px'
    frame.style.maxWidth = 'calc(100vw - 40px)'
    frame.style.maxHeight = 'calc(100vh - 112px)'
    frame.style.borderRadius = '16px'
  }

  function setOpen(nextOpen) {
    isOpen = nextOpen
    frame.style.display = isOpen ? 'block' : 'none'
    launcher.textContent = isOpen ? 'Close' : 'Chat'
    launcher.setAttribute(
      'aria-label',
      isOpen ? 'Close MAKU Business Assistant' : 'Open MAKU Business Assistant'
    )
    launcher.setAttribute('aria-expanded', String(isOpen))
  }

  launcher.addEventListener('click', function () {
    setOpen(!isOpen)
  })

  window.addEventListener('message', function (event) {
    if (event.origin === origin && event.source === frame.contentWindow && event.data && event.data.type === 'MAKU_WIDGET_CLOSE') {
      setOpen(false)
    }
  })

  window.addEventListener('resize', applyResponsiveLayout)
  applyResponsiveLayout()
  document.body.appendChild(frame)
  document.body.appendChild(launcher)
})()
