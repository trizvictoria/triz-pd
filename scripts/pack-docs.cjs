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

const hashes = USER_HASHES.map((hash) => `'${hash}'`).join(',')
const gate = `const USERS=new Set([${hashes}]);
const PASS='${PASS_HASH}';
const PILOTO='${PILOTO_USER_HASH}';
const PILOTO_PASS='${PILOTO_PASS_HASH}';
function normUser(v){return (v||'').trim().toLowerCase().normalize('NFD').replace(/\\p{M}/gu,'')}
async function sha256(s){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function decryptSlice(bytes,password){
  const salt=bytes.slice(0,16);
  const iv=bytes.slice(16,28);
  const data=bytes.slice(28);
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:${iterations},hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data));
}
async function decrypt(buf,password){
  const bytes=new Uint8Array(buf);
  if(bytes[0]===80&&bytes[1]===68&&bytes[2]===50){
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    let off=4;
    let last;
    while(off+4<=bytes.length){
      const len=view.getUint32(off); off+=4;
      const slice=bytes.slice(off,off+len); off+=len;
      try{return await decryptSlice(slice,password)}catch(err){last=err}
    }
    throw last||new Error('decrypt');
  }
  return decryptSlice(bytes,password);
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
      <label class="tg-field"><span class="tg-field__label">Produto</span><span class="tg-input"><select id="login-product"><option value="" disabled \${!state.product?'selected':''}>Selecione</option><option value="rd" \${state.product==='rd'?'selected':''}>RD Vendas</option><option value="totvs-credenciamento" \${state.product==='totvs-credenciamento'?'selected':''}>TOTVS Pay - Credenciamento</option><option value="totvs-dashboard" \${state.product==='totvs-dashboard'?'selected':''}>TOTVS Pay - Dashboard</option><option value="suri" \${state.product==='suri'?'selected':''}>Suri Shop</option><option value="construcao" \${state.product==='construcao'?'selected':''}>Construção</option><option value="checkout" \${state.product==='checkout'?'selected':''}>Checkout</option></select></span></label>
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
  if(location.hash==='#suri' && !state.busy){showPublicSuri();return}
  const root=document.getElementById('crm-root');
  if(root){root.classList.add('is-login');root.classList.remove('is-suri')}
  document.getElementById('app').innerHTML=loginView();
  bindLogin();
}
function experienceRoot(){
  const p=location.pathname;
  const i=p.search(new RegExp('/(totvs|construcao)(?:/|$)'));
  if(i>=0) return p.slice(0,i)+'/';
  return p.endsWith('/')?p:p.replace(/[^/]+$/,'');
}
function suriHTML(){
  return '<div class="suri"><div class="suri-layout"><div class="suri-stories"><article class="suri-story"><div class="suri-copy"><p class="suri-kicker">Venda automatizada</p><h1>Suri + TOTVS Pay: a jornada de venda completa, automatizada com IA</h1></div><div class="device-phone"><div class="device-phone__screen"><video src="suri/venda-automatizada.mp4" poster="suri/poster-automatizada.jpg" playsinline muted autoplay loop controls aria-label="Demonstração da venda automatizada no WhatsApp da Loja Instituto Percorre"></video></div></div></article><article class="suri-story suri-story--desk"><div class="suri-copy"><p class="suri-kicker">Venda assistida</p><h2>Suri + TOTVS Pay: seu time atende, vende e recebe</h2></div><div class="device-laptop"><div class="device-laptop__bezel"><video src="suri/venda-assistida.mp4" poster="suri/poster-assistida.jpg" playsinline muted autoplay loop controls aria-label="Demonstração da venda assistida no painel da Suri"></video></div><div class="device-laptop__base" aria-hidden="true"></div></div></article></div><aside class="suri-card"><img class="suri-brand" src="instituto-percorre-mark.png" alt="Instituto Percorre"><a class="suri-qr" href="https://wa.me/5511975019280" target="_blank" rel="noreferrer"><img src="suri-qr.png" alt="QR Code da Suri Shop no WhatsApp"></a><p>Acesse o QR Code, apoie o Instituto Percorre e retire a sua compra diretamente na loja durante o <strong>Universo TOTVS</strong>!</p></aside></div></div>';
}
function showPublicSuri(){
  const app=document.getElementById('app');
  const root=document.getElementById('crm-root');
  const ck=document.getElementById('checkout-root');
  const loginNav=document.getElementById('login-nav');
  const crmNav=document.getElementById('crm-nav');
  if(!app||!root) return;
  root.hidden=false;
  root.classList.add('is-login','is-suri');
  if(ck) ck.hidden=true;
  if(loginNav) loginNav.hidden=false;
  if(crmNav) crmNav.hidden=true;
  app.innerHTML=suriHTML();
}
function goProduct(id){
  if(window.__pdNavigate && (id==='rd'||id==='suri'||id==='checkout')){window.__pdNavigate(id);return}
  const root=experienceRoot();
  if(id==='totvs'||id==='totvs-credenciamento'){try{sessionStorage.setItem('totvs-onboarded','0')}catch(e){}location.assign(root+'totvs/');return}
  if(id==='totvs-dashboard'){try{sessionStorage.setItem('totvs-onboarded','1')}catch(e){}location.assign(root+'totvs/dashboard');return}
  if(id==='construcao'){location.assign(root+'construcao/');return}
  if(id==='suri'){location.hash='suri';showPublicSuri();return}
  if(id==='rd'){location.hash='deal';if(sessionPass()){loadFlow(sessionPass());return}renderLogin();return}
  if(id==='checkout'){location.hash='checkout';if(sessionPass()){loadFlow(sessionPass());return}renderLogin()}
}
document.addEventListener('click',ev=>{
  const toggle=ev.target.closest('[data-act="toggle-products"]');
  if(toggle){
    ev.preventDefault();
    const wrap=toggle.closest('.product-switch');
    const menu=wrap&&wrap.querySelector('.product-switch__menu');
    const willOpen=menu&&menu.hidden;
    document.querySelectorAll('.product-switch__menu').forEach(m=>m.hidden=true);
    document.querySelectorAll('[data-act="toggle-products"]').forEach(b=>b.setAttribute('aria-expanded','false'));
    if(willOpen){menu.hidden=false;toggle.setAttribute('aria-expanded','true')}
    return;
  }
  const item=ev.target.closest('[data-product]');
  if(item && !item.disabled){
    document.querySelectorAll('.product-switch__menu').forEach(m=>m.hidden=true);
    goProduct(item.dataset.product);
    return;
  }
  if(!ev.target.closest('.product-switch')){
    document.querySelectorAll('.product-switch__menu').forEach(m=>m.hidden=true);
    document.querySelectorAll('[data-act="toggle-products"]').forEach(b=>b.setAttribute('aria-expanded','false'));
  }
});
async function unlock(){
  if(!(state.user.trim()&&state.pass&&state.product)||state.busy) return;
  const uh=await sha256(normUser(state.user));
  const ph=await sha256('pd-ai|'+state.pass);
  const ok=uh===PILOTO?ph===PILOTO_PASS:(USERS.has(uh)&&ph===PASS);
  if(!ok){state.error='Usuário ou senha inválidos';renderLogin();return}
  rememberSession(state.pass);
  const root=experienceRoot();
  if(state.product==='totvs'||state.product==='totvs-credenciamento'){try{sessionStorage.setItem('totvs-onboarded','0')}catch(e){}location.assign(root+'totvs/');return}
  if(state.product==='totvs-dashboard'){try{sessionStorage.setItem('totvs-onboarded','1')}catch(e){}location.assign(root+'totvs/dashboard');return}
  if(state.product==='construcao'){location.assign(root+'construcao/');return}
  if(state.product==='suri'){location.hash='suri';showPublicSuri();return}
  if(state.product==='checkout') location.hash='checkout';
  else location.hash='deal';
  state.busy=true;state.error='';renderLogin();
  const loaded=await loadFlow(state.pass);
  if(!loaded){state.busy=false;state.error='Não foi possível carregar o fluxo';renderLogin()}
}
function isReload(){
  try{const nav=performance.getEntriesByType('navigation')[0];if(nav) return nav.type==='reload'}catch(e){}
  return performance.navigation&&performance.navigation.type===1;
}
function sessionPass(){
  try{return sessionStorage.getItem('pd-ai-pass')||''}catch(e){return ''}
}
function rememberSession(pass){
  try{sessionStorage.setItem('pd-ai-auth',PASS);if(pass) sessionStorage.setItem('pd-ai-pass',pass)}catch(e){}
}
function clearSession(){
  try{sessionStorage.removeItem('pd-ai-auth');sessionStorage.removeItem('pd-ai-pass')}catch(e){}
}
async function loadFlow(password){
  if(window.__pdNavigate) return true;
  try{
    rememberSession(password);
    const res=await fetch('flow.enc',{cache:'no-store'});
    if(!res.ok) throw new Error('missing');
    const payload=JSON.parse(await decrypt(await res.arrayBuffer(),password));
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
    return true;
  }catch(err){
    return false;
  }
}
if(isReload()) clearSession();
(async function boot(){
  if(location.hash==='#suri'){showPublicSuri();return}
  const pass=sessionPass();
  if(pass){
    const loaded=await loadFlow(pass);
    if(loaded) return;
    clearSession();
  }
  renderLogin();
})();`

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

