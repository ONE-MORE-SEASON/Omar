/* ONE MORE SEASON — Player Career Transfer Center v2
   Transfer-only systems. Designed to sit on top of the existing career state.
   Includes: coach requests, rumours, direct mail popups, offers, salary, fees,
   loans, reactions, negotiations and club switching. */
(() => {
  'use strict';
  if (window.__OMS_TRANSFER_CENTER_V2__) return;
  window.__OMS_TRANSFER_CENTER_V2__ = true;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (v,min,max) => Math.max(min, Math.min(max, Number(v) || 0));
  const round = (v,step=1000) => Math.round((Number(v)||0)/step)*step;
  const state = () => typeof window.OMS_GET_STATE === 'function' ? window.OMS_GET_STATE() : window.state;
  const save = () => { try { if (typeof window.save === 'function') window.save(); else localStorage.setItem('omsCareerStable3', JSON.stringify(state())); } catch(e){} };
  const redraw = () => { try { if (typeof window.render === 'function') window.render(); } catch(e){} };
  const toast = m => { try { if (typeof window.toast === 'function') window.toast(m); } catch(e){} };

  const CLUBS = [
    {club:'BK Häcken',league:'Allsvenskan',rating:66,big:false},
    {club:'Real Sociedad',league:'La Liga',rating:79,big:false},
    {club:'Villarreal',league:'La Liga',rating:79,big:false},
    {club:'Brighton',league:'Premier League',rating:80,big:false},
    {club:'Feyenoord',league:'Eredivisie',rating:78,big:false},
    {club:'Lille',league:'Ligue 1',rating:78,big:false},
    {club:'Bologna',league:'Serie A',rating:77,big:false},
    {club:'Sporting CP',league:'Primeira Liga',rating:81,big:false},
    {club:'Benfica',league:'Primeira Liga',rating:81,big:false},
    {club:'Marseille',league:'Ligue 1',rating:79,big:false},
    {club:'Aston Villa',league:'Premier League',rating:82,big:false},
    {club:'RB Leipzig',league:'Bundesliga',rating:83,big:true},
    {club:'Borussia Dortmund',league:'Bundesliga',rating:84,big:true},
    {club:'Arsenal',league:'Premier League',rating:88,big:true},
    {club:'Liverpool',league:'Premier League',rating:89,big:true},
    {club:'Manchester City',league:'Premier League',rating:90,big:true},
    {club:'Real Madrid',league:'La Liga',rating:91,big:true},
    {club:'Barcelona',league:'La Liga',rating:89,big:true},
    {club:'Bayern Munich',league:'Bundesliga',rating:90,big:true},
    {club:'Paris Saint-Germain',league:'Ligue 1',rating:89,big:true}
  ];

  let popupQueue = [];
  let popupOpen = false;
  let hooksInstalled = false;

  function ensure(s) {
    if (!s) return null;
    s.transferInbox = Array.isArray(s.transferInbox) ? s.transferInbox : [];
    s.transferOffers = Array.isArray(s.transferOffers) ? s.transferOffers : [];
    s.transferInterest = Array.isArray(s.transferInterest) ? s.transferInterest : [];
    s.transferRumours = Array.isArray(s.transferRumours) ? s.transferRumours : [];
    s.mediaReactions = Array.isArray(s.mediaReactions) ? s.mediaReactions : [];
    s.transferHistory = Array.isArray(s.transferHistory) ? s.transferHistory : [];
    s.transferMarket = s.transferMarket && typeof s.transferMarket === 'object' ? s.transferMarket : {};
    if (!Number(s.wage)) s.wage = Math.max(650, round(700 * ((Number(s.ovr)||67)/67),50));
    if (!Number(s.value)) s.value = Math.max(50000, round(850000 * Math.pow(1.16,(Number(s.ovr)||67)-67),5000));
    if (!Number(s.contractYears)) s.contractYears = 3;
    if (!Number(s.contractYearsLeft)) s.contractYearsLeft = s.contractYears;
    if (!Number(s.reputation)) s.reputation = 35;
    if (!s.transferMarket.nextCheckAbs) s.transferMarket.nextCheckAbs = absoluteDay(s) + 10 + Math.floor(Math.random()*7);
    if (!s.transferMarket.lastCoachRequestAbs) s.transferMarket.lastCoachRequestAbs = -9999;
    if (!s.transferMarket.status) s.transferMarket.status = 'Under contract';
    return s;
  }

  function absoluteDay(s) { return (Math.max(1,Number(s.season)||1)-1)*300 + Math.max(1,Number(s.day)||1); }
  function money(v) { const n=Math.max(0,Number(v)||0); if(n>=1000000)return '€'+(n/1000000).toFixed(n>=10000000?0:1).replace(/\.0$/,'')+'m'; if(n>=1000)return '€'+Math.round(n/1000)+'k'; return '€'+Math.round(n); }
  function wage(v) { return '€'+Math.round(Number(v)||0).toLocaleString('en-GB')+'/week'; }
  function level(v) { return v>=75?'Strong':v>=50?'Growing':'Early'; }
  function roleFor(s,c) { const diff=(Number(s.ovr)||67)-c.rating; return diff>=4?'Starter':diff>=-2?'Rotation':'Squad player'; }
  function fit(s,c) { const o=Number(s.ovr)||67; return o>=c.rating-8 && o<=c.rating+8 && (!c.big || o>=c.rating-6); }
  function nextId(prefix) { return prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,7); }

  function mail(s,type,subject,body,offerId=null) {
    const m={id:nextId('mail'),type,subject,body,offerId,day:Number(s.day)||1,season:Number(s.season)||1,read:false};
    s.transferInbox.unshift(m); s.transferInbox=s.transferInbox.slice(0,50);
    s.careerEvents=Array.isArray(s.careerEvents)?s.careerEvents:[];
    s.careerEvents.unshift({title:subject,detail:body,day:m.day,season:m.season});
    s.careerEvents=s.careerEvents.slice(0,50);
    popupQueue.push(m.id); showNextMail(); save(); return m;
  }

  function showNextMail() {
    if(popupOpen || !popupQueue.length) return;
    const s=ensure(state()); if(!s)return;
    const id=popupQueue.shift(); const m=s.transferInbox.find(x=>x.id===id); if(!m)return showNextMail();
    popupOpen=true;
    const overlay=document.createElement('div'); overlay.className='oms-transfer-overlay'; overlay.id='omsTransferPopup';
    overlay.innerHTML=`<section class="oms-transfer-mail">
      <div class="oms-transfer-mailtop"><span>✉ &nbsp; CAREER MAIL</span><button type="button" onclick="OMS_TRANSFER_CLOSE_MAIL()" aria-label="Close">×</button></div>
      <div class="eyebrow">${esc(m.type.toUpperCase())} · SEASON ${m.season} · DAY ${m.day}</div>
      <h2 id="omsTransferPopupTitle">${esc(m.subject)}</h2><p>${esc(m.body)}</p>
      <div class="oms-transfer-mailactions"><button class="action" onclick="OMS_TRANSFER_VIEW_MAIL('${esc(m.id)}')">OPEN TRANSFER CENTER →</button><button class="action secondary" onclick="OMS_TRANSFER_CLOSE_MAIL()">CLOSE</button></div>
    </section>`;
    document.body.appendChild(overlay); m.read=true; save();
  }

  window.OMS_TRANSFER_CLOSE_MAIL=()=>{ document.getElementById('omsTransferPopup')?.remove(); popupOpen=false; redraw(); setTimeout(showNextMail,80); };
  window.OMS_TRANSFER_VIEW_MAIL=id=>{ const s=ensure(state()); const m=s?.transferInbox.find(x=>x.id===id); if(m)m.read=true; window.OMS_TRANSFER_CLOSE_MAIL(); if(typeof window.show==='function')window.show('transfers'); redraw(); };

  function reaction(s,club,kind,text) {
    const voices={fans:'FANS',media:'MEDIA',teammates:'TEAMMATES'};
    s.mediaReactions.unshift({club,kind,source:voices[kind]||'MEDIA',text,day:s.day,season:s.season});
    s.mediaReactions=s.mediaReactions.slice(0,30);
  }

  function offer(s,c,kind) {
    const val=Number(s.value)||150000; const baseW=Number(s.wage)||1200;
    const fee=kind==='loan'?round(val*(.025+Math.random()*.05),1000):round(val*(.72+Math.random()*.3)*(Number(s.contractYearsLeft||2)<=1?.82:1),5000);
    const newW=Math.max(baseW,round(baseW*(1.12+Math.random()*(c.big?.7:.4)),50));
    const o={id:nextId('offer'),club:c.club,league:c.league,kind,fee,wage:newW,years:kind==='loan'?1:3+Math.floor(Math.random()*2),role:roleFor(s,c),status:'pending',day:s.day,season:s.season};
    s.transferOffers.unshift(o); s.transferOffers=s.transferOffers.slice(0,10);
    const body=kind==='loan'
      ? `${c.club} vill låna dig i en säsong. Låneavgift: ${money(fee)}. Föreslagen lön: ${wage(newW)}. Rollen är ${o.role.toLowerCase()}.`
      : `${c.club} har lagt ett bud på ${money(fee)}. De erbjuder ${wage(newW)} och ett ${o.years}-årskontrakt. Rollen är ${o.role.toLowerCase()}.`;
    mail(s,kind==='loan'?'Loan offer':'Transfer offer',kind==='loan'?'Låneerbjudande från '+c.club:'Formellt bud från '+c.club,body,o.id);
    reaction(s,c.club,'fans',`Fans debate whether the move would be a good step for your career.`);
    reaction(s,c.club,'media',`${c.club} are now being discussed as a possible destination for you.`);
    return o;
  }

  function interest(s,c) {
    if(s.transferInterest.some(x=>x.club===c.club && x.status!=='declined'))return false;
    const o=Number(s.ovr)||67, rep=Number(s.reputation)||35;
    const score=clamp(86-Math.abs(o-c.rating)*7+(rep-35)*.3,18,96);
    s.transferInterest.unshift({id:nextId('interest'),club:c.club,league:c.league,level:score,status:'monitoring',day:s.day,season:s.season});
    s.transferInterest=s.transferInterest.slice(0,12);
    mail(s,'Club interest',c.club+' are monitoring you',`${c.club} har kontaktat din agent för att följa din situation. Intresset är ${level(score).toLowerCase()}. Ett formellt bud är inte garanterat.`);
    reaction(s,c.club,'media',`Reports say ${c.club} are monitoring you.`);
    return true;
  }

  function rumour(s,c) {
    if(s.transferRumours.some(x=>x.club===c.club&&x.season===s.season&&Math.abs((x.day||1)-(s.day||1))<30))return false;
    s.transferRumours.unshift({id:nextId('rumour'),club:c.club,league:c.league,day:s.day,season:s.season,source:'Football Daily',confidence:Math.floor(45+Math.random()*45)});
    s.transferRumours=s.transferRumours.slice(0,12);
    mail(s,'Transfer rumour','Reports link you with '+c.club,`Football Daily: ${c.club} uppges följa dig. Det finns ännu inget formellt bud — ryktet kan vara helt eller delvis felaktigt.`);
    reaction(s,c.club,'fans',`Supporters are split: some want the move, others want you to stay.`);
    return true;
  }

  function marketTick(s,abs) {
    if(!s||s.onLoan||s.transferMarket.status==='Completed')return;
    if(abs<(Number(s.transferMarket.nextCheckAbs)||abs+10))return;
    s.transferMarket.nextCheckAbs=abs+10+Math.floor(Math.random()*11);
    const candidates=CLUBS.filter(c=>c.club!==s.club&&fit(s,c));
    if(!candidates.length)return;
    const c=candidates[Math.floor(Math.random()*candidates.length)];
    const rep=Number(s.reputation)||35, morale=Number(s.morale)||60;
    const chance=clamp(.16+rep/500+Math.max(0,morale-65)/700, .13, .55);
    if(Math.random()>chance)return;
    if(interest(s,c))return;
    if(Math.random()<.32){ offer(s,c,Math.random()<.25?'loan':'transfer'); return; }
    rumour(s,c);
  }

  function advanceDays(start,end) {
    const s=ensure(state()); if(!s)return;
    for(let abs=start+1;abs<=end;abs++) marketTick(s,abs);
    save(); redraw();
  }

  function findOffer(s,id){return s.transferOffers.find(o=>o.id===id);}
  function closeOffer(s,o,status){o.status=status;s.transferHistory.unshift({type:o.kind,club:o.club,fee:o.fee,wage:o.wage,status,day:s.day,season:s.season});s.transferHistory=s.transferHistory.slice(0,30);}

  window.OMS_TRANSFER_ACCEPT= id => {
    const s=ensure(state()),o=findOffer(s,id); if(!s||!o||o.status!=='pending')return;
    const old=s.club;
    o.status='accepted';
    s.club=o.club; s.league=o.league; s.wage=o.wage; s.contractYears=o.years; s.contractYearsLeft=o.years;
    s.transferMarket.status='Completed';
    if(o.kind==='loan'){s.onLoan=true;s.loanClub=o.club;s.loanParentClub=old;s.loanEndAbs=absoluteDay(s)+300;s.transferMarket.status='Loan';}
    else {s.onLoan=false;s.transferMarket.status='At '+o.club;}
    reaction(s,o.club,'fans',`Supporters react to your move from ${old} to ${o.club}.`);
    reaction(s,o.club,'teammates',`Your teammates wish you well as you begin a new chapter.`);
    mail(s,o.kind==='loan'?'Loan confirmed':'Transfer confirmed',o.kind==='loan'?'Loan confirmed: '+o.club:'Transfer completed: '+o.club,`The move is complete. Your new weekly wage is ${wage(o.wage)} and the club sees you as a ${o.role.toLowerCase()}.`);
    toast('Transfer completed: '+o.club);save();redraw();
  };

  window.OMS_TRANSFER_REJECT=id=>{const s=ensure(state()),o=findOffer(s,id);if(!s||!o||o.status!=='pending')return;o.status='rejected';reaction(s,o.club,'fans',`Fans wonder whether rejecting ${o.club} was the right decision.`);toast('Offer rejected');save();redraw();};
  window.OMS_TRANSFER_NEGOTIATE=id=>{const s=ensure(state()),o=findOffer(s,id);if(!s||!o||o.status!=='pending')return;o.negotiated=true;o.fee=round(o.fee*1.08,5000);o.wage=round(o.wage*1.06,50);mail(s,'Negotiation update','Your agent improved the offer',`${o.club} have been asked to improve the proposal. New proposed fee: ${money(o.fee)}. New wage: ${wage(o.wage)}.` ,o.id);save();redraw();};

  window.OMS_TRANSFER_ASK_COACH=()=>{
    const s=ensure(state());if(!s)return;const abs=absoluteDay(s);
    if(abs-(Number(s.transferMarket.lastCoachRequestAbs)||-9999)<14){toast('The coach wants you to focus on football before another transfer meeting.');return;}
    s.transferMarket.lastCoachRequestAbs=abs;
    const candidates=CLUBS.filter(c=>c.club!==s.club&&fit(s,c)).sort((a,b)=>Math.abs(a.rating-(Number(s.ovr)||67))-Math.abs(b.rating-(Number(s.ovr)||67)));
    const c=candidates[0];
    if(!c){mail(s,'Coach meeting','Coach: stay focused',`The coach says your next step should be earning more minutes at ${s.club}.`);return;}
    s.transferMarket.coachSuggestion=c.club;
    mail(s,'Coach meeting','Coach transfer advice',`The coach says: keep performing and clubs such as ${c.club} could become realistic options. If you want a move, ask your agent to explore it.`);
    toast('Coach advice received');save();redraw();
  };

  window.OMS_TRANSFER_REQUEST_MOVE=kind=>{
    const s=ensure(state());if(!s)return;const abs=absoluteDay(s);
    if(abs-(Number(s.transferMarket.lastRequestAbs)||-9999)<21){toast('Your agent needs more time before making another request.');return;}
    s.transferMarket.lastRequestAbs=abs;
    const candidates=CLUBS.filter(c=>c.club!==s.club&&fit(s,c)).sort(()=>Math.random()-.5).slice(0,4);
    if(!candidates.length){toast('No realistic clubs are available right now.');return;}
    s.transferMarket.preferredClub=candidates[0].club;
    s.transferMarket.requestKind=kind;
    mail(s,kind==='loan'?'Loan request':'Transfer request','Your agent is exploring a '+(kind==='loan'?'loan':'transfer'),`Your agent has contacted clubs that fit your current level. ${candidates[0].club} is the first club being approached. Interest may lead to a rumour, an offer or no response.`);
    save();redraw();
  };

  function transferHTML(s){
    const unread=s.transferInbox.filter(m=>!m.read).length;
    const offers=s.transferOffers.filter(o=>o.status==='pending');
    const interest=s.transferInterest.filter(x=>x.status!=='declined');
    const rumours=s.transferRumours.slice(0,6);
    const reactions=s.mediaReactions.slice(0,8);
    const offerCards=offers.length?offers.map(o=>`<article class="oms-transfer-offer"><div class="oms-transfer-offer-head"><div><span class="oms-transfer-type ${o.kind==='loan'?'loan':''}">${o.kind==='loan'?'LOAN':'TRANSFER'}</span><h3>${esc(o.club)}</h3><small>${esc(o.league)} · ${esc(o.role)}</small></div><strong class="oms-transfer-fee">${money(o.fee)}<small>${o.kind==='loan'?'loan fee':'transfer fee'}</small></strong></div><div class="oms-transfer-terms"><div><small>WAGE</small><b>${wage(o.wage)}</b></div><div><small>CONTRACT</small><b>${o.years} year${o.years>1?'s':''}</b></div><div><small>STATUS</small><b>${o.negotiated?'Negotiated':'Initial bid'}</b></div></div><div class="oms-transfer-actions"><button class="action" onclick="OMS_TRANSFER_ACCEPT('${esc(o.id)}')">ACCEPT</button><button class="action secondary" onclick="OMS_TRANSFER_NEGOTIATE('${esc(o.id)}')">NEGOTIATE</button><button class="action secondary" onclick="OMS_TRANSFER_REJECT('${esc(o.id)}')">REJECT</button></div></article>`).join(''):'<div class="oms-transfer-empty">No formal offers yet. Keep performing — clubs can appear at any time.</div>';
    const interestHTML=interest.length?interest.map(x=>`<article><div><b>${esc(x.club)}</b><small>${esc(x.league)} · monitoring you</small></div><span class="oms-interest-level ${x.level>=75?'strong':x.level>=50?'medium':'early'}">${level(x.level)} ${Math.round(x.level)}%</span></article>`).join(''):'<div class="oms-transfer-empty">No clubs are currently monitoring you.</div>';
    const rumourHTML=rumours.length?rumours.map(x=>`<article><div><b>${esc(x.club)}</b><small>${esc(x.league)} · ${esc(x.source||'Football Daily')}</small></div><span class="oms-transfer-rumour">${x.confidence||50}% confidence</span></article>`).join(''):'<div class="oms-transfer-empty">No transfer rumours at the moment.</div>';
    const inbox=s.transferInbox.slice(0,7).map(m=>`<article class="oms-transfer-message ${m.read?'':'unread'}"><div><span class="oms-transfer-type ${m.type==='Loan offer'?'loan':''}">${esc(m.type)}</span><small>Season ${m.season} · Day ${m.day}</small></div><b>${esc(m.subject)}</b><p>${esc(m.body)}</p></article>`).join('')||'<div class="oms-transfer-empty">Your career mailbox is empty.</div>';
    const reactionsHTML=reactions.map(r=>`<article class="${r.kind==='fans'?'positive':r.kind==='teammates'?'neutral':'neutral'}"><span>${esc(r.source)}</span><div><b>${esc(r.club)}</b><p>${esc(r.text)}</p></div><small>D${r.day}</small></article>`).join('')||'<div class="oms-transfer-empty">People will react when transfer news appears.</div>';
    return `<div class="oms-transfer-head"><div><div class="eyebrow">PLAYER CAREER · TRANSFERS</div><h1>Transfer Center</h1><div class="muted">Your agent, coach, clubs and the football world — all in one place.</div></div><div class="oms-transfer-status">${unread?unread+' NEW MAIL':'MAILBOX CLEAR'}</div></div>
      <div class="oms-transfer-grid">
        <section class="panel oms-transfer-overview"><div class="oms-transfer-section-title"><div><div class="eyebrow">YOUR CONTRACT</div><h2>${esc(s.club||'Current club')}</h2></div><span class="oms-transfer-count">${esc(s.transferMarket.status||'Under contract')}</span></div>
          <div class="oms-transfer-kpis"><div><small>MARKET VALUE</small><b>${money(s.value)}</b></div><div><small>WEEKLY WAGE</small><b>${wage(s.wage)}</b></div><div><small>CONTRACT</small><b>${Number(s.contractYearsLeft||s.contractYears||3)} year${Number(s.contractYearsLeft||s.contractYears||3)!==1?'s':''}</b></div><div><small>REPUTATION</small><b>${Math.round(Number(s.reputation)||35)}/100</b></div></div>
          <div class="oms-transfer-coach"><div><div class="eyebrow">COACH ROOM</div><h3>${s.transferMarket.coachSuggestion?esc(s.transferMarket.coachSuggestion)+' could be realistic':'Want to know what your coach thinks?'}</h3><p class="muted">Ask the coach about your role and whether a move makes sense.</p></div><button class="action" onclick="OMS_TRANSFER_ASK_COACH()">ASK COACH</button></div>
        </section>
        <section class="panel"><div class="eyebrow">YOUR AGENT</div><h2>Find a new club</h2><p class="muted">You choose the route. The agent handles the approach.</p><div class="oms-transfer-actions" style="margin-top:15px"><button class="action" onclick="OMS_TRANSFER_REQUEST_MOVE('transfer')">REQUEST TRANSFER</button><button class="action secondary" onclick="OMS_TRANSFER_REQUEST_MOVE('loan')">REQUEST LOAN</button></div></section>
        <section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">FORMAL OFFERS</div><h2>Offers on your desk</h2></div><span class="oms-transfer-count">${offers.length}</span></div><div class="oms-transfer-offers">${offerCards}</div></section>
        <section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">CLUB INTEREST</div><h2>Who is watching?</h2></div><span class="oms-transfer-count">${interest.length}</span></div><div class="oms-transfer-list">${interestHTML}</div></section>
        <section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">RUMOUR MILL</div><h2>What is being reported?</h2></div></div><div class="oms-transfer-list">${rumourHTML}</div></section>
        <section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">FOOTBALL REACTION</div><h2>What people think</h2></div></div><div class="oms-transfer-reactions">${reactionsHTML}</div></section>
        <section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">MAILBOX</div><h2>Career mail</h2></div></div><div class="oms-transfer-inbox">${inbox}</div></section>
      </div>`;
  }

  function renderTransferView(){
    const s=ensure(state()); if(!s)return;
    const root=document.getElementById('transfers'); if(!root)return;
    root.innerHTML=transferHTML(s);
    const nav=document.getElementById('nav');
    if(nav){ const b=[...nav.querySelectorAll('button')].find(x=>/transfer/i.test(x.textContent)); if(b){const n=s.transferInbox.filter(m=>!m.read).length;b.classList.toggle('oms-transfer-unread',n>0);if(n)b.dataset.unread=n;else b.removeAttribute('data-unread');}} 
  }

  function installHooks(){
    if(hooksInstalled)return; hooksInstalled=true;
    const wrap=name=>{
      const fn=window[name]; if(typeof fn!=='function')return;
      window[name]=function(...args){
        const s=ensure(state()); const before=s?absoluteDay(s):null;
        const result=fn.apply(this,args);
        try{const after=state()?absoluteDay(state()):before;if(s&&after!==null&&before!==null&&after>before)advanceDays(before,after);else{ensure(state());save();renderTransferView();}}catch(e){}
        return result;
      };
    };
    wrap('advance');
    wrap('simulateMatch');
  }

  function init(){
    ensure(state());
    renderTransferView();
    installHooks();
    setTimeout(()=>{ensure(state());renderTransferView();showNextMail();},350);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.OMS_TRANSFER_REFRESH=()=>{ensure(state());renderTransferView();};
})();
