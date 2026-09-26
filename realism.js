(() => {
  'use strict';

  const KEY = 'oms_realism_v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = s => localStorage.setItem(KEY, JSON.stringify(s));
  const state = load();
  state.transferRequests = Number(state.transferRequests || 0);
  state.lastTransferRequestDay = Number(state.lastTransferRequestDay || -999);
  state.matchesSinceTransferRequest = Number(state.matchesSinceTransferRequest || 0);
  state.injuryDays = Number(state.injuryDays || 0);
  state.suspensionMatches = Number(state.suspensionMatches || 0);
  state.contractYears = Number(state.contractYears || 3);
  state.season = Number(state.season || 1);
  state.goals = Number(state.goals || 0);
  state.assists = Number(state.assists || 0);
  state.appearances = Number(state.appearances || 0);
  state.cleanSheets = Number(state.cleanSheets || 0);
  save(state);

  const $ = id => document.getElementById(id);
  const toast = (title, message, good = true) => {
    let t = $('realismToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'realismToast';
      t.style.cssText = 'position:fixed;right:22px;bottom:22px;z-index:9999;max-width:380px;padding:16px 18px;border:1px solid #2b6788;border-radius:14px;background:linear-gradient(145deg,#071d2e,#04111c);box-shadow:0 18px 55px #000b;color:#fff;font:14px Inter,system-ui,sans-serif;opacity:0;transform:translateY(12px);transition:.22s';
      document.body.appendChild(t);
    }
    t.style.borderColor = good ? '#18d99d' : '#ff6f7d';
    t.innerHTML = '<b style="display:block;margin-bottom:5px">' + title + '</b><span style="color:#b8ccdd">' + message + '</span>';
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'none'; });
    clearTimeout(t._timer); t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; }, 4200);
  };

  function ageField() {
    const age = $('cAge');
    if (!age) return;
    age.max = '45';
    age.title = 'Realism: players aged 38+ cannot start an active-player career.';
  }

  function getDay() {
    const el = $('day');
    return Number(el?.textContent?.replace(/\D/g, '') || 1);
  }

  function playerAge() { return Number($('cAge')?.value || state.age || 17); }

  function ageRule() {
    const age = playerAge();
    if (age >= 38) {
      toast('Career start blocked', age + ' is too old for an active-player career in this simulation. Start at 37 or younger.', false);
      return false;
    }
    if (age >= 33) toast('Veteran career', 'You can start, but physical development is slower and retirement risk rises each season.', true);
    return true;
  }

  function installCreatorRule() {
    const start = document.querySelector('.start');
    if (!start) return;
    start.addEventListener('click', e => { if (!ageRule()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    const age = $('cAge');
    age?.addEventListener('input', () => {
      const n = Number(age.value);
      if (n >= 38) age.style.borderColor = '#ff6f7d';
      else age.style.borderColor = '';
    });
  }

  function injectRealismPanel() {
    if ($('realismPanel')) return;
    const home = $('home');
    if (!home) return;
    const panel = document.createElement('section');
    panel.id = 'realismPanel';
    panel.className = 'panel';
    panel.style.marginTop = '18px';
    panel.innerHTML = `
      <div class="panel-title"><div><h2>REALISM ENGINE</h2><div class="muted">Your career has rules, consequences and limits.</div></div><span class="pill">LIVE</span></div>
      <div class="metric-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="metric"><span class="muted">TRANSFER REQUESTS</span><b id="rrTransfers">${state.transferRequests}/2</b></div>
        <div class="metric"><span class="muted">INJURY</span><b id="rrInjury">${state.injuryDays ? state.injuryDays + 'd' : 'Fit'}</b></div>
        <div class="metric"><span class="muted">SUSPENSION</span><b id="rrSuspension">${state.suspensionMatches || 'None'}</b></div>
        <div class="metric"><span class="muted">CONTRACT</span><b id="rrContract">${state.contractYears}y</b></div>
      </div>`;
    home.appendChild(panel);
  }

  function refreshPanel() {
    $('rrTransfers') && ($('rrTransfers').textContent = Math.min(state.transferRequests, 2) + '/2');
    $('rrInjury') && ($('rrInjury').textContent = state.injuryDays ? state.injuryDays + 'd' : 'Fit');
    $('rrSuspension') && ($('rrSuspension').textContent = state.suspensionMatches || 'None');
    $('rrContract') && ($('rrContract').textContent = state.contractYears + 'y');
  }

  function transferRequestAllowed() {
    const day = getDay();
    // Maximum two requests per season, and at least 12 in-game days between requests.
    if (state.transferRequests >= 2) {
      toast('Transfer request denied', 'You have already asked to leave twice this season. Your agent needs to wait for a new season.', false);
      return false;
    }
    if (day - state.lastTransferRequestDay < 12) {
      toast('Too soon', 'Your last transfer request was recent. Clubs and your agent need time to react.', false);
      return false;
    }
    state.transferRequests += 1;
    state.lastTransferRequestDay = day;
    state.matchesSinceTransferRequest = 0;
    save(state); refreshPanel();
    toast('Transfer request submitted', 'Your agent will contact clubs. Repeated requests can hurt trust with your current club.', true);
    return true;
  }

  function looksLikeTransferRequest(btn) {
    const text = (btn.innerText || btn.textContent || '').trim().toLowerCase();
    return /request transfer|ask for transfer|request a transfer|transfer request|ask to leave|want to leave/.test(text);
  }

  function installTransferRule() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn || !looksLikeTransferRequest(btn)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      transferRequestAllowed();
    }, true);
  }

  function installSimulationRealism() {
    // Adds consequences around simulation controls without replacing the existing simulator.
    document.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const text = (btn.innerText || '').toLowerCase();
      if (!/simulate next match|simulate 3 days|simulate season|advance/.test(text)) return;
      if (state.injuryDays > 0) {
        state.injuryDays = Math.max(0, state.injuryDays - (text.includes('season') ? 14 : text.includes('3 days') ? 3 : 1));
        save(state); setTimeout(refreshPanel, 50);
        if (state.injuryDays > 0) toast('Recovery in progress', 'You are still injured for ' + state.injuryDays + ' more day(s). Your availability can be limited.', false);
      }
      if (state.suspensionMatches > 0 && /simulate next match/.test(text)) {
        state.suspensionMatches = Math.max(0, state.suspensionMatches - 1); save(state); setTimeout(refreshPanel, 50);
        toast('Suspension served', state.suspensionMatches ? state.suspensionMatches + ' match(es) remain.' : 'You are available again.', true);
      }
      state.matchesSinceTransferRequest += text.includes('season') ? 20 : text.includes('3 days') ? 1 : 1;
      save(state);
    }, true);
  }

  function realismRulesText() {
    // Fixes the classic "0 goals = Golden Boot" type of simulation result.
    const bodyText = document.body.innerText.toLowerCase();
    if (bodyText.includes('golden boot') && /\b0 goals\b/.test(bodyText)) {
      const nodes = [...document.querySelectorAll('*')].filter(n => n.children.length === 0 && /golden boot/i.test(n.textContent || ''));
      nodes.forEach(n => {
        if (/0 goals/i.test(n.parentElement?.textContent || '')) n.textContent = 'Golden Boot: No winner yet';
      });
    }
  }

  function init() {
    ageField();
    installCreatorRule();
    installTransferRule();
    installSimulationRealism();
    injectRealismPanel();
    refreshPanel();
    setTimeout(realismRulesText, 700);
    setInterval(() => { ageField(); injectRealismPanel(); refreshPanel(); }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
