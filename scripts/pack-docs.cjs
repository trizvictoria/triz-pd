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
  'ef9d5711a95ddcc209cf8d01664f22d88289cacef4deb6921618b067e0a79c2c',
  '24d4b96f58da6d4a8512313bbd02a28ebf0ca95dec6e4c86ef78ce7f01e788ac',
]
const PASS_HASH = 'e9e69fcd703e857da732ae1e8c0d839920a24cb3407cc98440c04a4c7b62545d'

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

const flowCss = (source.slice(cssStart, loginCssStart) + source.slice(mediaStart, styleEnd)).trim()
let flowJs = source.slice(scriptStart + '<script>'.length, scriptEnd).trim()

flowJs = flowJs.replace(
  /const USERS=new Set\(\['nic','nat','poli','gui','bruno','lu','triz','ze','piloto','ana'\]\);\r?\nfunction normUser\(v\)\{return \(v\|\|''\)\.trim\(\)\.toLowerCase\(\)\.normalize\('NFD'\)\.replace\(\/\\p\{M\}\/gu,''\)\}\r?\nfunction isValidLogin\(u,p\)\{return USERS\.has\(normUser\(u\)\)&&p==='123'\}\r?\n/,
  '',
)

if (flowJs.includes("p==='123'") || flowJs.includes("new Set(['nic'")) {
  throw new Error('Failed to strip credentials from flow JS')
}

flowJs = flowJs.replace('authed:false', 'authed:true')

const withoutLoginRender = flowJs.replace(
  /  if\(!state\.authed\)\{[\s\S]*?    return;\r?\n  \}\r?\n  setChrome\('crm'\);\r?\n  if\(state\.view==='checkout'/,
  "  setChrome('crm');\n  if(state.view==='checkout'",
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

const payload = JSON.stringify({ css: flowCss, js: flowJs })
const salt = crypto.randomBytes(16)
const iv = crypto.randomBytes(12)
const key = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()])
const blob = Buffer.concat([salt, iv, encrypted, cipher.getAuthTag()])
fs.writeFileSync(encPath, blob)

