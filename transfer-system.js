/* ONE MORE SEASON — Player Career Transfer Center */
(() => {
  'use strict';
  if (window.__OMS_TRANSFER_CENTER__) return;
  window.__OMS_TRANSFER_CENTER__ = true;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const round = (value, step=1) => Math.round(value / step) * step;
  const get = () => typeof window.OMS_GET_STATE === 'function' ? window.OMS_GET_STATE() : window.state;
  const save = () => { try { if (typeof window.save === 'function') window.save(); else localStorage.setItem('omsCareerStable3', JSON.stringify(get())); } catch (_) {} };
  const toast = message => { if (typeof window.toast === 'function') window.toast(message); };
  const targets = [
    { club:'BK Häcken', league:'Allsvenskan', tier:66, min:54 }, { club:'Real Sociedad', league:'La Liga', tier:79, min:65 },
    { club:'Villarreal', league:'La Liga', tier:79, min:66 }, { club:'Brighton', league:'Premier League', tier:80, min:68 },
    { club:'Feyenoord', league:'Eredivisie', tier:78, min:65 }, { club:'Lille', league:'Ligue 1', tier:78, min:65 },
    { club:'Bologna', league:'Serie A', tier:77, min:64 }, { club:'Sporting CP', league:'Primeira Liga', tier:81, min:68 },
    { club:'Borussia Dortmund', league:'Bundesliga', tier:84, min:76, big:true }, { club:'RB Leipzig', league:'Bundesliga', tier:83, min:75, big:true },
    { club:'Benfica', league:'Primeira Liga', tier:81, min:69 }, { club:'Marseille', league:'Ligue 1', tier:79, min:67 },
    { club:'Aston Villa', league:'Premier League', tier:82, min:72 }, { club:'Arsenal', league:'Premier League', tier:88, min:83, big:true },
    { club:'Liverpool', league:'Premier League', tier:89, min:84, big:true }, { club:'Manchester City', league:'Premier League', tier:90, min:86, big:true },
    { club:'Real Madrid', league:'La Liga', tier:91, min:87, big:true }, { club:'Barcelona', league:'La Liga', tier:89, min:84, big:true },
    { club:'Bayern Munich', league:'Bundesliga', tier:90, min:85, big:true }, { club:'Paris Saint-Germain', league:'Ligue 1', tier:89, min:84, big:true }
  ];
  let popupQueue = [];
  let popupOpen = false;

  function ensure(s) {
    if (!s) return null;
    s.transferInbox = Array.isArray(s.transferInbox) ? s.transferInbox : [];
    s.transferOffers = Array.isArray(s.transferOffers) ? s.transferOffers : [];
    s.transferInterest = Array.isArray(s.transferInterest) ? s.transferInterest : [];
    s.transferRumours = Array.isArray(s.transferRumours) ? s.transferRumours : [];
    s.mediaReactions = Array.isArray(s.mediaReactions) ? s.mediaReactions : [];
    s.transferMarket = s.transferMarket && typeof s.transferMarket === 'object' ? s.transferMarket : {};
    s.playerTargetShortlist = Array.isArray(s.playerTargetShortlist) ? s.playerTargetShortlist : [];
    const oldTargets = s.transferInterest.filter(item => item && item.name && item.ovr !== undefined && item.level === undefined);
    if (oldTargets.length) {
      const known = new Set(s.playerTargetShortlist.map(item => item.name));
      s.playerTargetShortlist.push(...oldTargets.filter(item => !known.has(item.name)));
      s.transferInterest = s.transferInterest.filter(item => !oldTargets.includes(item));
    }
    s.transferOffers.forEach((offer, index) => {
      if (!offer.id) { offer.id = 'legacy-offer-' + index + '-' + (offer.day || 1); offer.legacyMigration = true; }
      if (!offer.kind) offer.kind = 'transfer';
      if (!offer.fee) offer.fee = round((Number(s.value) || 150000) * 0.78, 5000);
      if (!offer.wage) offer.wage = Number(s.wage) || 1200;
      if (!offer.years) offer.years = 3;
      if (!offer.role) offer.role = 'Rotation';
      if (!offer.status) offer.status = 'pending';
    });
    if (!s.transferMarket.initialized) {
      if (Number(s.wage) === 500) s.wage = Math.max(650, round(500 * (Number(s.ovr || 67) / 67), 50));
      s.transferMarket.initialized = true;
      s.transferMarket.nextCheckDay = 14 + Math.floor(Math.random() * 8);
      s.transferMarket.lastRequestDay = -1000;
      s.transferMarket.status = 'Under contract';
    }
    const estimatedValue = Math.round(850000 * Math.pow(1.16, (Number(s.ovr) || 67) - 67) * (1 + Math.max(0, Number(s.reputation) || 0) / 220) * ((Number(s.age) || 20) < 20 ? 1.12 : 1));
    s.value = Math.max(50000, Number(s.value) || 0, estimatedValue);
    s.wage = Math.max(250, Number(s.wage) || 1200);
    s.transferOffers.forEach(offer => {
      if (offer.legacyMigration) {
        offer.fee = round(s.value * 0.78, 5000);
        offer.wage = round(s.wage * 1.1, 50);
        delete offer.legacyMigration;
      }
    });
    s.contractYears = clamp(s.contractYears || 2, 1, 5);
    return s;
  }
  function absoluteDay(s) { return (Math.max(1, Number(s.season) || 1) - 1) * 300 + Math.max(1, Number(s.day) || 1); }
  function fmtMoney(amount) {
    const n = Math.max(0, Number(amount) || 0);
    if (n >= 1000000) return '€' + (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, '') + 'm';
    if (n >= 1000) return '€' + Math.round(n / 1000) + 'k';
    return '€' + Math.round(n);
  }
  function fmtWage(amount) { return '€' + Math.round(Number(amount) || 0).toLocaleString('en-GB') + '/week'; }
  function email(s, type, subject, body, offerId) {
    const message = { id:'mail-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), type, subject, body, offerId:offerId || null, day:s.day || 1, season:s.season || 1, read:false };
    s.transferInbox.unshift(message);
    s.transferInbox = s.transferInbox.slice(0, 40);
    s.careerEvents = Array.isArray(s.careerEvents) ? s.careerEvents : [];
    s.careerEvents.unshift({ title:subject, detail:body, day:message.day, season:message.season });
    s.careerEvents = s.careerEvents.slice(0, 40);
    popupQueue.push(message.id);
    showNextPopup();
    save();
    return message;
  }
  function showNextPopup() {
    if (popupOpen || !popupQueue.length) return;
    const s = ensure(get());
    if (!s) return;
    const id = popupQueue.shift();
    const message = s.transferInbox.find(item => item.id === id);
    if (!message) return showNextPopup();
    popupOpen = true;
    const overlay = document.createElement('div');
    overlay.className = 'oms-transfer-overlay';
    overlay.id = 'omsTransferPopup';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'omsTransferPopupTitle');
    overlay.innerHTML = '<section class="oms-transfer-mail"><div class="oms-transfer-mailtop"><span>✉ &nbsp; CLUB MAIL</span><button type="button" aria-label="Close" onclick="OMS_TRANSFER_CLOSE_MAIL()">×</button></div><div class="eyebrow">' + esc(message.type.toUpperCase()) + ' · SEASON ' + message.season + ' · DAY ' + message.day + '</div><h2 id="omsTransferPopupTitle">' + esc(message.subject) + '</h2><p>' + esc(message.body) + '</p><div class="oms-transfer-mailactions"><button class="action" onclick="OMS_TRANSFER_VIEW_MAIL(\'' + esc(message.id) + '\')">OPEN TRANSFER CENTER →</button><button class="action secondary" onclick="OMS_TRANSFER_CLOSE_MAIL()">CLOSE</button></div></section>';
    document.body.appendChild(overlay);
    message.read = true;
    save();
  }
  window.OMS_TRANSFER_CLOSE_MAIL = function() {
    document.getElementById('omsTransferPopup')?.remove();
    popupOpen = false;
    render();
    setTimeout(showNextPopup, 80);
  };
  window.OMS_TRANSFER_VIEW_MAIL = function(id) {
    const s = ensure(get());
    const message = s?.transferInbox.find(item => item.id === id);
    if (message) message.read = true;
    window.OMS_TRANSFER_CLOSE_MAIL();
    if (typeof window.show === 'function') window.show('transfers');
    render();
  };
  function isWindow(day) { const d = ((day - 1) % 300) + 1; return d <= 55 || (d >= 145 && d <= 205); }
  function fitTargets(s) {
    const rating = Number(s.ovr) || 67;
    return targets.filter(t => t.club !== s.club && (!t.big || rating >= t.min) && rating >= t.min - 7 && rating <= t.tier + 8);
  }
  function createInterest(s, club) {
    if (s.transferInterest.some(item => item.club === club.club && item.status !== 'declined')) return false;
    const level = Number(s.ovr) || 67;
    const fit = clamp(88 - Math.abs(level - club.tier) * 8 + (Number(s.reputation || 0) - 40) * 0.25, 18, 96);
    const item = { id:'interest-' + Date.now(), club:club.club, league:club.league, level:fit, day:s.day, season:s.season };
    s.transferInterest.unshift(item);
    s.transferInterest = s.transferInterest.slice(0, 12);
    email(s, 'Club interest', club.club + ' are monitoring you', club.club + ' have asked your agent for information. Their interest is ' + (fit >= 75 ? 'strong' : fit >= 50 ? 'growing' : 'early-stage') + ' and your recent performances will influence whether they make a formal offer.');
    return true;
  }
  function createRumour(s, club) {
    if (s.transferRumours.some(item => item.club === club.club && item.season === s.season && Math.abs((item.day || 1) - (s.day || 1)) < 35)) return false;
    const rumour = { club:club.club, league:club.league, day:s.day, season:s.season, source:'Football Daily' };
    s.transferRumours.unshift(rumour);
    s.transferRumours = s.transferRumours.slice(0, 10);
    email(s, 'Transfer rumour', 'Reports link you with ' + club.club, 'Football Daily reports that ' + club.club + ' have added you to their shortlist. No formal bid has been made, and the report may not lead to an offer.');
    return true;
  }
  function createOffer(s, club, kind) {
    const value = Number(s.value) || 150000;
    const yearsLeft = Number(s.contractYears) || 2;
    const fee = kind === 'loan' ? round(value * (0.025 + Math.random() * 0.045), 1000) : round(value * (0.68 + Math.random() * 0.28) * (yearsLeft <= 1 ? 0.78 : 1), 5000);
    const wageFactor = 1.08 + Math.random() * (club.big ? 0.68 : 0.38);
    const wage = Math.max(Number(s.wage) || 1200, round((Number(s.wage) || 1200) * wageFactor, 50));
    const offer = {
      id:'offer-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), club:club.club, league:club.league,
      kind, fee, wage, years:kind === 'loan' ? 1 : 3 + Math.floor(Math.random() * 3), role:(Number(s.ovr) || 67) >= club.tier - 2 ? 'Rotation' : 'Squad player',
      status:'pending', day:s.day || 1, season:s.season || 1, negotiated:false
    };
    s.transferOffers.unshift(offer);
    s.transferOffers = s.transferOffers.slice(0, 10);
    const details = kind === 'loan'
      ? club.club + ' want to take you on a one-season loan from ' + s.club + '. The loan fee is ' + fmtMoney(fee) + ', the proposed wage is ' + fmtWage(wage) + ', and they see you as a ' + offer.role.toLowerCase() + '.'
      : club.club + ' have made a bid of ' + fmtMoney(fee) + ' to ' + s.club + ', plus a ' + offer.years + '-year contract at ' + fmtWage(wage) + '. Your proposed role is ' + offer.role + '.';
    email(s, kind === 'loan' ? 'Loan offer' : 'Transfer offer', kind === 'loan' ? 'Loan offer from ' + club.club : 'Formal offer from ' + club.club, details, offer.id);
    return offer;
  }
  function evaluateMarketDay(s, day, absolute) {
    if (!isWindow(day) || s.onLoan || s.transferMarket.status === 'Completed') return;
    if (absolute < (Number(s.transferMarket.nextCheckDay) || 14)) return;
    s.transferMarket.nextCheckDay = absolute + 14 + Math.floor(Math.random() * 9);
    const reputation = Number(s.reputation) || 0;
    const form = Number(s.morale) || 50;
    const candidates = fitTargets(s);
    if (!candidates.length || (reputation < 28 && (Number(s.ovr) || 67) < 70)) return;
    const preferred = candidates.find(item => item.club === s.transferMarket.preferredClub);
    const club = preferred && Math.random() < 0.75 ? preferred : candidates[Math.floor(Math.random() * candidates.length)];
    const coachBacked = s.transferMarket.coachBackedUntil && absoluteDay(s) <= s.transferMarket.coachBackedUntil;
    const chance = clamp(0.13 + reputation / 500 + Math.max(0, form - 65) / 550 + (coachBacked ? 0.22 : 0), 0.12, 0.58);
    if (Math.random() > chance) return;
    if (createInterest(s, club)) return;
    if (Math.random() < (0.14 + reputation / 500)) {
      const kind = Math.random() < 0.22 ? 'loan' : 'transfer';
      createOffer(s, club, kind);
      return;
    }
    if (Math.random() < 0.28) createRumour(s, club);
  }
  function processDays(start, end, s) {
    for (let absolute = start + 1; absolute <= end; absolute++) {
      const day = ((absolute - 1) % 300) + 1;
      if (day === 1) s.season = Math.floor((absolute - 1) / 300) + 1;
      s.day = day;
      if (s.onLoan && absolute >= Number(s.loanEndsAbsolute || Infinity)) {
        const oldClub = s.club;
        s.club = s.parentClub || s.club;
        s.onLoan = false;
        s.loanEndsAbsolute = null;
        s.parentClub = null;
        s.transferMarket.status = 'Returned from loan';
        email(s, 'Loan update', 'Your loan spell has ended', 'You return from ' + oldClub + ' to ' + s.club + '. Your parent club will review your role and next steps.');
      }
      evaluateMarketDay(s, day, absolute);
    }
  }
  function badge() {
    const nav = document.getElementById('nav');
    const button = nav && [...nav.querySelectorAll('button')].find(item => item.textContent.trim().startsWith('TRANSFERS'));
    if (!button) return;
    const count = (ensure(get())?.transferInbox || []).filter(item => !item.read).length;
    button.classList.toggle('oms-transfer-unread', count > 0);
    button.dataset.unread = count > 0 ? String(count) : '';
    button.title = count > 0 ? count + ' unread transfer message' + (count === 1 ? '' : 's') : 'Transfer Center';
  }
  function render() {
    const view = document.getElementById('transfers');
    if (!view) return;
    const s = ensure(get());
    if (!s) {
      view.innerHTML = '<div class="panel"><div class="eyebrow">PLAYER CAREER · TRANSFER DESK</div><h1>TRANSFER CENTER</h1><p class="muted">Create a career to track club interest, offers and your contract.</p></div>';
      return;
    }
    const currentClub = s.onLoan ? s.club + ' · on loan from ' + (s.parentClub || 'your parent club') : s.club;
    const transferStatus = s.onLoan ? 'ON LOAN' : s.transferOffers.some(item => item.status === 'pending') ? 'OFFER TO REVIEW' : s.transferInterest.length ? 'CLUBS MONITORING' : s.transferMarket.status || 'UNDER CONTRACT';
    const marketValue = Number(s.value) || 0;
    const pending = s.transferOffers.filter(item => item.status === 'pending');
    const unread = s.transferInbox.filter(item => !item.read).length;
    const inbox = s.transferInbox.slice(0, 12);
    const interest = s.transferInterest.filter(item => item.status !== 'declined').slice(0, 8);
    const rumours = s.transferRumours.slice(0, 6);
    view.innerHTML = '<div class="panel oms-transfer-head"><div><div class="eyebrow">PLAYER CAREER · TRANSFER DESK</div><h1>TRANSFER CENTER</h1><p class="muted">Your future, every club conversation and every offer in one place.</p></div><span class="oms-transfer-status">' + esc(transferStatus) + '</span></div>' +
      '<div class="oms-transfer-grid"><section class="panel oms-transfer-overview"><div class="eyebrow">YOUR CONTRACT</div><h2>' + esc(currentClub || 'Your club') + '</h2><div class="oms-transfer-kpis"><div><small>MARKET VALUE</small><b>' + fmtMoney(marketValue) + '</b></div><div><small>WEEKLY SALARY</small><b>' + fmtWage(s.wage) + '</b></div><div><small>CONTRACT LEFT</small><b>' + s.contractYears + ' year' + (s.contractYears === 1 ? '' : 's') + '</b></div><div><small>TRANSFER STATUS</small><b>' + esc(transferStatus) + '</b></div></div><div class="oms-transfer-coach"><div><div class="eyebrow">TALK TO YOUR MANAGER</div><h3>Ask Coach</h3><p class="muted">Request permission to explore a move. Your relationship and squad role may change.</p></div><button class="action" onclick="OMS_TRANSFER_COACH_FORM()">ASK COACH ABOUT A MOVE →</button></div></section>' +
      '<section class="panel"><div class="oms-transfer-section-title"><div><div class="eyebrow">CLUB MAIL</div><h2>Transfer inbox</h2></div><span class="oms-transfer-count">' + unread + ' unread</span></div>' + (inbox.length ? '<div class="oms-transfer-inbox">' + inbox.map(item => '<article class="oms-transfer-message ' + (item.read ? '' : 'unread') + '"><div><span class="oms-transfer-type">' + esc(item.type) + '</span><small> S' + item.season + ' · D' + item.day + '</small></div><b>' + esc(item.subject) + '</b><p>' + esc(item.body) + '</p></article>').join('') + '</div>' : '<p class="muted">Transfer messages will arrive here when clubs or your coach contact you.</p>') + '</section></div>' +
      '<section class="panel oms-transfer-block"><div class="oms-transfer-section-title"><div><div class="eyebrow">PLAYER DECISIONS</div><h2>Offers & decisions</h2></div><span class="oms-transfer-count">' + pending.length + ' pending</span></div>' + (pending.length ? '<div class="oms-transfer-offers">' + pending.map(item => offerCard(item)).join('') + '</div>' : '<div class="oms-transfer-empty">No offers to decide on right now. Interest and rumours build over time, mainly during transfer windows.</div>') + '</section>' +
      '<div class="oms-transfer-grid oms-transfer-market-lists"><section class="panel"><div class="eyebrow">SCOUTING REPORTS</div><h2>Club interest</h2>' + (interest.length ? '<div class="oms-transfer-list">' + interest.map(item => '<article><div><b>' + esc(item.club) + '</b><small>' + esc(item.league || '') + '</small></div><span class="oms-interest-level ' + (item.level >= 70 ? 'strong' : item.level >= 45 ? 'medium' : 'early') + '">' + (item.level >= 70 ? 'Strong' : item.level >= 45 ? 'Growing' : 'Early') + '</span></article>').join('') + '</div>' : '<p class="muted">No clubs are tracking you yet. Performances, reputation and an open coach conversation can attract interest.</p>') + '</section><section class="panel"><div class="eyebrow">FOOTBALL PRESS</div><h2>Transfer rumours</h2>' + (rumours.length ? '<div class="oms-transfer-list">' + rumours.map(item => '<article><div><b>' + esc(item.club) + '</b><small>' + esc(item.source || 'Media report') + ' · S' + item.season + ' D' + item.day + '</small></div><span class="oms-transfer-rumour">UNCONFIRMED</span></article>').join('') + '</div>' : '<p class="muted">Rumours are unconfirmed reports and do not mean a club has made an offer.</p>') + '</section></div>' +
      '<section class="panel oms-transfer-block"><div class="eyebrow">AFTER A MOVE</div><h2>Fan & media reaction</h2>' + (s.mediaReactions.length ? '<div class="oms-transfer-reactions">' + s.mediaReactions.slice(0, 5).map(item => '<article class="' + esc(item.sentiment) + '"><span>' + esc(item.sentiment.toUpperCase()) + '</span><div><b>' + esc(item.source) + '</b><p>“' + esc(item.quote) + '”</p></div><small>S' + item.season + ' · D' + item.day + '</small></article>').join('') + '</div>' : '<p class="muted">Supporters and media will share their view after a transfer or loan is completed.</p>') + '</section>';
    badge();
  }
  function offerCard(item) {
    const isLoan = item.kind === 'loan';
    return '<article class="oms-transfer-offer"><div class="oms-transfer-offer-head"><div><span class="oms-transfer-type ' + (isLoan ? 'loan' : '') + '">' + (isLoan ? 'LOAN OFFER' : 'TRANSFER OFFER') + '</span><h3>' + esc(item.club) + '</h3><small>' + esc(item.league || '') + ' · S' + item.season + ' D' + item.day + '</small></div><b class="oms-transfer-fee">' + fmtMoney(item.fee) + '<small>' + (isLoan ? 'loan fee' : 'transfer fee to your club') + '</small></b></div><div class="oms-transfer-terms"><div><small>PROPOSED WAGE</small><b>' + fmtWage(item.wage) + '</b></div><div><small>CONTRACT</small><b>' + (isLoan ? '1 season loan' : item.years + ' years') + '</b></div><div><small>SQUAD ROLE</small><b>' + esc(item.role || 'Squad player') + '</b></div></div>' + (item.negotiating ? '<div class="oms-transfer-counter"><label for="omsCounter' + esc(item.id) + '">Your requested weekly salary</label><div><input id="omsCounter' + esc(item.id) + '" type="number" min="250" step="50" value="' + Math.round(item.wage * 1.12) + '"><button class="action" onclick="OMS_TRANSFER_COUNTER(\'' + esc(item.id) + '\')">SEND COUNTEROFFER</button></div></div>' : '') + '<div class="oms-transfer-actions"><button class="action" onclick="OMS_TRANSFER_ACCEPT(\'' + esc(item.id) + '\')">ACCEPT ' + (isLoan ? 'LOAN' : 'TRANSFER') + '</button><button class="action secondary" onclick="OMS_TRANSFER_NEGOTIATE(\'' + esc(item.id) + '\')">NEGOTIATE</button><button class="action secondary" onclick="OMS_TRANSFER_DECLINE(\'' + esc(item.id) + '\')">DECLINE</button></div></article>';
  }
  window.OMS_TRANSFER_COACH_FORM = function() {
    const s = ensure(get());
    if (!s) return toast('Start a career first.');
    const host = document.getElementById('omsTransferCoachForm');
    if (host) { host.remove(); render(); return; }
    const section = document.querySelector('#transfers .oms-transfer-coach');
    if (!section) return;
    section.insertAdjacentHTML('beforeend', '<div id="omsTransferCoachForm" class="oms-transfer-coach-form"><label for="omsTransferReason">Why do you want to explore a move?</label><select id="omsTransferReason"><option value="minutes">I want a clearer path to first-team minutes</option><option value="challenge">I am ready for a bigger challenge</option><option value="homesick">I would like to move closer to home</option><option value="loan">I want to discuss a loan for regular football</option></select><label for="omsTransferPreference">Preferred destination (optional)</label><select id="omsTransferPreference"><option value="">I am open to the right club</option>' + targets.filter(item => item.club !== s.club).map(item => '<option value="' + esc(item.club) + '">' + esc(item.club) + ' · ' + esc(item.league) + '</option>').join('') + '</select><button class="action" onclick="OMS_TRANSFER_ASK_COACH()">SEND REQUEST</button></div>');
  };
  window.OMS_TRANSFER_ASK_COACH = function() {
    const s = ensure(get());
    if (!s) return;
    const today = absoluteDay(s);
    if (today - Number(s.transferMarket.lastRequestDay || 0) < 75) return toast('Give the coach some time before requesting another move.');
    const reason = document.getElementById('omsTransferReason')?.value || 'minutes';
    const preferred = document.getElementById('omsTransferPreference')?.value || '';
    s.transferMarket.lastRequestDay = today;
    s.transferMarket.preferredClub = preferred;
    const trust = Number(s.managerTrust) || 50;
    const appearances = Number(s.apps) || 0;
    const backed = trust >= 58 || (trust >= 45 && appearances >= 8 && reason !== 'challenge');
    const manager = s.manager || 'Your coach';
    if (backed) {
      s.transferMarket.coachBackedUntil = today + 100;
      s.transferMarket.status = 'Coach will consider offers';
      s.managerTrust = clamp(trust - 2, 0, 100);
      s.morale = clamp((Number(s.morale) || 50) + 2, 0, 100);
      email(s, 'Coach response', manager + ' will consider a move', manager + ' understands your request to ' + reasonText(reason) + ' and will listen to suitable proposals' + (preferred ? ' from ' + preferred : '') + '. Your relationship remains positive, though your future will be discussed at the next squad review.');
    } else {
      s.transferMarket.status = 'Coach wants you to stay';
      s.managerTrust = clamp(trust - 8, 0, 100);
      s.morale = clamp((Number(s.morale) || 50) - 5, 0, 100);
      email(s, 'Coach response', manager + ' asks you to stay', manager + ' says your best route is to keep earning minutes here. The request has strained trust (' + Math.round(s.managerTrust) + '%) and morale (' + Math.round(s.morale) + '%), but future performances can change the conversation.');
    }
    save();
    render();
  };
  function reasonText(reason) { return ({ minutes:'find a clearer path to first-team minutes', challenge:'take on a bigger challenge', homesick:'move closer to home', loan:'get regular football on loan' })[reason] || 'explore your options'; }
  function findOffer(id) { const s = ensure(get()); return { s, offer:s?.transferOffers.find(item => item.id === id && item.status === 'pending') }; }
  window.OMS_TRANSFER_NEGOTIATE = function(id) {
    const { s, offer } = findOffer(id); if (!offer) return;
    offer.negotiating = !offer.negotiating; save(); render();
    if (offer.negotiating) setTimeout(() => document.getElementById('omsCounter' + id)?.focus(), 0);
  };
  window.OMS_TRANSFER_COUNTER = function(id) {
    const { s, offer } = findOffer(id); if (!offer) return;
    const desired = clamp(document.getElementById('omsCounter' + id)?.value, 250, 1000000);
    const ratio = desired / Math.max(1, Number(offer.wage));
    if (ratio <= 1.16) {
      offer.wage = round(Math.max(desired, offer.wage), 50); offer.negotiating = false; offer.negotiated = true;
      email(s, 'Negotiation update', offer.club + ' accept your salary request', offer.club + ' have agreed to a weekly salary of ' + fmtWage(offer.wage) + '. The ' + (offer.kind === 'loan' ? 'loan' : 'transfer') + ' offer is still open for your decision.', offer.id);
    } else if (ratio > 1.35) {
      offer.status = 'withdrawn'; offer.negotiating = false;
      email(s, 'Negotiation update', offer.club + ' withdraw their offer', offer.club + ' could not meet the salary request and have withdrawn the offer. Your current contract at ' + s.club + ' remains in place.');
    } else {
      offer.wage = round(offer.wage * 1.12, 50); offer.negotiating = false; offer.negotiated = true;
      email(s, 'Negotiation update', offer.club + ' return with revised terms', offer.club + ' have raised their offer to ' + fmtWage(offer.wage) + '. The updated terms remain available for your decision.', offer.id);
    }
    save(); render();
  };
  window.OMS_TRANSFER_DECLINE = function(id) {
    const { s, offer } = findOffer(id); if (!offer) return;
    offer.status = 'declined';
    email(s, 'Offer declined', 'You turned down ' + offer.club, 'You declined the ' + (offer.kind === 'loan' ? 'loan' : 'transfer') + ' proposal. Your current contract at ' + s.club + ' remains active.');
    save(); render();
  };
  window.OMS_TRANSFER_ACCEPT = function(id) {
    const { s, offer } = findOffer(id); if (!offer) return;
    const oldClub = s.club;
    const oldWage = Number(s.wage) || 0;
    const oldTrust = Number(s.managerTrust) || 50;
    offer.status = 'accepted';
    s.wage = Number(offer.wage) || s.wage;
    if (offer.kind === 'loan') {
      s.parentClub = oldClub; s.club = offer.club; s.onLoan = true;
      s.loanEndsAbsolute = absoluteDay(s) + 90;
      s.transferMarket.status = 'On loan at ' + offer.club;
      s.contractYears = Math.max(1, Number(s.contractYears) || 1);
    } else {
      s.club = offer.club; s.contractYears = Number(offer.years) || 3; s.onLoan = false;
      s.transferMarket.status = 'Transfer completed'; s.managerTrust = 55;
      s.transferOffers.forEach(item => { if (item.status === 'pending') item.status = 'expired'; });
      s.transferInterest = []; s.transferMarket.coachBackedUntil = 0;
    }
    const previousTier = targets.find(item => item.club === oldClub)?.tier || 60;
    const destinationTier = targets.find(item => item.club === offer.club)?.tier || 60;
    const preferredMove = s.transferMarket.preferredClub === offer.club;
    const positive = preferredMove || destinationTier >= previousTier + 5 || (offer.kind === 'loan' && offer.role !== 'Squad player');
    const sentiment = positive ? 'positive' : (oldTrust < 45 || (offer.role === 'Squad player' && Number(offer.wage) <= oldWage) ? 'negative' : 'neutral');
    const reaction = sentiment === 'positive' ? 'Fans are excited by the new chapter and believe the move can unlock your potential.' : sentiment === 'negative' ? 'Some supporters question the timing and feel the club has lost an important player.' : 'The move draws a mixed response, with supporters waiting to see how you settle in.';
    s.mediaReactions.unshift({ sentiment, source:'Supporter & media reaction', quote:reaction, day:s.day || 1, season:s.season || 1 });
    s.mediaReactions = s.mediaReactions.slice(0, 10);
    email(s, offer.kind === 'loan' ? 'Loan confirmed' : 'Transfer confirmed', offer.kind === 'loan' ? 'Your loan to ' + offer.club + ' is confirmed' : 'You have joined ' + offer.club, offer.kind === 'loan' ? 'You join ' + offer.club + ' on loan from ' + oldClub + ' for one season as a ' + offer.role.toLowerCase() + '. Your new weekly salary is ' + fmtWage(s.wage) + '. ' + reaction : 'The ' + fmtMoney(offer.fee) + ' move from ' + oldClub + ' to ' + offer.club + ' is complete. You sign for ' + offer.years + ' years on ' + fmtWage(s.wage) + ' as a ' + offer.role.toLowerCase() + '. ' + reaction);
    save();
    if (typeof window.render === 'function') window.render();
    render();
  };

  const oldBegin = window.beginCareer;
  if (typeof oldBegin === 'function') window.beginCareer = function() {
    oldBegin.apply(this, arguments);
    const s = ensure(get());
    if (s) { s.transferInbox = []; s.transferOffers = []; s.transferInterest = []; s.transferRumours = []; s.mediaReactions = []; s.transferMarket.status = 'Under contract'; s.transferMarket.nextCheckDay = 14 + Math.floor(Math.random() * 8); save(); render(); }
  };
  const oldAdvance = window.advance;
  if (typeof oldAdvance === 'function') window.advance = function(days) {
    const s = ensure(get()); const before = s ? absoluteDay(s) : 0;
    const result = oldAdvance.apply(this, arguments);
    const current = ensure(get()); if (current && before) processDays(before, absoluteDay(current), current);
    save(); render(); return result;
  };
  const oldMatch = window.simulateMatch;
  if (typeof oldMatch === 'function') window.simulateMatch = function() {
    const s = ensure(get()); const before = s ? absoluteDay(s) : 0;
    const result = oldMatch.apply(this, arguments);
    const current = ensure(get()); if (current && before) processDays(before, absoluteDay(current), current);
    save(); render(); return result;
  };
  const oldShow = window.show;
  if (typeof oldShow === 'function') window.show = function(id) {
    const result = oldShow.apply(this, arguments);
    if (id === 'transfers') render();
    return result;
  };
  const oldRender = window.render;
  if (typeof oldRender === 'function') window.render = function() { const result = oldRender.apply(this, arguments); render(); return result; };
  window.OMS_TRANSFER_VALIDATE_HANDLERS = () => ['OMS_TRANSFER_COACH_FORM','OMS_TRANSFER_ASK_COACH','OMS_TRANSFER_NEGOTIATE','OMS_TRANSFER_COUNTER','OMS_TRANSFER_DECLINE','OMS_TRANSFER_ACCEPT','OMS_TRANSFER_CLOSE_MAIL','OMS_TRANSFER_VIEW_MAIL'].every(name => typeof window[name] === 'function');
  setTimeout(() => { render(); badge(); }, 100);
})();
