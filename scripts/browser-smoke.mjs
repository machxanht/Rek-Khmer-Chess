import { spawn, spawnSync } from 'node:child_process'

const routes = [
  ['/', 'Rek Khmer'],
  ['/play', 'Choose Game Mode'],
  ['/play/local', 'Pass & Play'],
  ['/play/ai', 'Khmer AI Battle'],
  ['/play/puzzle', 'King Defense Puzzles'],
  ['/play/online', 'Play Online'],
  ['/how-to-play', 'How to Play'],
  ['/profile', 'Bopha Nak'],
  ['/settings', 'Preferences'],
]

function findChrome() {
  for (const candidate of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const result = spawnSync('which', [candidate], { encoding: 'utf8' })
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim()
  }
  throw new Error('Chrome/Chromium executable not found on runner')
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForJson(url, attempts = 60) {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return await response.json()
    } catch (error) {
      lastError = error
    }
    await delay(250)
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`)
}

function isIgnorableResource(url) {
  return (
    url.endsWith('/favicon.ico') ||
    url.includes('/.well-known/appspecific/com.chrome.devtools.json') ||
    url.includes('/_vercel/insights/')
  )
}

function includesText(haystack, needle) {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase())
}

class CdpPage {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.nextId = 1
    this.pending = new Map()
    this.exceptions = []
    this.consoleErrors = []
    this.resourceErrors = []
    this.opened = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true })
      this.ws.addEventListener('error', reject, { once: true })
    })
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(message.error.message))
        else resolve(message.result)
        return
      }

      if (message.method === 'Runtime.exceptionThrown') {
        const detail = message.params?.exceptionDetails
        const text = detail?.exception?.description || detail?.text || 'Unknown runtime exception'
        this.exceptions.push(text)
      }

      if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
        const text = message.params.entry.text || ''
        if (!text.startsWith('Failed to load resource:')) this.consoleErrors.push(text)
      }

      if (message.method === 'Network.responseReceived') {
        const response = message.params?.response
        if (response?.status >= 400 && !isIgnorableResource(response.url)) {
          this.resourceErrors.push(`${response.status} ${response.url}`)
        }
      }

      if (message.method === 'Network.loadingFailed') {
        const errorText = message.params?.errorText
        if (errorText && errorText !== 'net::ERR_ABORTED') this.resourceErrors.push(errorText)
      }
    })
  }

  async send(method, params = {}) {
    await this.opened
    const id = this.nextId++
    return await new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  close() {
    this.ws.close()
  }
}

async function createPage(port) {
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })
  if (!target.ok) throw new Error(`Could not create Chrome target: ${target.status}`)
  const json = await target.json()
  const page = new CdpPage(json.webSocketDebuggerUrl)
  await page.send('Page.enable')
  await page.send('Runtime.enable')
  await page.send('Log.enable')
  await page.send('Network.enable')
  return page
}

async function readSnapshot(page) {
  const result = await page.send('Runtime.evaluate', {
    expression: `JSON.stringify({
      text: document.body?.innerText || '',
      htmlLength: document.body?.innerHTML?.length || 0,
      readyState: document.readyState,
      href: location.href
    })`,
    returnByValue: true,
  })
  return JSON.parse(result.result.value)
}

async function waitForRoute(page, expectedText, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs
  let snapshot = await readSnapshot(page)

  while (Date.now() < deadline) {
    if (
      snapshot.readyState === 'complete' &&
      snapshot.text.trim() &&
      snapshot.htmlLength >= 100 &&
      includesText(snapshot.text, expectedText)
    ) return snapshot

    await delay(250)
    snapshot = await readSnapshot(page)
  }

  return snapshot
}

function runtimeFailures(page) {
  const failures = []
  if (page.exceptions.length) failures.push(`runtime exceptions: ${page.exceptions.join(' | ')}`)
  if (page.consoleErrors.length) failures.push(`console errors: ${page.consoleErrors.join(' | ')}`)
  if (page.resourceErrors.length) failures.push(`resource errors: ${page.resourceErrors.join(' | ')}`)
  return failures
}

async function navigateAndAssert(page, baseUrl, route, expectedText, denyStorage) {
  page.exceptions = []
  page.consoleErrors = []
  page.resourceErrors = []

  if (denyStorage) {
    await page.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() { throw new DOMException('Storage disabled by smoke test', 'SecurityError') }
          });
        } catch {}
      `,
    })
  }

  await page.send('Page.navigate', { url: `${baseUrl}${route}` })
  const snapshot = await waitForRoute(page, expectedText)

  const failures = []
  if (!snapshot.text.trim()) failures.push('body text is empty')
  if (snapshot.htmlLength < 100) failures.push(`body HTML unexpectedly small (${snapshot.htmlLength})`)
  if (!includesText(snapshot.text, expectedText)) failures.push(`missing expected text: ${expectedText}`)
  failures.push(...runtimeFailures(page))

  if (failures.length) {
    const bodyPreview = snapshot.text.replace(/\s+/g, ' ').trim().slice(0, 700)
    throw new Error(
      `${route}${denyStorage ? ' [storage denied]' : ''}: ${failures.join('; ')}; ` +
        `readyState=${snapshot.readyState}; href=${snapshot.href}; body=${JSON.stringify(bodyPreview)}`,
    )
  }

  console.log(`✓ ${route}${denyStorage ? ' [storage denied]' : ''}`)
}

