(function () {
  'use strict'

  var script = document.currentScript

  if (!script) {
    return
  }

  var assistantId = script.getAttribute('data-assistant-id')

  if (!assistantId) {
    console.error('MAKU Widget: data-assistant-id is missing.')
    return
  }

  var origin =
    script.getAttribute('data-origin') ||
    new URL(script.src).origin

  var button = document.createElement('button')

  button.type = 'button'
  button.setAttribute(
    'aria-label',
    'Open MAKU Business Assistant'
  )

  button.innerHTML = '💬'

  Object.assign(button.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    background: '#FC72C2',
    color: '#FFFFFF',
    fontSize: '25px',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(252,114,194,0.35)',
    zIndex: '2147483647',
  })

  var frame = document.createElement('iframe')

  frame.src =
    origin +
    '/widget/' +
    encodeURIComponent(assistantId)

  frame.title = 'MAKU Business Assistant'

  Object.assign(frame.style, {
    position: 'fixed',
    right: '20px',
    bottom: '92px',
    width: '390px',
    height: '620px',
    maxWidth: 'calc(100vw - 40px)',
    maxHeight: 'calc(100vh - 110px)',
    border: '1px solid #FFB3DF',
    borderRadius: '20px',
    background: '#FFFFFF',
    boxShadow: '0 15px 50px rgba(252,114,194,0.2)',
    zIndex: '2147483646',
    display: 'none',
  })

  var open = false

  button.addEventListener('click', function () {
    open = !open

    frame.style.display = open ? 'block' : 'none'

    button.innerHTML = open ? '×' : '💬'
  })

  document.body.appendChild(frame)
  document.body.appendChild(button)
})()
