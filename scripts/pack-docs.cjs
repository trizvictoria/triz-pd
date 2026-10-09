const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const sourcePath = path.join(root, 'docs', 'index.source.html')
const htmlPath = path.join(root, 'docs', 'index.html')
const encPath = path.join(root, 'docs', 'flow.enc')
const password = '123'
const iterations = 120000

const USER_HASHES = [
  '0e1733efb669979a709f05ba0a8d2725095193cf81fd05b75b7cefe5c48e03f9',
  'd919a100ce6b45524d415d52d088d5817587c6dd8c3691b03b8063c44d043523',
  'a3418631ddce958c2fe2206cb362d390c2cc59c86b6ef2083b3d7cbe38e9140d',
  '047007876c105127d9e0299df5dcea30b9fa5fae71be6f9d10ddb6357981cb9c',
  'ccc68482d9e0eee0789e64c7674421076738f8836857ea89bcd0afb832bf3fc3',
  '80c0fcbbfa9d03d861b22230e67c380afb545c12de43094f3985128625858361',
  '3db6c5da02e8275b4cd5d64d91d628b51e0028c3c8a915570492c34ab9e1fdd1',
  '33129567e0bd787efb15a26307e5311e06ba66e3b8dbc2206ad59f99780a4d78',
  '24d4b96f58da6d4a8512313bbd02a28ebf0ca95dec6e4c86ef78ce7f01e788ac',
]
const PASS_HASH = 'e9e69fcd703e857da732ae1e8c0d839920a24cb3407cc98440c04a4c7b62545d'
const PILOTO_USER_HASH = 'ef9d5711a95ddcc209cf8d01664f22d88289cacef4deb6921618b067e0a79c2c'
const PILOTO_PASS_HASH = '6064eb690ce09822d7b456c5f7d862fabbc5e29b12387e45361e053cb6ff25f1'
const pilotoPassword = 'totvspay2809'

const source = fs.readFileSync(sourcePath, 'utf8')
const cssStart = source.indexOf('    .deal{')
const loginCssStart = source.indexOf('    .login{')
const mediaStart = source.indexOf('    @media(max-width:1100px)')
const styleEnd = source.indexOf('  </style>')
const scriptStart = source.indexOf('<script>')
const scriptEnd = source.indexOf('</script>', scriptStart)

if (cssStart < 0 || loginCssStart < 0 || mediaStart < 0 || styleEnd < 0 || scriptStart < 0 || scriptEnd < 0) {
  throw new Error('Could not locate flow CSS/JS markers in docs/index.source.html')
}

const suriCssStart = source.indexOf('    .suri{')
const flowCss = (
  source.slice(cssStart, loginCssStart) +
  (suriCssStart >= 0 ? source.slice(suriCssStart, mediaStart) : '') +
  source.slice(mediaStart, styleEnd)
).trim()
let flowJs = source.slice(scriptStart + '<script>'.length, scriptEnd).trim()

flowJs = flowJs.replace(
  /const USERS=new Set\(\['nic','nat','poli','gui','bruno','lu','triz','ze','piloto','ana'\]\);\r?\nfunction normUser\(v\)\{return \(v\|\|''\)\.trim\(\)\.toLowerCase\(\)\.normalize\('NFD'\)\.replace\(\/\\p\{M\}\/gu,''\)\}\r?\nfunction isValidLogin\(u,p\)\{const n=normUser\(u\);if\(n==='piloto'\)return p==='totvspay2809';return USERS\.has\(n\)&&p==='123'\}\r?\n/,
  '',
)

if (flowJs.includes("p==='123'") || flowJs.includes('totvspay2809') || flowJs.includes("new Set(['nic'")) {
  throw new Error('Failed to strip credentials from flow JS')
}

flowJs = flowJs.replace('authed:false', 'authed:true')

