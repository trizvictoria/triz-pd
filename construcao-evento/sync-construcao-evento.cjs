const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.join(__dirname, '..')
const sourceDir = path.join(root, 'construcao-evento')
const targetDir = path.join(root, 'docs', 'construcao')
const experienceSwitch = path.join(targetDir, 'experience-switch.js')
const viteOut = path.join(root, '.tmp/construcao-vite')

const COPY_FILES = ['index.html', 'styles.css', 'app.js', 'LEIA-ME.txt']
const FLOW_SUBPAGES = ['checkout', 'whatsapp', 'email']
const REDIRECT_SUBPAGES = ['proposta']

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function docsIndexHtml() {
  let html = fs.readFileSync(path.join(sourceDir, 'index.html'), 'utf8')
  html = html.replace('href="../favicon.svg?v=1"', 'href="/triz-pd/favicon.svg?v=1"')
  html = html.replace(
    'src="experience-switch.js?v=8"',
    'src="/triz-pd/construcao/experience-switch.js?v=8"',
  )
  html = html.replace('src="app.js?v=3"', 'src="/triz-pd/construcao/app.js?v=3"')
  return html
}

function redirectHtml() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=../" />
    <title>Construção — redirecionando</title>
  </head>
  <body>
    <p><a href="../">Voltar para a proposta</a></p>
  </body>
</html>
`
}

function flowShellHtml(jsSrc, cssHref) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/triz-pd/favicon.svg?v=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TOTVS Pay — Payments Universo TOTVS</title>
    <script type="module" crossorigin src="${jsSrc}"></script>
    <link rel="stylesheet" crossorigin href="${cssHref}">
  </head>
  <body>
    <style id="pd-demo-banner-style">
      :root{--demo-banner-h:28px}
      .demo-banner{position:fixed;top:0;left:0;right:0;z-index:12000;width:100%;height:var(--demo-banner-h);display:flex;align-items:center;justify-content:center;background:#00dbff;color:#002233;font:700 12px/16px "DM Sans",sans-serif;letter-spacing:.01em}
      #root{box-sizing:border-box;padding-top:var(--demo-banner-h)}
      .advance-root{top:var(--demo-banner-h)!important}
      .evt-side{top:calc(49px + var(--demo-banner-h))!important}
      .adv-toast{top:calc(16px + var(--demo-banner-h))!important}
      .checkout{top:var(--demo-banner-h)!important;right:0!important;bottom:0!important;left:0!important;height:auto!important}
    </style>
    <div class="demo-banner" role="status">Conta demo - Experiência TOTVS Pay</div>
    <div id="root"></div>
    <script src="/triz-pd/construcao/experience-switch.js?v=8" defer></script>
  </body>
</html>
`
}

function buildAdvanceBundle() {
  fs.rmSync(viteOut, { recursive: true, force: true })
  execSync(`npx vite build --outDir "${viteOut}" --emptyOutDir`, {
    cwd: root,
    env: {
      ...process.env,
      VITE_ADVANCE_ONLY: 'true',
      BASE_PATH: '/triz-pd/construcao/',
    },
    stdio: 'inherit',
  })
}

function readBundleRefs() {
  const html = fs.readFileSync(path.join(viteOut, 'index.html'), 'utf8')
  const jsMatch = html.match(/src="([^"]*assets\/index-[^"]+\.js)"/)
  const cssMatch = html.match(/href="([^"]*assets\/index-[^"]+\.css)"/)
  if (!jsMatch || !cssMatch) {
    throw new Error('Could not locate advance bundle in vite output')
  }
  const toAbsolute = (ref) => (ref.startsWith('/') ? ref : `/triz-pd/construcao/${ref.replace(/^\.\//, '')}`)
  return { js: toAbsolute(jsMatch[1]), css: toAbsolute(cssMatch[1]) }
}

function mergeViteAssets() {
  const from = path.join(viteOut, 'assets')
  const to = path.join(targetDir, 'assets')
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from)) {
    copyFile(path.join(from, entry), path.join(to, entry))
  }
}

if (!fs.existsSync(sourceDir)) {
  throw new Error('Missing construcao-evento source folder')
}

fs.mkdirSync(targetDir, { recursive: true })

for (const name of COPY_FILES) {
  const src = path.join(sourceDir, name)
  if (!fs.existsSync(src)) continue
  if (name === 'index.html') {
    fs.writeFileSync(path.join(targetDir, 'index.html'), docsIndexHtml())
  } else {
    copyFile(src, path.join(targetDir, name))
  }
}

const protoAssets = path.join(sourceDir, 'assets')
const targetAssets = path.join(targetDir, 'assets')
fs.mkdirSync(targetAssets, { recursive: true })
if (fs.existsSync(protoAssets)) {
  for (const entry of fs.readdirSync(protoAssets)) {
    copyFile(path.join(protoAssets, entry), path.join(targetAssets, entry))
  }
}

const sourceSwitch = path.join(sourceDir, 'experience-switch.js')
if (!fs.existsSync(sourceSwitch)) {
  throw new Error('Missing construcao-evento/experience-switch.js')
}
copyFile(sourceSwitch, experienceSwitch)

buildAdvanceBundle()
const bundle = readBundleRefs()
mergeViteAssets()

for (const sub of FLOW_SUBPAGES) {
  const dir = path.join(targetDir, sub)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), flowShellHtml(bundle.js, bundle.css))
}

for (const sub of REDIRECT_SUBPAGES) {
  const dir = path.join(targetDir, sub)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), redirectHtml())
}

for (const orphan of ['qr-adiantamento.svg']) {
  const p = path.join(targetDir, orphan)
  if (fs.existsSync(p)) fs.rmSync(p, { force: true })
}

console.log('Synced construcao-evento → docs/construcao (static + checkout flow)')
