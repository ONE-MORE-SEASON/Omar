(() => {
  'use strict';

  const SAVE_KEY='oms_career_save_v3';
  const META_KEY='oms_career_meta_v3';
  const GAME_KEY='omsCareerDeep';
  const MAX_SEASONS=20;
  const $=id=>document.getElementById(id);

  const toast=(title,msg,good=true)=>{
    let t=$('careerControlToast');
    if(!t){
      t=document.createElement('div');
      t.id='careerControlToast';
      t.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;max-width:380px;padding:14px 17px;border-radius:13px;border:1px solid #2b6788;background:#061a2a;color:#fff;box-shadow:0 18px 50px #0009;font:14px Inter,system-ui,sans-serif;opacity:0;transform:translateY(10px);transition:.2s';
      document.body.appendChild(t);
    }
    t.style.borderColor=good?'#18d99d':'#ff6f7d';
    t.innerHTML='<b>'+title+'</b><div style="color:#b8ccdd;margin-top:4px">'+msg+'</div>';
    requestAnimationFrame(()=>{t.style.opacity=1;t.style.transform='none'});
    clearTimeout(t._x);
    t._x=setTimeout(()=>{t.style.opacity=0;t.style.transform='translateY(10px)'},3500);
  };

  const getSeason=()=>{
    const candidates=[$('seasonLabel'),document.querySelector('.season-label'),document.querySelector('[data-season]')];
    for(const el of candidates){
      const m=(el?.textContent||'').match(/season\s*(\d+)/i);
      if(m)return Number(m[1]);
    }
    try{return Number(JSON.parse(localStorage.getItem(META_KEY)||'{}').season)||1}catch{return 1}
  };

  const setMeta=()=>localStorage.setItem(META_KEY,JSON.stringify({season:getSeason(),savedAt:new Date().toISOString()}));

  function snapshot(){
    const inputs={};
    document.querySelectorAll('input,select,textarea').forEach(el=>{if(el.id)inputs[el.id]=el.value});
    const views={};
    document.querySelectorAll('.view').forEach(v=>views[v.id]=v.classList.contains('active'));
    return {
      version:4,
      savedAt:new Date().toISOString(),
      localStorage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith('oms_career_save_'))),
      inputs,
      day:$('day')?.textContent||'1',
      date:$('date')?.textContent||'',
      views,
      season:getSeason()
    };
  }

  function saveCareer(){
    if(!localStorage.getItem(GAME_KEY)){
      toast('No active career','Start a career before saving.',false);
      return;
    }
    localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot()));
    setMeta();
    updateButtons();
    toast('Career saved','Your current career state has been saved in this browser.');
  }

  function loadCareer(){
    let s;
    try{s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch{s=null}
    if(!s){toast('No saved career','There is no saved career to load.',false);return}

    Object.entries(s.localStorage||{}).forEach(([k,v])=>localStorage.setItem(k,v));
    Object.entries(s.inputs||{}).forEach(([id,v])=>{const el=$(id);if(el)el.value=v});
    if($('day'))$('day').textContent=s.day||'1';
    if($('date'))$('date').textContent=s.date||'';
    Object.entries(s.views||{}).forEach(([id,active])=>$(id)?.classList.toggle('active',!!active));
    if($('app'))$('app').classList.remove('hidden');
    if($('creator'))$('creator').classList.add('hidden');
    toast('Career loaded','Your saved career has been restored.');
    setTimeout(()=>window.dispatchEvent(new Event('careerLoaded')),50);
  }

  function resetCreatorForm(){
    const values={cName:'',cAge:'17',cNumber:'10',cPos:'ST',cFoot:'Right',cNation:'Sweden',cStyle:'Complete Forward',cAmb:'World Star',cClub:'Hillcrest Academy'};
    Object.entries(values).forEach(([id,value])=>{const el=$(id);if(el)el.value=value});
  }

  function deleteCareer(){
    if(!localStorage.getItem(GAME_KEY) && !localStorage.getItem(SAVE_KEY)){
      toast('No career found','There is no career to delete.',false);
      return;
    }
    if(!confirm('Delete this career? Your player, season and progress will be permanently removed.'))return;

    // The original game stores its live career under omsCareerDeep.
    // The old Delete button only removed keys beginning with "oms_", so
    // omsCareerDeep survived and loaded the same career again after refresh.
    localStorage.removeItem(GAME_KEY);
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(META_KEY);
    Object.keys(localStorage).filter(k=>k.startsWith('oms_')).forEach(k=>localStorage.removeItem(k));

    // Reset the in-memory game state too, so the old career cannot reappear
    // without requiring a page refresh.
    try{
      if(typeof defaultState!=='undefined' && typeof clone==='function'){
        state=clone(defaultState);
        state.started=false;
      }
    }catch(e){}

    if($('app'))$('app').classList.add('hidden');
    if($('creator'))$('creator').classList.remove('hidden');
    resetCreatorForm();
    const loadBtn=$('loadCareerBtn');
    if(loadBtn)loadBtn.remove();
    const hint=document.querySelector('.muted');
    if(hint && $('creator')){}
    window.scrollTo({top:0,behavior:'smooth'});
    updateButtons();
    toast('Career deleted','You are back at the very first Player Setup page.');
  }

  function updateButtons(){
    const hasGame=!!localStorage.getItem(GAME_KEY);
    const hasSave=!!localStorage.getItem(SAVE_KEY);
    const b=$('saveCareerBtn'),d=$('deleteCareerBtn');
    if(b)b.innerHTML=hasGame?'💾 SAVE CAREER':'💾 SAVE CAREER';
    if(d)d.disabled=!(hasGame||hasSave);
  }

  function injectButtons(){
    if($('careerControls'))return;
    const top=document.querySelector('.top');
    if(!top)return;
    const box=document.createElement('div');
    box.id='careerControls';
    box.style.cssText='display:flex;gap:7px;align-items:center;margin-left:4px';
    box.innerHTML='<button id="saveCareerBtn" type="button" style="padding:8px 10px;border:1px solid #246487;border-radius:9px;background:#0a2235;color:#eaf7ff;font-weight:900;font-size:10px">💾 SAVE CAREER</button><button id="deleteCareerBtn" type="button" style="padding:8px 10px;border:1px solid #703d49;border-radius:9px;background:#24131a;color:#ffb9c1;font-weight:900;font-size:10px">🗑 DELETE CAREER</button>';
    const gear=top.querySelector('.gear');
    top.insertBefore(box,gear||null);
    $('saveCareerBtn').onclick=saveCareer;
    $('deleteCareerBtn').onclick=deleteCareer;
    updateButtons();
  }

  function injectLoad(){
    if($('loadCareerBtn')||!localStorage.getItem(SAVE_KEY))return;
    const start=document.querySelector('.start');
    if(!start)return;
    const b=document.createElement('button');
    b.id='loadCareerBtn';
    b.type='button';
    b.textContent='↻ LOAD SAVED CAREER';
    b.style.cssText='margin-top:10px;width:100%;padding:12px;border:1px solid #28658b;border-radius:12px;background:#0a2235;color:#dff5ff;font-weight:900';
    b.onclick=loadCareer;
    start.insertAdjacentElement('afterend',b);
  }

  function installLimit(){
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');
      if(!b)return;
      const txt=(b.innerText||'').toLowerCase();
      if(!/simulate season|next season|start new season|end season/.test(txt))return;
      const season=getSeason();
      if(season>=MAX_SEASONS){
        e.preventDefault();
        e.stopImmediatePropagation();
        toast('CAREER COMPLETE','20 seasons is the maximum career length.',false);
        return;
      }
      setMeta();
    },true);
  }

  function enforceAgeEndpoint(){
    const age=Number($('cAge')?.value||0);
    if(age>=38){
      const b=document.querySelector('.start');
      if(b){b.disabled=true;b.style.opacity='.5';b.title='Active-player careers cannot start at 38+'}
    }
  }

  function init(){
    injectButtons();
    injectLoad();
    installLimit();
    enforceAgeEndpoint();
    setInterval(()=>{
      injectButtons();
      injectLoad();
      updateButtons();
      enforceAgeEndpoint();
    },1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