const withoutLoginRender = flowJs.replace(
  /  if\(!state\.authed\)\{[\s\S]*?    return;\r?\n  \}\r?\n  if\(state\.view==='suri'\)\{/,
  "  if(state.view==='suri'){",
)
if (withoutLoginRender === flowJs) throw new Error('Failed to strip login render branch')
flowJs = withoutLoginRender

const withoutLoginAct = flowJs.replace(
  /  if\(a==='login'\)\{[\s\S]*?render\(\);return;\r?\n  \}\r?\n/,
  '',
)
if (withoutLoginAct === flowJs) throw new Error('Failed to strip login action')
flowJs = withoutLoginAct

if (/login-form|isValidLogin|Usuário ou senha/.test(flowJs)) {
  throw new Error('Login fragments still present in flow JS')
}

function encryptBlob(plaintext, secret) {
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const key = crypto.pbkdf2Sync(secret, salt, iterations, 32, 'sha256')
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return Buffer.concat([salt, iv, encrypted, cipher.getAuthTag()])
}

function frameBlob(blob) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(blob.length)
  return Buffer.concat([len, blob])
}

function decryptBlob(blob, secret) {
  const salt = blob.subarray(0, 16)
  const iv = blob.subarray(16, 28)
  const key = crypto.pbkdf2Sync(secret, salt, iterations, 32, 'sha256')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(blob.subarray(blob.length - 16))
  return Buffer.concat([decipher.update(blob.subarray(28, blob.length - 16)), decipher.final()]).toString('utf8')
}

const payload = JSON.stringify({ css: flowCss, js: flowJs })
const blobDefault = encryptBlob(payload, password)
const blobPiloto = encryptBlob(payload, pilotoPassword)
const packed = Buffer.concat([Buffer.from('PD2\0'), frameBlob(blobDefault), frameBlob(blobPiloto)])
fs.writeFileSync(encPath, packed)

const gate = fs.readFileSync(path.join(root, 'scripts', 'docs-gate.js'), 'utf8').trim()
const publicHtml =
  source.slice(0, cssStart) +
  source.slice(loginCssStart, mediaStart) +
  source.slice(styleEnd, scriptStart) +
  `<script>\n${gate}\n</script>` +
  source.slice(scriptEnd + '</script>'.length)

if (publicHtml.includes('p.search(//') || publicHtml.includes("p==='123'") || publicHtml.includes('totvspay2809') || publicHtml.includes("new Set(['nic'")) {
  throw new Error('Public HTML still contains plaintext credentials or a broken path regex')
}
if (publicHtml.includes('function checkoutHTML') || publicHtml.includes('MALGA_LOGO') || publicHtml.includes('checkout-main') || publicHtml.includes('totvsMark')) {
  throw new Error('Public HTML still contains flow source')
}

fs.writeFileSync(htmlPath, publicHtml)
fs.writeFileSync(path.join(root, 'docs', '.nojekyll'), '')

function unwrapPacked(buf, secret) {
  if (buf.subarray(0, 4).toString() !== 'PD2\0') throw new Error('Unexpected flow.enc format')
  let offset = 4
  let last
  while (offset + 4 <= buf.length) {
    const len = buf.readUInt32BE(offset)
    offset += 4
    const slice = buf.subarray(offset, offset + len)
    offset += len
    try {
      return decryptBlob(slice, secret)
    } catch (err) {
      last = err
    }
  }
  throw last || new Error('Could not decrypt packed flow')
}

for (const secret of [password, pilotoPassword]) {
  const roundPayload = JSON.parse(unwrapPacked(packed, secret))
  if (!roundPayload.js.includes('function checkoutHTML') || !roundPayload.css.includes('.deal{')) {
    throw new Error('Encrypted payload is missing the payment flow')
  }
  if (!roundPayload.js.includes('instituto-percorre-mark.png') || !roundPayload.js.includes('jornada de venda completa')) {
    throw new Error('Encrypted payload is missing the current Suri Shop page')
  }
  if (!roundPayload.css.includes('.suri-layout') || !roundPayload.css.includes('.device-phone')) {
    throw new Error('Encrypted payload is missing Suri Shop layout CSS')
  }
}

console.log('Packed login-only docs/index.html and encrypted docs/flow.enc')

