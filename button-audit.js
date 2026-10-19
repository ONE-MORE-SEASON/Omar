/* ONE MORE SEASON — Button Reliability & Useful Controls v1
   Adds missing handlers and fixes usability plumbing without changing match simulation rules. */
(() => {
  'use strict';
  if (window.__OMS_BUTTON_RELIABILITY_V1__) return;
  window.__OMS_BUTTON_RELIABILITY_V1__ = true;

  const stateNow = () => typeof window.OMS_GET_STATE === 'function' ? window.OMS_GET_STATE() : window.OMS_CURRENT_STATE || window.state || null;
  const tell = message => { if (typeof window.toast === 'function') window.toast(message); else console.info('[ONE MORE SEASON]', message); };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clampInt = (value, min, max, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
  };

  // Repair the day-simulator buttons: these controls existed in the UI but had no function.
  window.OMS_SIM_DAYS = function(days) {
    const s = stateNow();
    if (!s || !s.name) { tell('Create a career before advancing the calendar.'); return false; }
    const count = clampInt(days, 1, 365, 1);
    if (typeof window.advance !== 'function') { tell('Calendar is unavailable right now.'); return false; }
    window.advance(count);
    updateDaySimulator();
    tell('Calendar advanced by ' + count + (count === 1 ? ' day.' : ' days.'));
    return true;
  };

  function updateDaySimulator() {
    const s = stateNow();
    if (!s) return;
    window.state = s;
    window.OMS_CURRENT_STATE = s;
    const day = Math.max(1, Number(s.day) || 1);
    const dayEl = document.getElementById('omsCleanDay');
    if (dayEl) dayEl.textContent = 'DAY ' + day;
    const note = document.getElementById('omsCleanNote');
    if (note) {
      let next = 'Daily activity';
      if (day % 7 === 1 || day % 7 === 5) next = '⚽ Matchday window';
      if (Number(s.injuredDays) > 0) next = '🩹 Recovery · ' + s.injuredDays + ' days left';
      note.innerHTML = 'DAY ' + day + ' · ' + next + ' · Fitness ' + Math.round(Number(s.fitness) || 0) + '% · Morale ' + Math.round(Number(s.morale) || 0) + '%';
    }
  }

  // The Journey button must not skip a choice; it now takes the user to the actual choices.
  window.omsNextJourneyDecision = function() {
    const choices = document.getElementById('omsJourneyChoices');
    if (!stateNow()) { tell('Create a career first.'); return; }
    if (choices) {
      choices.scrollIntoView({behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center'});
      tell('Choose A or B to move your story forward.');
    } else tell('Open Journey and choose A or B to continue.');
  };

  // A tidy, purposeful settings panel for actions that should not be hidden behind a decorative icon.
  function installSettings() {
    let gear = document.querySelector('.top .gear');
    if (gear && gear.tagName !== 'BUTTON') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = gear.className;
      button.id = 'omsSettingsButton';
      button.title = 'Career settings';
      button.setAttribute('aria-label', 'Open career settings');
      button.textContent = '⚙';
      gear.replaceWith(button);
      gear = button;
    }
    if (!gear) return;
    gear.onclick = openSettings;
    if (document.getElementById('omsSettingsOverlay')) return;

    const styles = document.createElement('style');
    styles.id = 'omsSettingsStyles';
    styles.textContent = `
      #omsSettingsOverlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:rgba(2,8,15,.72);backdrop-filter:blur(10px)}
      #omsSettingsOverlay.hidden{display:none!important}
      #omsSettingsPanel{width:min(480px,100%);border:1px solid rgba(134,190,222,.24);border-radius:22px;padding:22px;background:linear-gradient(150deg,#10253a,#091725);box-shadow:0 28px 90px #0009}
      #omsSettingsPanel h2{margin:7px 0 5px;font-size:23px;letter-spacing:-.04em}
      #omsSettingsPanel .oms-settings-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:19px}
      #omsSettingsPanel button{border-radius:11px;min-height:42px;padding:10px 12px;font-size:10px;font-weight:900;letter-spacing:.04em;cursor:pointer}
      #omsSettingsPanel .oms-settings-primary{background:#65e6bd;color:#08251c;border:1px solid #65e6bd}
      #omsSettingsPanel .oms-settings-secondary{background:#122a40;color:#e0edf7;border:1px solid #2a4962}
      #omsSettingsPanel .oms-settings-danger{background:#3a202c;color:#ffc7cf;border:1px solid #744052}
      #omsSettingsPanel .oms-settings-close{float:right;width:34px;height:34px;padding:0;font-size:18px}
      @media(max-width:480px){#omsSettingsPanel .oms-settings-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(styles);
    const overlay = document.createElement('div');
    overlay.id = 'omsSettingsOverlay';
    overlay.className = 'hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'omsSettingsTitle');
    overlay.innerHTML = `
      <section id="omsSettingsPanel">
        <button type="button" class="oms-settings-secondary oms-settings-close" id="omsSettingsClose" aria-label="Close settings">×</button>
        <div class="eyebrow">CAREER CONTROL</div>
        <h2 id="omsSettingsTitle">Career settings</h2>
        <p class="muted">Save your progress or export a backup. These actions do not change your career by themselves.</p>
        <div class="oms-settings-actions">
          <button type="button" class="oms-settings-primary" id="omsSaveCareer">SAVE CAREER</button>
          <button type="button" class="oms-settings-secondary" id="omsExportCareer">EXPORT BACKUP</button>
          <button type="button" class="oms-settings-secondary" id="omsCloseSettings">RETURN TO CAREER</button>
          <button type="button" class="oms-settings-danger" id="omsResetCareer">DELETE CAREER</button>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeSettings(); });
    overlay.querySelector('#omsSettingsClose').addEventListener('click', closeSettings);
    overlay.querySelector('#omsCloseSettings').addEventListener('click', closeSettings);
    overlay.querySelector('#omsSaveCareer').addEventListener('click', () => {
      const s = stateNow();
      if (!s) { tell('There is no active career to save.'); return; }
      try {
        if (typeof window.save === 'function') window.save();
        else localStorage.setItem('omsCareerStable3', JSON.stringify(s));
        tell('Career saved on this device.');
      } catch (error) { tell('Could not save this career in browser storage.'); }
    });
    overlay.querySelector('#omsExportCareer').addEventListener('click', () => {
      const s = stateNow();
      if (!s) { tell('There is no active career to export.'); return; }
      try {
        const payload = JSON.stringify({game:'ONE MORE SEASON',version:1,exportedAt:new Date().toISOString(),career:s}, null, 2);
        const blob = new Blob([payload], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const safeName = String(s.name || 'player').toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'') || 'player';
        anchor.href = url; anchor.download = 'one-more-season-' + safeName + '-career.json';
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        tell('Career backup exported.');
      } catch (error) { tell('Could not export your career backup.'); }
    });
    overlay.querySelector('#omsResetCareer').addEventListener('click', () => {
      closeSettings();
      if (typeof window.deleteCareer === 'function') window.deleteCareer();
      else tell('Use DELETE CAREER on the Player panel.');
    });
  }

  function openSettings() {
    const overlay = document.getElementById('omsSettingsOverlay');
    if (overlay) { overlay.classList.remove('hidden'); document.getElementById('omsSettingsClose')?.focus(); }
  }
  function closeSettings() {
    const overlay = document.getElementById('omsSettingsOverlay');
    if (overlay) overlay.classList.add('hidden');
    document.getElementById('omsSettingsButton')?.focus();
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSettings(); });

  // Turn each competition sub-tab into a real view. The underlying data is explicitly marked simulated.
  function installCompetitionTabs() {
    document.addEventListener('click', event => {
      const tab = event.target.closest('#omsCompetitionView .oms-tab');
      if (!tab) return;
      const view = document.getElementById('omsCompetitionView');
      const content = view?.querySelector('.oms-comp-grid > .oms-comp-box');
      if (!content) { tell('Competition data is not ready yet.'); return; }
      if (!content._omsTableHtml) content._omsTableHtml = content.innerHTML;

      const mode = tab.textContent.trim().toUpperCase();
      view.dataset.mode = mode;
      view.querySelectorAll('.oms-tab').forEach(button => {
        const active = button === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.type = 'button';
      });

      if (mode === 'TABLE') {
        content.innerHTML = content._omsTableHtml;
        return;
      }

      const s = stateNow() || {};
      const today = Math.max(1, Number(s.day) || 1);
      const league = view.querySelector('.oms-comp-title')?.textContent || 'League';
      if (!view._omsTeams || !view._omsTeams.length) view._omsTeams = [...view.querySelectorAll('.oms-table tbody tr')].map(row => row.querySelector('td:nth-child(2)')?.textContent?.trim()).filter(Boolean);
      const tableTeams = view._omsTeams;
      const userClub = String(s.club || document.querySelector('#club')?.value || 'Your club');
      const teams = tableTeams.length ? tableTeams : [userClub,'Opponent FC','United'];
      if (!teams.some(team => team.toLowerCase() === userClub.toLowerCase())) teams.unshift(userClub);
      const otherTeams = teams.filter(team => team.toLowerCase() !== userClub.toLowerCase());
      const fmtRow = (title,subtitle) => '<div class="oms-side-item"><b>' + escapeHTML(title) + '</b><small>' + escapeHTML(subtitle) + '</small></div>';

      if (mode === 'FIXTURES') {
        const fixtures = Array.from({length:8},(_,i) => {
          const opponent = otherTeams[(today + i * 3) % Math.max(1,otherTeams.length)] || 'League opponent';
          const matchDay = today + (i + 1) * 3;
          const home = (today + i) % 2 === 0;
          const left = home ? userClub : opponent, right = home ? opponent : userClub;
          return '<tr><td>' + matchDay + '</td><td class="club">' + escapeHTML(left) + '</td><td>vs</td><td class="club">' + escapeHTML(right) + '</td><td>' + (home ? 'Home' : 'Away') + '</td></tr>';
        }).join('');
        content.innerHTML = '<div class="oms-kicker">UPCOMING FIXTURES · SIMULATED</div><h3 style="margin:8px 0 4px">' + escapeHTML(userClub) + '</h3><p class="muted">These are generated match slots for your career calendar.</p><table class="oms-table"><thead><tr><th>DAY</th><th>HOME</th><th></th><th>AWAY</th><th>VENUE</th></tr></thead><tbody>' + fixtures + '</tbody></table>';
      } else if (mode === 'RESULTS') {
        const results = Array.from({length:6},(_,i) => {
          const matchDay = Math.max(1,today - i * 7);
          const opponent = otherTeams[(today + i * 2 + 1) % Math.max(1,otherTeams.length)] || 'League opponent';
          const playerHome = (matchDay + i) % 2 === 0;
          const userGoals = playerHome ? (matchDay * 3 + i) % 4 : (matchDay + i * 2) % 3;
          const opponentGoals = playerHome ? (matchDay + i * 2) % 3 : (matchDay * 3 + i) % 4;
          const homeName = playerHome ? userClub : opponent, awayName = playerHome ? opponent : userClub;
          const homeGoals = playerHome ? userGoals : opponentGoals, awayGoals = playerHome ? opponentGoals : userGoals;
          return '<tr><td>' + matchDay + '</td><td class="club">' + escapeHTML(homeName) + '</td><td><b>' + homeGoals + '–' + awayGoals + '</b></td><td class="club">' + escapeHTML(awayName) + '</td><td>' + (userGoals > opponentGoals ? 'W' : userGoals === opponentGoals ? 'D' : 'L') + '</td></tr>';
        }).join('');
        content.innerHTML = '<div class="oms-kicker">RECENT RESULTS · SIMULATED</div><h3 style="margin:8px 0 4px">Recent match list</h3><p class="muted">This generated list is illustrative; your actual player match reports remain in Match Centre.</p><table class="oms-table"><thead><tr><th>DAY</th><th>HOME</th><th>SCORE</th><th>AWAY</th><th>OUTCOME</th></tr></thead><tbody>' + results + '</tbody></table>';
      } else if (mode === 'TOP SCORERS') {
        const playerRows = Array.isArray(window.OMS_PLAYERS) ? window.OMS_PLAYERS
          .filter(p => String(p[2] || '').toLowerCase() === String(league).toLowerCase() && ['ST','CF','LW','RW','CAM'].includes(String(p[3] || '').toUpperCase()))
          .sort((a,b) => Number(b[4] || 0) - Number(a[4] || 0)).slice(0,7) : [];
        const userGoals = Number(s.seasonStats?.goals ?? s.goals ?? 0) || 0;
        const aiRows = playerRows.map((p,i) => ({
          name:p[0], club:p[1], goals:Math.max(0,Math.round((Number(p[4] || 65) - 68) * .23 + today * .025 + ((i * 3 + today) % 4)))
        }));
        if (s.name) aiRows.push({name:s.name,club:userClub,goals:userGoals,isUser:true});
        aiRows.sort((a,b) => b.goals - a.goals || a.name.localeCompare(b.name));
        const scorerRows = aiRows.slice(0,10).map((p,i) => '<tr class="' + (p.isUser ? 'user' : '') + '"><td>' + (i+1) + '</td><td class="club">' + escapeHTML(p.name) + '</td><td>' + escapeHTML(p.club) + '</td><td><b>' + p.goals + '</b></td></tr>').join('');
        content.innerHTML = '<div class="oms-kicker">TOP SCORERS · SIMULATED</div><h3 style="margin:8px 0 4px">' + escapeHTML(league) + '</h3><p class="muted">Other player totals are generated estimates; your row uses your saved career goal count.</p><table class="oms-table"><thead><tr><th>#</th><th>PLAYER</th><th>CLUB</th><th>GOALS</th></tr></thead><tbody>' + scorerRows + '</tbody></table>';
      } else if (mode === 'NEWS') {
        const leader = teams[0] || 'League leader';
        const goalCount = Number(s.seasonStats?.goals ?? s.goals ?? 0) || 0;
        const items = [
          'Day ' + today + ': ' + userClub + ' prepare for the next simulated league fixture.',
          'Table watch: ' + leader + ' currently leads the generated ' + league + ' standings.',
          s.name ? s.name + ' has ' + goalCount + ' recorded league goal' + (goalCount === 1 ? '' : 's') + ' in this career state.' : 'Create a player career to personalize the news feed.',
          'Manager report: consistency, fitness and morale remain key selection factors.'
        ];
        content.innerHTML = '<div class="oms-kicker">LEAGUE NEWS · SIMULATED</div><h3 style="margin:8px 0 4px">' + escapeHTML(league) + ' news desk</h3><div class="news">' + items.map((item,i)=>'<div><b>' + (i+1) + '. </b>' + escapeHTML(item) + '</div>').join('') + '</div>';
      }
      tab.focus({preventScroll:true});
    });
  }

  // Refresh simulation info without rebuilding the competition page or resetting its selected tab.
  function syncLegacyState() {
    const s = stateNow();
    if (s) { window.state = s; window.OMS_CURRENT_STATE = s; }
  }

  function refreshVisibleStatus() {
    syncLegacyState();
    updateDaySimulator();
    if (typeof window.OMS_MEGA3_RENDER === 'function') window.OMS_MEGA3_RENDER();
    const s = stateNow();
    if (s && document.getElementById('omsCompetitionView')?.classList.contains('active')) {
      const selected = document.getElementById('omsCompetitionView')?.dataset.mode;
      if (selected && selected !== 'TABLE') {
        const button = [...document.querySelectorAll('#omsCompetitionView .oms-tab')].find(item => item.textContent.trim().toUpperCase() === selected);
        if (button) button.click();
      }
    }
  }

  function boot() {
    installSettings();
    installCompetitionTabs();

    // Generate the extra competition navigation only after a career is visible.
    const oldBegin = window.beginCareer;
    if (typeof oldBegin === 'function') {
      window.beginCareer = function() {
        const result = oldBegin.apply(this, arguments);
        syncLegacyState();
        setTimeout(() => {
          if (!stateNow()) return;
          if (window.OMSCleanHub && typeof window.OMSCleanHub.render === 'function') window.OMSCleanHub.render();
          if (typeof window.OMS_MEGA3_RENDER === 'function') window.OMS_MEGA3_RENDER();
          updateDaySimulator();
        }, 40);
        return result;
      };
    }

    // Keep new panels and save references in sync when the existing render path runs.
    const oldRender = window.render;
    if (typeof oldRender === 'function') {
      window.render = function() {
        syncLegacyState();
        const result = oldRender.apply(this, arguments);
        syncLegacyState();
        setTimeout(refreshVisibleStatus, 0);
        return result;
      };
    }

    // Helpful, non-destructive labels for accessible controls.
    document.querySelectorAll('button').forEach(button => {
      if (!button.hasAttribute('type')) button.type = 'button';
    });
    updateDaySimulator();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