const hashes = USER_HASHES.map((hash) => `'${hash}'`).join(',')
const gate = `const USERS=new Set([${hashes}]);
const PASS='${PASS_HASH}';
function normUser(v){return (v||'').trim().toLowerCase().normalize('NFD').replace(/\\p{M}/gu,'')}
async function sha256(s){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function decrypt(buf,password){
  const bytes=new Uint8Array(buf);
  const salt=bytes.slice(0,16);
  const iv=bytes.slice(16,28);
  const data=bytes.slice(28);
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:${iterations},hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data));
}
const state={user:'',pass:'',product:'',error:'',busy:false};
function loginView(){
  const can=state.user.trim()&&state.pass&&state.product&&!state.busy;
  return \`<div class="login"><form class="login-card" id="login-form" novalidate>
    <header class="login-card__header">
      <div class="login-steps" aria-hidden="true"><span class="login-step"></span><span class="login-step is-current"></span></div>
      <h1>Entrar</h1>
    </header>
    <div class="login-card__fields">
      <label class="tg-field"><span class="tg-field__label">Usuário</span><span class="tg-input"><input id="login-user" placeholder="Insira o usuário" autocomplete="username"></span></label>
      <label class="tg-field"><span class="tg-field__label">Senha</span><span class="tg-input"><input id="login-password" type="password" placeholder="Insira a senha" autocomplete="current-password"></span></label>
      <label class="tg-field"><span class="tg-field__label">Produto</span><span class="tg-input"><select id="login-product"><option value="" disabled \${!state.product?'selected':''}>Selecione</option><option value="totvs" \${state.product==='totvs'?'selected':''}>TOTVS Pay</option><option value="rd" \${state.product==='rd'?'selected':''}>RD Vendas</option></select></span></label>
    </div>
    \${state.error?\`<p class="login-error" role="alert">\${state.error}</p>\`:''}
    <button class="tg-button tg-button--primary" data-act="login" \${can?'':'disabled'}>\${state.busy?'Entrando…':'Entrar'}</button>
  </form></div>\`;
}
function bindLogin(){
  const user=document.getElementById('login-user');
  const pass=document.getElementById('login-password');
  const product=document.getElementById('login-product');
  const submit=document.querySelector('[data-act="login"]');
  const sync=()=>{submit.disabled=!(user.value.trim()&&pass.value&&product.value)||state.busy};
  user.value=state.user;
  pass.value=state.pass;
  product.value=state.product;
  sync();
  user.oninput=()=>{state.user=user.value;if(state.error){state.error='';const err=document.querySelector('.login-error');if(err)err.remove()}sync()};
  pass.oninput=()=>{state.pass=pass.value;if(state.error){state.error='';const err=document.querySelector('.login-error');if(err)err.remove()}sync()};
  product.onchange=()=>{state.product=product.value;if(state.error){state.error='';const err=document.querySelector('.login-error');if(err)err.remove()}sync()};
  document.getElementById('login-form').onsubmit=ev=>{ev.preventDefault();unlock()};
}
function renderLogin(){
  document.getElementById('app').innerHTML=loginView();
  bindLogin();
}
async function unlock(){
  if(!(state.user.trim()&&state.pass&&state.product)||state.busy) return;
  const uh=await sha256(normUser(state.user));
  const ph=await sha256('pd-ai|'+state.pass);
  if(!USERS.has(uh)||ph!==PASS){state.error='Usuário ou senha inválidos';renderLogin();return}
  state.busy=true;state.error='';renderLogin();
  try{sessionStorage.setItem('pd-ai-auth',PASS)}catch(e){}
  if(state.product==='totvs'){
    location.href='totvs/';
    return;
  }
  try{
    const res=await fetch('flow.enc',{cache:'no-store'});
    if(!res.ok) throw new Error('missing');
    const payload=JSON.parse(await decrypt(await res.arrayBuffer(),state.pass));
    const style=document.createElement('style');
    style.textContent=payload.css;
    document.head.appendChild(style);
    const root=document.getElementById('crm-root');
    const loginNav=document.getElementById('login-nav');
    const crmNav=document.getElementById('crm-nav');
    if(root) root.classList.remove('is-login');
    if(loginNav) loginNav.hidden=true;
    if(crmNav) crmNav.hidden=false;
    new Function(payload.js)();
  }catch(err){
    state.busy=false;
    state.error='Não foi possível carregar o fluxo';
    renderLogin();
  }
}
renderLogin();`

const publicHtml =
  source.slice(0, cssStart) +
  source.slice(loginCssStart, mediaStart) +
  source.slice(styleEnd, scriptStart) +
  `<script>\n${gate}\n</script>` +
  source.slice(scriptEnd + '</script>'.length)

if (publicHtml.includes("p==='123'") || publicHtml.includes("new Set(['nic'")) {
  throw new Error('Public HTML still contains plaintext credentials')
}
if (publicHtml.includes('function checkoutHTML') || publicHtml.includes('MALGA_LOGO') || publicHtml.includes('checkout-main') || publicHtml.includes('totvsMark')) {
  throw new Error('Public HTML still contains flow source')
}

fs.writeFileSync(htmlPath, publicHtml)
fs.writeFileSync(path.join(root, 'docs', '.nojekyll'), '')

const roundKey = crypto.pbkdf2Sync(password, blob.subarray(0, 16), iterations, 32, 'sha256')
const roundDecipher = crypto.createDecipheriv('aes-256-gcm', roundKey, blob.subarray(16, 28))
roundDecipher.setAuthTag(blob.subarray(blob.length - 16))
const roundPlain = Buffer.concat([
  roundDecipher.update(blob.subarray(28, blob.length - 16)),
  roundDecipher.final(),
]).toString('utf8')
const roundPayload = JSON.parse(roundPlain)
if (!roundPayload.js.includes('function checkoutHTML') || !roundPayload.css.includes('.deal{')) {
  throw new Error('Encrypted payload is missing the payment flow')
}

console.log('Packed login-only docs/index.html and encrypted docs/flow.enc')
