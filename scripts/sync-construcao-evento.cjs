const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const sourceDir = path.join(root, 'construcao-evento')
const targetDir = path.join(root, 'docs', 'construcao')
const experienceSwitch = path.join(targetDir, 'experience-switch.js')

const COPY_FILES = ['index.html', 'styles.css', 'app.js', 'LEIA-ME.txt']
const COPY_DIRS = ['assets']

const REDIRECT_SUBPAGES = ['proposta', 'whatsapp', 'email', 'checkout']

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true })
  fs.cpSync(src, dest, { recursive: true })
}

function docsIndexHtml() {
  let html = fs.readFileSync(path.join(sourceDir, 'index.html'), 'utf8')
  html = html.replace(
    'href="../favicon.svg?v=1"',
    'href="/triz-pd/favicon.svg?v=1"',
  )
  html = html.replace(
    'src="experience-switch.js?v=7"',
    'src="/triz-pd/construcao/experience-switch.js?v=7"',
  )
  html = html.replace(
    'src="app.js?v=2"',
    'src="/triz-pd/construcao/app.js?v=2"',
  )
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

for (const name of COPY_DIRS) {
  const src = path.join(sourceDir, name)
  if (!fs.existsSync(src)) continue
  copyDir(src, path.join(targetDir, name))
}

const sourceSwitch = path.join(sourceDir, 'experience-switch.js')
if (!fs.existsSync(sourceSwitch)) {
  throw new Error('Missing construcao-evento/experience-switch.js')
}
copyFile(sourceSwitch, experienceSwitch)

for (const sub of REDIRECT_SUBPAGES) {
  const dir = path.join(targetDir, sub)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), redirectHtml())
}

const assetsDir = path.join(targetDir, 'assets')
if (fs.existsSync(assetsDir)) {
  for (const entry of fs.readdirSync(assetsDir)) {
    if (/^index-.*\.(js|css)$/.test(entry) || /^AuthedApp-.*\.(js|css)$/.test(entry)) {
      fs.rmSync(path.join(assetsDir, entry), { force: true })
    }
  }
}

for (const orphan of ['qr-adiantamento.svg']) {
  const p = path.join(targetDir, orphan)
  if (fs.existsSync(p)) fs.rmSync(p, { force: true })
}

console.log('Synced construcao-evento → docs/construcao')
