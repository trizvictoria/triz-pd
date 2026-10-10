const $=s=>document.querySelector(s), modal=$('#modal'), body=$('#modal-body'), foot=$('#modal-footer');
const currency=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n), dateLabel=d=>d.split('-').reverse().join('/');
const PAYMENT_URL='https://totvspay.com/l/8e93099f-182a-4a00-affb-7e0d3f28c705';
const storageKey='evento-adiantamento-v1';let charge=null,draft=null,toastTimer;
function paymentLink(){return PAYMENT_URL}
function normalizeCharge(data){if(!data)return null;if(!data.url||String(data.url).includes('pagamento.example'))data.url=paymentLink();return data}
function flowBase(){const p=location.pathname;const i=p.indexOf('/construcao');return i>=0?`${p.slice(0,i+11)}/`:'./'}
function syncAdvanceCheckout(){if(!charge)return;try{sessionStorage.setItem('pd-construcao-advance',JSON.stringify({status:charge.status==='cancelled'?'cancelled':'waiting',amount:charge.value,dueLabel:dateLabel(charge.date),createdLabel:charge.created,url:charge.url||paymentLink(),components:[]}))}catch{}}
try{charge=normalizeCharge(JSON.parse(localStorage.getItem(storageKey)))}catch{}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(charge))}catch{}syncAdvanceCheckout();summary()}
function summary(){$('#advance-summary').textContent=charge&&charge.status!=='cancelled'?currency(charge.value):'-'}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',3500)}
function close(){modal.close();$('#open-advance').focus()}
function show(){if(!modal.open)modal.showModal();body.scrollTop=0}
const components=['Ato','Entrada 02','Entrada 03','Mensal','Intermediaria','Bimestral','Trimestral','FB','Semestral','Anual'];
$('#rows').innerHTML=components.map((c,i)=>{const amount=i===0?'300,00':i===3?'4.600,00':i===7?'13.000,00':'200,00';return `<tr><td>⠿</td><td>✓</td><td><span class="cell gray">${c}</span></td><td><span class="cell ${i<3?'gray':''}">1</span></td><td><span class="cell">05/${i<3?'05':'06'}/2025</span></td><td>▦</td><td><span class="cell money">${amount}</span></td><td><span class="cell gray">${i===0?'5,00':i===3?'23,00':i===7?'65,00':'1,00'}</span></td><td><span class="cell money">${amount}</span></td><td><span class="check ${i<4?'checked':''}">${i<4?'✓':''}</span></td><td><span class="cell gray money">${i===0?'700,00':'0,00'}</span></td><td><span class="check"></span></td><td class="dots">···</td></tr>`}).join('');
function parseValue(v){v=v.replace(/[^\d,.]/g,'');if(v.includes(','))return Number(v.replace(/\./g,'').replace(',','.'));return Number(v)}
function form(){body.className='modal-body form-view';body.innerHTML=`<div class="notice">ATENÇÃO</div><form id="advance-form"><label class="field" for="amount">Valor R$ da Cobrança <em>*</em><input id="amount" inputmode="decimal" autocomplete="off" placeholder="R$ 0,00" required></label><div class="form-grid"><label class="field" for="expiration">Expiração da cobrança <em>*</em><select id="expiration"><option>Data de Vencimento</option></select></label><label class="field" for="due">Data de Vencimento <em>*</em><input id="due" type="date" required value="2026-10-07"></label></div><p class="error" id="form-error" role="alert" hidden>Informe um valor maior que zero e uma data válida.</p></form>`;
foot.innerHTML='<button id="close">Fechar</button><button class="primary" id="generate" form="advance-form" type="submit" disabled>Gerar link de pagamento</button>';
if(draft){$('#amount').value=currency(draft.value);$('#due').value=draft.date}
const validate=()=>{$('#generate').disabled=!(parseValue($('#amount').value)>0&&$('#due').validity.valid&&$('#due').value)};
$('#amount').oninput=validate;$('#amount').onblur=()=>{let v=parseValue($('#amount').value);if(Number.isFinite(v)&&v>0)$('#amount').value=currency(v)};$('#due').oninput=validate;$('#close').onclick=close;
$('#advance-form').onsubmit=e=>{e.preventDefault();let value=parseValue($('#amount').value);if(!Number.isFinite(value)||value<=0||!$('#due').value){$('#form-error').hidden=false;return}const stamp=new Date();charge={value,date:$('#due').value,created:stamp.toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})+' às '+stamp.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}),id:globalThis.crypto?.randomUUID?.()||String(Date.now()),status:'waiting',component:null,url:paymentLink()};draft=null;persist();result();};validate();show();$('#amount').focus();}
function result(){if(!charge)return form();body.className='modal-body result-view';const cancelled=charge.status==='cancelled',applied=charge.status==='applied';const status=cancelled?'Cancelado':applied?'Adiantamento aplicado':'Aguardando pagamento';
body.innerHTML=`<div class="result-card"><p>Geramos um link de pagamento de</p><p class="amount">${currency(charge.value)}</p><p><b>Compartilhe para cobrar!</b></p><p class="status-line"><b>Status:</b><span class="status ${cancelled?'cancelled':applied?'applied':''}">${status}</span></p></div><h4>Link gerado</h4><div class="share-grid"><div class="share-left"><input id="payment-link" aria-label="Link gerado" readonly><button id="copy" ${cancelled?'disabled':''}>Copiar link</button><div class="share-buttons"><button class="whatsapp" data-share="WhatsApp" ${cancelled?'disabled':''}>WhatsApp</button><button data-share="E-mail" ${cancelled?'disabled':''}>E-mail</button><button data-share="SMS" ${cancelled?'disabled':''}>SMS</button></div></div><img class="qr" src="assets/qr-demo.svg" alt="QR Code demonstrativo"></div><h4>Informações do link de pagamento</h4><div class="info-box"><p><b>Cobrança criada:</b> <span id="created"></span></p><p><b>Data de expiração:</b> ${dateLabel(charge.date)}</p></div><p class="component-title">Onde deseja abater o adiantamento?</p><p class="muted">Selecione um componente de entrada com saldo suficiente.</p><div id="choices"></div><div class="apply-line"><button id="apply" disabled>${applied?'Adiantamento aplicado':'Aplicar adiantamento no componente'}</button></div><div class="bottom-actions"><button class="danger" id="cancel" ${cancelled?'disabled':''}>${cancelled?'Adiantamento cancelado':'Cancelar adiantamento'}</button><button id="new-link">Gerar novo link de pagamento</button></div>`;
charge.url=paymentLink();$('#created').textContent=charge.created;$('#payment-link').value=charge.url;persist();
// Os saldos seguem a referência visual do modal; este protótipo não calcula a proposta.
$('#choices').innerHTML=[['Ato',45727.85],['Entrada 02',9145.57],['Entrada 03',9145.57]].map(([name,balance])=>`<label class="component"><input type="radio" name="component" value="${name}" ${cancelled||applied||charge.value>balance?'disabled':''} ${charge.component===name?'checked':''}><b>${name}</b><span class="balance"><small>Saldo disponível</small><b>${currency(balance)}</b></span></label>`).join('');
document.querySelectorAll('[name=component]').forEach(el=>el.onchange=()=>$('#apply').disabled=false);
$('#apply').onclick=()=>{const selected=$('[name=component]:checked');if(!selected)return;charge.component=selected.value;charge.status='applied';persist();result();toast('Adiantamento aplicado em '+charge.component+'. Demonstração concluída.')};
$('#copy').onclick=async()=>{const input=$('#payment-link');try{await navigator.clipboard.writeText(input.value);toast('Link copiado.')}catch{input.focus();input.select();toast('Link selecionado. Pressione Ctrl+C para copiar.')}};
document.querySelectorAll('[data-share]').forEach(el=>el.onclick=()=>{if(charge?.status==='cancelled')return;const kind=el.dataset.share;if(kind==='WhatsApp'){syncAdvanceCheckout();location.assign(flowBase()+'whatsapp/');return}if(kind==='E-mail'){syncAdvanceCheckout();location.assign(flowBase()+'email/');return}toast('Mensagem de SMS pronta com o link de pagamento: '+(charge?.url||paymentLink()))});
$('#cancel').onclick=confirmCancel;$('#new-link').onclick=()=>{draft={value:charge.value,date:charge.date};form()};foot.innerHTML='<button id="close">Fechar</button>';$('#close').onclick=close;show();}
function confirmCancel(){body.className='modal-body confirm-view';body.innerHTML=`<h3>Cancelar adiantamento?</h3><p>O link de pagamento de <b>${currency(charge.value)}</b>, com vencimento em <b>${dateLabel(charge.date)}</b>, será cancelado.</p><p>Você poderá gerar um novo link de pagamento depois.</p>`;foot.innerHTML='<button id="keep">Voltar</button><button class="primary" id="confirm-cancel">Confirmar cancelamento</button>';$('#keep').onclick=result;$('#confirm-cancel').onclick=()=>{charge.status='cancelled';charge.component=null;persist();result();toast('Adiantamento cancelado.')};show()}
$('#open-advance').onclick=()=>{if(charge&&charge.status!=='cancelled')draft={value:charge.value,date:charge.date};form()};$('#toggle-table').onclick=()=>{const hidden=$('#payment-table').hidden;$('#payment-table').hidden=!hidden;$('#toggle-table').setAttribute('aria-expanded',String(hidden))};
$('#reset').onclick=()=>{charge=null;draft=null;persist();if(modal.open)close();window.scrollTo({top:0,behavior:'smooth'});toast('Demonstração reiniciada.')};
document.querySelectorAll('[data-demo]').forEach(el=>el.onclick=()=>toast('Para demonstrar o fluxo, clique em Adiantamento.'));
modal.addEventListener('cancel',()=>setTimeout(()=>$('#open-advance').focus(),0));summary();
const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const people='<circle cx="9" cy="8" r="4"/><path d="M2 20c0-8 14-8 14 0M16 4c6 0 6 8 0 8m2 3c3 0 5 2 5 5"/>';
const documentIcon='<path d="M5 3h10l4 4v14H5zM14 3v5h5M9 12h6m-6 4h6"/>';
const calendar='<path d="M4 5h16v16H4zM4 10h16M8 3v5m8-5v5M8 14h2m4 0h2m-8 3h2"/>';
const sideIcons=['<path d="M3 18v-4a9 9 0 0 1 15-7M6 17v-3a6 6 0 0 1 9-5M3 18h18v-7M9 17 21 5"/>',people,'<path d="M3 21h19M5 21V8l9-5v18m0-12h6v12M8 9v2m3-3v2m-3 4v2m3-3v2m-3 4v2m8-8v2m0 2v2"/>',documentIcon,documentIcon,people,'<path d="m9 3 1-2h4l1 3 3 1 3-1 2 4-2 2v4l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-4L1 8l2-4 3 1z" transform="translate(2 2) scale(.83)"/><circle cx="12" cy="12" r="3"/>',calendar];
document.querySelectorAll('aside>span').forEach((el,i)=>el.innerHTML=icon(sideIcons[i]));
$('.header-icons').innerHTML=icon('<path d="m15 2 7 7-5 2-4 5-3-3-7 8 6-9-3-3 5-2z"/>')+icon('<path d="M5 5h.1M12 5h.1M19 5h.1M5 12h.1M12 12h.1M19 12h.1M5 19h.1M12 19h.1M19 19h.1" stroke-width="2.5"/>')+icon('<path d="M19 14a8 8 0 1 0-14 2l-2 5 6-2a8 8 0 0 0 10-5zM8 8h7m-7 4h4"/>')+'<span class="avatar">M</span>';
$('.steps .active i').innerHTML=icon('<path d="m4 15 11-11 5 5L9 20H4zM13 6l5 5"/>');
(function mountFlow(){
  const steps=[
    ['form','1. Gerar link'],
    ['share','2. Link gerado'],
    ['whatsapp','3. WhatsApp'],
    ['email','4. E-mail'],
    ['checkout','5. Checkout'],
    ['payment','6. Pagamento'],
    ['cancel','7. Cancelar']
  ];
  const nav=document.createElement('div');
  nav.className='flow-nav';
  nav.innerHTML='<div class="flow-nav-menu" hidden>'+steps.map(([id,label])=>'<button type="button" data-flow="'+id+'">'+label+'</button>').join('')+'</div><button type="button" class="flow-nav-toggle">Fluxo do protótipo</button>';
  document.body.appendChild(nav);
  const menu=nav.querySelector('.flow-nav-menu');
  nav.querySelector('.flow-nav-toggle').onclick=()=>{menu.hidden=!menu.hidden};
  function ready(){return charge&&charge.status!=='cancelled'}
  nav.querySelectorAll('[data-flow]').forEach(button=>button.onclick=()=>{
    menu.hidden=true;
    const id=button.dataset.flow;
    if(id==='form'||!ready()){form();return}
    if(id==='share'){result();return}
    if(id==='cancel'){confirmCancel();return}
    syncAdvanceCheckout();
    const base=flowBase();
    if(id==='whatsapp') location.assign(base+'whatsapp/');
    else if(id==='email') location.assign(base+'email/');
    else if(id==='payment') location.assign(base+'checkout/?etapa=pagamento');
    else location.assign(base+'checkout/');
  });
})();