async function assertBlockedAudioNavigation(page, baseUrl) {
  page.exceptions = []
  page.consoleErrors = []
  page.resourceErrors = []

  await page.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      for (const key of ['AudioContext', 'webkitAudioContext']) {
        try {
          Object.defineProperty(window, key, {
            configurable: true,
            get() { throw new DOMException('Web Audio disabled by smoke test', 'SecurityError') }
          });
        } catch {}
      }
    `,
  })

  await page.send('Page.navigate', { url: `${baseUrl}/` })
  const home = await waitForRoute(page, 'Rek Khmer')
  if (!includesText(home.text, 'Rek Khmer')) {
    throw new Error('blocked WebAudio interaction: home route did not render')
  }

  await page.send('Runtime.evaluate', {
    expression: `document.querySelector('a[href="/play"]')?.click()`,
  })
  const play = await waitForRoute(page, 'Choose Game Mode')

  const failures = []
  if (!includesText(play.text, 'Choose Game Mode')) failures.push('navigation to /play did not complete')
  failures.push(...runtimeFailures(page))

  if (failures.length) {
    throw new Error(`blocked WebAudio interaction: ${failures.join('; ')}`)
  }

  console.log('✓ navigation interaction [WebAudio denied]')
}

const chromePath = findChrome()
const debugPort = Number(process.env.REK_CHROME_DEBUG_PORT || '9222')
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=/tmp/rek-chrome-profile-${debugPort}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] },
)

let stderr = ''
chrome.stderr.on('data', (chunk) => {
  stderr += chunk.toString()
})

try {
  await waitForJson(`http://127.0.0.1:${debugPort}/json/version`)
  const baseUrl = process.env.REK_SMOKE_BASE_URL || 'http://127.0.0.1:3000'

  for (const denyStorage of [false, true]) {
    for (const [route, expectedText] of routes) {
      const page = await createPage(debugPort)
      try {
        await navigateAndAssert(page, baseUrl, route, expectedText, denyStorage)
      } finally {
        page.close()
      }
    }
  }

  const interactionPage = await createPage(debugPort)
  try {
    await assertBlockedAudioNavigation(interactionPage, baseUrl)
  } finally {
    interactionPage.close()
  }
} catch (error) {
  console.error(error)
  if (stderr.trim()) console.error('\nChrome stderr:\n', stderr.slice(-5000))
  process.exitCode = 1
} finally {
  chrome.kill('SIGTERM')
}
