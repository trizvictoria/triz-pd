const USERS=new Set(['0e1733efb669979a709f05ba0a8d2725095193cf81fd05b75b7cefe5c48e03f9','d919a100ce6b45524d415d52d088d5817587c6dd8c3691b03b8063c44d043523','a3418631ddce958c2fe2206cb362d390c2cc59c86b6ef2083b3d7cbe38e9140d','047007876c105127d9e0299df5dcea30b9fa5fae71be6f9d10ddb6357981cb9c','ccc68482d9e0eee0789e64c7674421076738f8836857ea89bcd0afb832bf3fc3','80c0fcbbfa9d03d861b22230e67c380afb545c12de43094f3985128625858361','3db6c5da02e8275b4cd5d64d91d628b51e0028c3c8a915570492c34ab9e1fdd1','33129567e0bd787efb15a26307e5311e06ba66e3b8dbc2206ad59f99780a4d78','24d4b96f58da6d4a8512313bbd02a28ebf0ca95dec6e4c86ef78ce7f01e788ac']);
const PASS='e9e69fcd703e857da732ae1e8c0d839920a24cb3407cc98440c04a4c7b62545d';
const PILOTO='ef9d5711a95ddcc209cf8d01664f22d88289cacef4deb6921618b067e0a79c2c';
const PILOTO_PASS='6064eb690ce09822d7b456c5f7d862fabbc5e29b12387e45361e053cb6ff25f1';
function normUser(v){return (v||'').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu,'')}
async function sha256(s){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function decryptSlice(bytes,password){
  const salt=bytes.slice(0,16);
  const iv=bytes.slice(16,28);
  const data=bytes.slice(28);
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
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
function experienceRoot(){
  const p=location.pathname;
  const i=p.search(new RegExp('/(totvs|construcao|educacional|winthor)(?:/|$)'));
  if(i>=0) return p.slice(0,i)+'/';
  return p.endsWith('/')?p:p.replace(/[^/]+$/,'');
}
function suriHTML(){
  return '<div class="suri"><div class="suri-main"><div class="suri-stories"><div class="suri-rail" aria-hidden="true"><span class="suri-rail__dot is-on"></span><span class="suri-rail__line"><span class="suri-rail__fill"></span></span><span class="suri-rail__dot suri-rail__dot--next"></span></div><article class="suri-story"><div class="suri-copy"><p class="suri-kicker" data-suri-mark="automatizada">Venda automatizada</p><h1>Suri + TOTVS Pay: a jornada de venda completa, automatizada com IA</h1></div><div class="device-phone"><div class="suri-screen"><video src="suri/venda-automatizada.mp4" poster="suri/poster-automatizada.jpg" playsinline preload="metadata" aria-label="Demonstração da venda automatizada no WhatsApp da Loja Instituto Percorre"></video><button type="button" class="suri-play" data-suri-play aria-label="Reproduzir vídeo"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M10 7.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg></button></div></div></article><article class="suri-story suri-story--desk"><div class="suri-copy"><p class="suri-kicker" data-suri-mark="assistida">Venda assistida</p><h2>Suri + TOTVS Pay: seu time atende, vende e recebe</h2></div><div class="device-laptop"><div class="device-laptop__bezel"><div class="suri-screen"><video src="suri/venda-assistida.mp4" poster="suri/poster-assistida.jpg" playsinline preload="metadata" aria-label="Demonstração da venda assistida no painel da Suri"></video><button type="button" class="suri-play" data-suri-play aria-label="Reproduzir a venda assistida"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M10 7.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg></button></div></div><div class="device-laptop__base" aria-hidden="true"></div></div></article></div></div></div>';
}
function bindSuri(){
  const root=document.querySelector('.suri');
  if(!root) return;
  root.querySelectorAll('[data-suri-play]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const video=btn.parentElement&&btn.parentElement.querySelector('video');
      if(!video) return;
      video.controls=true;
      const played=video.play();
      btn.hidden=true;
      video.onended=()=>{btn.hidden=false;video.controls=false;video.currentTime=0};
      if(played&&played.catch) played.catch(()=>{btn.hidden=false});
    });
  });
  const scroller=document.querySelector('.content');
  const fill=root.querySelector('.suri-rail__fill');
  const stories=root.querySelector('.suri-stories');
  const nextDot=root.querySelector('.suri-rail__dot--next');
  const nextMark=root.querySelector('[data-suri-mark="assistida"]');
  if(!scroller||!fill||!stories) return;
  const sync=()=>{
    const max=scroller.scrollHeight-scroller.clientHeight;
    const progress=max<=8?1:Math.min(1,Math.max(0,scroller.scrollTop/max));
    fill.style.height=(progress*100)+'%';
    if(nextDot&&nextMark&&nextDot.parentElement){
      const rail=nextDot.parentElement;
      const top=nextMark.getBoundingClientRect().top-rail.getBoundingClientRect().top;
      nextDot.style.top=Math.max(0,top)+'px';
      nextDot.classList.toggle('is-on', rail.clientHeight>0 && progress>=top/rail.clientHeight);
    }
  };
  sync();
  scroller.addEventListener('scroll',sync,{passive:true});
  window.addEventListener('resize',sync);
}
function showPublicSuri(){
  setGate(false);
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
  bindSuri();
}
function goProduct(id){
  if(id==='totvs'||id==='totvs-credenciamento'||id==='totvs-dashboard') rememberSession(FLOW_KEY);
  const root=experienceRoot();
  if(id==='interesse'){location.assign(root+'interesse/');return}
  if(id==='inicio'){location.assign(root+'#inicio');return}
  if(window.__pdNavigate && (id==='rd'||id==='suri'||id==='checkout')){setGate(false);window.__pdNavigate(id);return}
  if(id==='totvs'||id==='totvs-credenciamento'){try{sessionStorage.setItem('totvs-onboarded','0')}catch(e){}location.assign(root+'totvs/');return}
  if(id==='totvs-dashboard'){try{sessionStorage.setItem('totvs-onboarded','1')}catch(e){}location.assign(root+'totvs/dashboard');return}
  if(id==='construcao'){location.assign(root+'construcao/');return}
  if(id==='educacional'){location.assign(root+'educacional/');return}
  if(id==='winthor'){location.assign(root+'winthor/');return}
  if(id==='suri'){location.hash='suri';showPublicSuri();return}
  if(id==='rd'){if(location.hash!=='#deal') location.hash='deal'; else enterFlow(); return}
  if(id==='checkout'){if(location.hash!=='#checkout') location.hash='checkout'; else enterFlow(); return}
}
document.addEventListener('click',ev=>{
  if(ev.target.closest('[data-act="start-experience"]')){
    ev.preventDefault();
    if(location.hash!=='#experiencias') location.hash='experiencias';
    else showHub();
    return;
  }
  if(ev.target.closest('[data-act="back-totem"]')){
    ev.preventDefault();
    if(location.hash!=='#inicio') location.hash='inicio';
    else showTotem();
    return;
  }
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
    ev.preventDefault();
    document.querySelectorAll('.product-switch__menu').forEach(m=>m.hidden=true);
    goProduct(item.dataset.product);
    return;
  }
  if(!ev.target.closest('.product-switch')){
    document.querySelectorAll('.product-switch__menu').forEach(m=>m.hidden=true);
    document.querySelectorAll('[data-act="toggle-products"]').forEach(b=>b.setAttribute('aria-expanded','false'));
  }
});
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
const EXPERIENCES=[
  ['totvs-credenciamento','TOTVS Pay','Credenciamento','Abra a conta e comece a receber.'],
  ['totvs-dashboard','TOTVS Pay','Dashboard','Acompanhe os recebimentos do dia a dia.'],
  ['rd','CRM','RD Vendas','Crie links de pagamento na negociação.'],
  ['construcao','Obras','Construção','Adiantamento e proposta da obra.'],
  ['educacional','Portal','Educacional','Pagamentos no portal do aluno.'],
  ['winthor','ERP','Winthor','Recebimentos no fluxo do Winthor.'],
  ['suri','WhatsApp','Suri Shop','Venda automatizada e assistida.'],
  ['checkout','Pagamento','Checkout','A experiência de quem paga.']
];
const FLOW_KEY='123';
let opening=false;
function setGate(on){
  document.body.classList.toggle('is-gate', !!on);
  const gate=document.getElementById('gate');
  const root=document.getElementById('crm-root');
  const checkout=document.getElementById('checkout-root');
  const banner=document.querySelector('.demo-banner');
  if(gate) gate.hidden=!on;
  if(root) root.hidden=!!on;
  if(on && checkout) checkout.hidden=true;
  if(banner) banner.hidden=!!on;
}
function compactHTML(){
  return `<section class="totem-compact" hidden>
    <header class="tc-top"><div class="tc-brand"><img src="totvs-logo-navy.svg" alt="TOTVS"><strong>Pay</strong></div><span class="tc-live"><i></i><span>Ao vivo no Stand TOTVS Pay</span></span></header>
    <span class="tc-badge">Desafio Cultural TOTVS Pay</span>
    <h1 class="tc-title">Sua visão<br>vale <span>prêmios!</span></h1>
    <p class="tc-lead">TOTVS Pay pela perspectiva de quem mais importa: <em>o cliente.</em></p>
    <div class="tc-main">
      <ol class="tc-steps">
        <li class="tc-step"><b>1</b><div><strong>Poste no LinkedIn</strong><p>Foto ou vídeo e conte o que é o TOTVS Pay.</p></div></li>
        <li class="tc-step"><b>2</b><div><strong>Marque e engaje</strong><p>@TOTVS #TOTVSPay #LançamentoTOTVSPay</p></div></li>
        <li class="tc-step"><b>3</b><div><strong>Ganhe</strong><p>21 frases criativas levam brindes.</p></div></li>
      </ol>
      <aside class="tc-panel">
        <div><div class="tc-21">21<small>frases<br>premiadas</small></div><p>Resultado 14/10 · 16h, no Stand TOTVS Pay.</p></div>
        <div class="tc-meta"><div><span>Resultado</span><strong>14/10 · 16h</strong></div><div><span>Retirada</span><strong>Sala de Apoio do Marketing</strong></div></div>
        <button type="button" class="tc-cta tp-cta" data-act="start-experience">Iniciar experiência<i aria-hidden="true">→</i></button>
      </aside>
    </div>
  </section>`;
}
function fitTotem(){
  const stage=document.querySelector('.totem-stage');
  if(!stage) return;
  const wrap=stage.querySelector('.totem-canvas-wrap');
  const compact=stage.querySelector('.totem-compact');
  if(!wrap||!compact) return;
  const scale=Math.min(stage.clientWidth/1920, stage.clientHeight/1080);
  const useCompact=scale<0.58;
  wrap.hidden=useCompact;
  compact.hidden=!useCompact;
  if(!useCompact){wrap.style.transform=`translate(-50%, -50%) scale(${scale})`;return}
  compact.style.transform='none';
  compact.style.width=stage.clientWidth+'px';
  const fit=Math.min(1, stage.clientHeight/compact.scrollHeight, stage.clientWidth/compact.scrollWidth);
  compact.style.transform=`scale(${fit})`;
}
function showTotem(){
  setGate(true);
  const tpl=document.getElementById('totem-canvas-tpl');
  document.getElementById('gate').innerHTML=`<div class="totem-stage"><div class="totem-canvas-wrap">${tpl?tpl.innerHTML:''}</div>${compactHTML()}</div>`;
  requestAnimationFrame(fitTotem);
}
function hubCompactHTML(){
  const cards=[
    ['totvs-credenciamento','TOTVS Pay','Credenciamento','Abra a conta de pagamentos em poucos passos.',1],
    ['totvs-dashboard','TOTVS Pay','Dashboard','Acompanhe vendas e recebimentos num só lugar.',1],
    ['checkout','TOTVS Pay','Checkout','Pague com Pix, cartão ou boleto.',0],
    ['rd','RD Station','RD Vendas','Cobre direto da negociação no CRM.',0],
    ['educacional','TOTVS','Educacional','Mensalidades por Pix, cartão e boleto.',0],
    ['construcao','TOTVS','Construção','Pagamentos no dia a dia da obra.',0],
    ['winthor','TOTVS','Winthor','Recebimentos integrados ao ERP.',0],
    ['suri','Suri','Suri Shop','Compra e pagamento pela loja da Suri.',0]
  ].map(([id,kicker,title,text,cyan])=>`<a href="#experiencia" data-product="${id}" class="hc-card${cyan?' is-cyan':''}"><span>${kicker}</span><strong>${title}</strong><p>${text}</p></a>`).join('');
  return `<section class="totem-compact hc" hidden><header class="hc-top"><strong>TOTVS Pay</strong><a href="#inicio" class="hc-back" data-act="back-totem">Voltar</a></header><h1 class="hc-title">Escolha sua <span>experiência</span></h1><nav class="hc-grid" aria-label="Experiências">${cards}</nav><a class="hc-interest" href="interesse/">Gostou? Entre na lista de interesse</a></section>`;
}
function showHub(error){
  setGate(true);
  const tpl=document.getElementById('hub-canvas-tpl');
  const gate=document.getElementById('gate');
  gate.innerHTML=`<div class="totem-stage"><div class="totem-canvas-wrap">${tpl?tpl.innerHTML:''}</div>${hubCompactHTML()}</div>`;
  if(error){
    const note=document.createElement('p');
    note.className='hub-error';
    note.textContent=error;
    gate.appendChild(note);
  }
  requestAnimationFrame(fitTotem);
}
async function enterFlow(){
  if(window.__pdNavigate||opening) return;
  opening=true;
  setGate(true);
  const gate=document.getElementById('gate');
  if(gate) gate.innerHTML='<p class="gate-loading">Abrindo experiência…</p>';
  const ok=await loadFlow(FLOW_KEY);
  opening=false;
  if(ok){setGate(false);return}
  showHub('Não foi possível abrir esta experiência.');
}
function route(){
  const h=location.hash.replace('#','');
  if(h===''||h==='inicio'){showTotem();return}
  if(h==='experiencias'){showHub();return}
  if(window.__pdNavigate){setGate(false);return}
  if(h==='suri'){showPublicSuri();return}
  if(h==='deal'||h==='checkout'){enterFlow();return}
  showTotem();
}
window.addEventListener('resize',()=>{ if(document.querySelector('.totem-stage')) fitTotem(); });
window.addEventListener('hashchange',route);
if(isReload()) clearSession();
route();
