/* ONE MORE SEASON — Player Career Transfer Centre
   UI + transfer layer. Designed to work beside the existing simulation without replacing it. */
(function(){
  'use strict';
  const CLUBS=[
    {name:'Real Madrid',league:'LaLiga',stars:5,fee:52000000,salary:42000},
    {name:'FC Barcelona',league:'LaLiga',stars:5,fee:48000000,salary:39000},
    {name:'Manchester City',league:'Premier League',stars:5,fee:60000000,salary:45000},
    {name:'Liverpool',league:'Premier League',stars:5,fee:47000000,salary:36000},
    {name:'Arsenal',league:'Premier League',stars:5,fee:43000000,salary:33000},
    {name:'Bayern Munich',league:'Bundesliga',stars:5,fee:50000000,salary:40000},
    {name:'PSG',league:'Ligue 1',stars:5,fee:46000000,salary:41000},
    {name:'Borussia Dortmund',league:'Bundesliga',stars:4,fee:30000000,salary:26000},
    {name:'Inter',league:'Serie A',stars:4,fee:28000000,salary:24000},
    {name:'AC Milan',league:'Serie A',stars:4,fee:26000000,salary:22000},
    {name:'Atlético Madrid',league:'LaLiga',stars:4,fee:27000000,salary:23000},
    {name:'Aston Villa',league:'Premier League',stars:4,fee:22000000,salary:19000}
  ];
  const KEY='oms_transfer_centre_v2';
  const money=n=>`€${Math.max(0,Math.round(Number(n)||0)).toLocaleString('en-US')}`;
  const getState=()=>window.state||null;
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||{inbox:[],offers:[],rumours:[],reactions:[],loan:null,asked:false}}catch(e){return {inbox:[],offers:[],rumours:[],reactions:[],loan:null}}}
  let data=load();
  function save(){localStorage.setItem(KEY,JSON.stringify(data));}
  function currentClub(){const s=getState();return s?.club||'Hillcrest Academy';}
  function playerName(){const s=getState();return s?.name||'Your player';}
  function ovr(){const s=getState();return Number(s?.ovr)||67;}
  function valuation(){return Math.round((1200000+Math.max(0,ovr()-60)*850000)*(1+(data.reputation||0)/100));}
  function star(n){return '★'.repeat(n)+'☆'.repeat(5-n)}
  function toast(msg){if(typeof window.toast==='function')return window.toast(msg);const t=document.querySelector('.toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}}
  function addInbox(type,title,body,club){data.inbox.unshift({id:Date.now()+Math.random(),type,title,body,club,unread:true,day:getState()?.day||1});data.inbox=data.inbox.slice(0,12);save();showMail(data.inbox[0]);render();}
  function showMail(m){
    const old=document.querySelector('.oms-transfer-overlay');if(old)old.remove();
    const el=document.createElement('div');el.className='oms-transfer-overlay';el.innerHTML=`<div class="oms-transfer-mail" role="dialog" aria-modal="true"><div class="oms-transfer-mailtop"><span>✉ TRANSFER DESK · NEW MESSAGE</span><button type="button" data-mail-close aria-label="Close">×</button></div><div class="eyebrow">${m.type==='offer'?'OFFICIAL OFFER':m.type==='loan'?'LOAN INTEREST':'TRANSFER RUMOUR'}</div><h2>${m.title}</h2><p>${m.body}</p><div class="oms-transfer-mailactions"><button class="action" type="button" data-mail-action="open">OPEN TRANSFER DESK</button><button class="action secondary" type="button" data-mail-close>OK</button></div></div>`;
    document.body.appendChild(el);el.querySelectorAll('[data-mail-close]').forEach(b=>b.onclick=()=>el.remove());el.querySelector('[data-mail-action]').onclick=()=>{el.remove();openTransfers();};
    m.unread=false;save();
  }
  function maybeNews(){
    const s=getState();if(!s)return;
    const day=Number(s.day)||1;
    if(day>1 && day%9===0 && !data.rumours.some(x=>x.day===day)){
      const candidates=CLUBS.filter(c=>c.name!==currentClub() && c.stars>=4 && c.fee<=valuation()*2.4);
      if(candidates.length){const c=candidates[Math.floor(Math.random()*candidates.length)];data.rumours.unshift({day,club:c.name,text:`${c.name} have added ${playerName()} to their shortlist. Scouts are monitoring recent performances.`});addInbox('rumour',`${c.name} are watching you`,`${c.name} have reportedly added you to their shortlist. Nothing is official yet — keep performing to turn interest into an offer.`,c.name);}}
    if(day>10 && day%17===0 && !data.offers.some(x=>x.day===day)){
      const candidates=CLUBS.filter(c=>c.name!==currentClub() && c.stars>=4);
      if(candidates.length && ovr()>=68){const c=candidates[Math.floor(Math.random()*candidates.length)];const fee=Math.round(c.fee*(.82+Math.random()*.32));const salary=Math.round(c.salary*(.85+Math.random()*.3));data.offers.unshift({id:Date.now(),day,club:c.name,league:c.league,fee,salary,kind:'transfer',status:'pending'});addInbox('offer',`Official interest from ${c.name}`,`${c.name} have made an offer worth ${money(fee)} for you. Proposed salary: ${money(salary)} per week. You can accept, reject, or ask your coach about the move.`,c.name);}}
  }
  function askCoach(){
    const s=getState();if(!s)return toast('Start a career first.');
    data.asked=true;const club=currentClub();const value=valuation();
    data.reactions.unshift({day:s.day||1,type:'coach',text:`Coach: “I know you want to develop. We will listen to serious approaches, but your role at ${club} depends on your performances.”`});
    toast('You asked the coach about your transfer situation.');render();save();
  }
  function requestTransfer(){
    const s=getState();if(!s)return toast('Start a career first.');
    data.reactions.unshift({day:s.day||1,type:'request',text:`You told the coach you want to explore a transfer. The club will consider suitable offers.`});
    addInbox('rumour','Transfer request registered',`Your request to explore a new club has been recorded. Your agent will now monitor suitable opportunities.`,'');
  }
  function requestLoan(){
    const s=getState();if(!s)return toast('Start a career first.');
    const candidates=CLUBS.filter(c=>c.name!==currentClub()).slice(0,5);const c=candidates[Math.floor(Math.random()*candidates.length)];
    data.loan={club:c.name,until:Number(s.day||1)+90,status:'requested'};data.reactions.unshift({day:s.day||1,type:'loan',text:`Loan request sent to ${c.name}. A loan can give you regular minutes while keeping your contract with ${currentClub()}.`});
    addInbox('loan',`Loan opportunity: ${c.name}`,`${c.name} are interested in taking you on loan. Proposed duration: 90 days. Your parent club remains ${currentClub()}.` ,c.name);
  }
  function acceptOffer(id){
    const offer=data.offers.find(x=>x.id==id);const s=getState();if(!offer||!s)return;
    const old=currentClub();s.club=offer.club;s.salary=offer.salary;s.marketValue=offer.fee;s.contractYears=4;s.transferFee=offer.fee;
    offer.status='accepted';data.reactions.unshift({day:s.day||1,type:'positive',text:`Transfer completed: ${playerName()} moved from ${old} to ${offer.club} for ${money(offer.fee)} on ${money(offer.salary)}/week.`});
    try{localStorage.setItem('oms_state',JSON.stringify(s))}catch(e){};save();
    if(typeof window.render==='function')window.render();render();toast(`Transfer complete — welcome to ${offer.club}!`);
  }
  function rejectOffer(id){const o=data.offers.find(x=>x.id==id);if(!o)return;o.status='rejected';data.reactions.unshift({day:getState()?.day||1,type:'neutral',text:`You rejected the ${o.club} offer and stayed at ${currentClub()}.`});save();render();toast('Offer rejected.');}
  function openTransfers(){const b=document.querySelector('#transfers');if(b){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));b.classList.add('active');render();b.scrollIntoView({behavior:'smooth',block:'start'});}}
  function render(){
    const box=document.querySelector('#omsTransferDesk');if(!box)return;
    const unread=data.inbox.filter(x=>x.unread).length;const s=getState();
    box.innerHTML=`<div class="oms-transfer-head"><div><div class="eyebrow">TRANSFER DESK</div><h1>Make your next move.</h1><div class="muted">Your agent tracks rumours, official offers, loans, salary and public reaction.</div></div><div class="oms-transfer-status">${unread?`✉ ${unread} NEW`:'✓ INBOX CLEAR'}</div></div>
    <div class="oms-transfer-grid"><section class="panel oms-transfer-overview"><div class="eyebrow">YOUR VALUE</div><div class="oms-transfer-kpis"><div><small>CURRENT CLUB</small><b>${currentClub()}</b></div><div><small>MARKET VALUE</small><b>${money(valuation())}</b></div><div><small>WEEKLY SALARY</small><b>${money(s?.salary||2500)}</b></div><div><small>REPUTATION</small><b>${Math.max(0,Number(data.reputation)||0)}/100</b></div></div><div class="oms-transfer-coach"><div><div class="eyebrow">COACH CONVERSATION</div><h3>Not sure what to do?</h3><p class="muted">Ask your coach about your role, a transfer request, or a loan.</p></div><button class="action" type="button" data-transfer-action="coach">ASK COACH</button></div></section>
    <section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">INBOX</div><h2>Transfer messages</h2></div><span class="oms-transfer-count">${data.inbox.length}</span></div><div class="oms-transfer-inbox">${data.inbox.slice(0,5).map(m=>`<article class="oms-transfer-message ${m.unread?'unread':''}" data-mail-id="${m.id}"><div><span class="oms-transfer-type ${m.type==='loan'?'loan':''}">${m.type}</span><small>Day ${m.day}</small></div><b>${m.title}</b><p>${m.body}</p></article>`).join('')||'<div class="oms-transfer-empty">No transfer messages yet. Rumours and offers can arrive as your career develops.</div>'}</div></section>
    <section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">OPTIONS</div><h2>Control your future</h2></div></div><button class="action" type="button" data-transfer-action="request">REQUEST TRANSFER</button><button class="action secondary" type="button" data-transfer-action="loan">REQUEST LOAN</button><div class="oms-transfer-counter"><label>Release/valuation estimate</label><div><input value="${money(valuation())}" readonly><button class="action secondary" type="button" data-transfer-action="refresh">REFRESH</button></div></div></section>
    <section class="panel oms-transfer-block"><div class="oms-transfer-section-title"><div><div class="eyebrow">OFFERS</div><h2>Official approaches</h2></div></div><div class="oms-transfer-offers">${data.offers.filter(o=>o.status==='pending').map(o=>`<article class="oms-transfer-offer"><div class="oms-transfer-offer-head"><div><span class="oms-transfer-type">TRANSFER</span><h3>${o.club}</h3><small>${o.league} · ${star(CLUBS.find(c=>c.name===o.club)?.stars||4)}</small></div><b class="oms-transfer-fee">${money(o.fee)}<small>transfer fee</small></b></div><div class="oms-transfer-terms"><div><small>SALARY</small><b>${money(o.salary)}/wk</b></div><div><small>CONTRACT</small><b>4 years</b></div><div><small>ROLE</small><b>${ovr()>=75?'Important':'Squad'}</b></div></div><div class="oms-transfer-actions"><button class="action" type="button" data-offer="${o.id}" data-offer-action="accept">ACCEPT</button><button class="action secondary" type="button" data-offer="${o.id}" data-offer-action="reject">REJECT</button></div></article>`).join('')||'<div class="oms-transfer-empty">No official offers right now. Strong performances increase your chances of attracting clubs.</div>'}</div></section>
    <section class="panel oms-transfer-block"><div class="oms-transfer-section-title"><div><div class="eyebrow">PUBLIC REACTION</div><h2>What people think</h2></div></div><div class="oms-transfer-reactions">${data.reactions.slice(0,6).map(r=>`<article class="${r.type==='positive'?'positive':r.type==='negative'?'negative':'neutral'}"><span>${r.type==='positive'?'SUPPORT':r.type==='negative'?'DOUBT':'REACTION'}</span><div><b>${r.text}</b><p>Fans, media and your coach are reacting to your career choices.</p></div><small>Day ${r.day}</small></article>`).join('')||'<div class="oms-transfer-empty">Public reaction will appear after major transfer news.</div>'}</div></section></div>`;
    box.querySelectorAll('[data-transfer-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.transferAction;if(a==='coach')askCoach();if(a==='request')requestTransfer();if(a==='loan')requestLoan();if(a==='refresh'){toast('Transfer valuation refreshed.')}});
    box.querySelectorAll('[data-offer-action]').forEach(b=>b.onclick=()=>b.dataset.offerAction==='accept'?acceptOffer(b.dataset.offer):rejectOffer(b.dataset.offer));
    box.querySelectorAll('[data-mail-id]').forEach(e=>e.onclick=()=>{const m=data.inbox.find(x=>x.id==e.dataset.mailId);if(m)showMail(m)});
  }
  function boot(){
    const view=document.querySelector('#transfers');if(!view)return;
    if(!document.querySelector('#omsTransferDesk')){const old=Array.from(view.children);const host=document.createElement('div');host.id='omsTransferDesk';view.innerHTML='';view.appendChild(host);}
    const nav=document.querySelector('#nav');if(nav){const b=[...nav.querySelectorAll('button')].find(x=>/transfer/i.test(x.textContent));if(b)b.dataset.transferBase=b.textContent.trim();}
    render();
  }
  window.omsTransferCentre={render,openTransfers,askCoach,requestTransfer,requestLoan,maybeNews};
  window.addEventListener('load',boot);
  setTimeout(boot,700);
  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{boot();render();maybeNews();},0);return r};
  document.addEventListener('click',e=>{const b=e.target.closest('#nav button');if(b&&/transfer/i.test(b.textContent))setTimeout(()=>{openTransfers();},20)});
})();
