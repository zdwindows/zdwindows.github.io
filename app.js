// Codebit v5 - simplified but functional implementation
const LS_USERS = 'codebit_users_v5';
const LS_LOGGED = 'codebit_logged_v5';
const LS_PUBLIC = 'codebit_public_v5';

// DOM
const landing = document.getElementById('landing');
const recentProjectsEl = document.getElementById('recent-projects');
const authUsername = document.getElementById('auth-username');
const authPassword = document.getElementById('auth-password');
const btnRegister = document.getElementById('btn-register');
const btnLogin = document.getElementById('btn-login');

const studio = document.getElementById('studio');
const studioWelcome = document.getElementById('studio-welcome');
const studioMeta = document.getElementById('studio-meta');
const btnLogout = document.getElementById('btn-logout');
const btnNewProject = document.getElementById('btn-new-project');
const projectsListEl = document.getElementById('projects-list');
const projectNameInput = document.getElementById('project-name');
const workspace = document.getElementById('workspace');
const previewIframe = document.getElementById('preview-iframe');
const paletteButtons = document.querySelectorAll('.palette-btn');
const btnSaveProject = document.getElementById('btn-save-project');
const btnDeleteProject = document.getElementById('btn-delete-project');
const btnSaveJson = document.getElementById('btn-save-json');
const btnLoadJson = document.getElementById('btn-load-json');
const fileLoad = document.getElementById('file-load');
const studioListEl = document.getElementById('studio-list');
const projectStudioSelect = document.getElementById('project-studio');
const btnAttachStudio = document.getElementById('btn-attach-studio');
const btnManageStudios = document.getElementById('btn-manage-studios');
const btnProfile = document.getElementById('btn-profile');
const modal = document.getElementById('modal');
const profilePage = document.getElementById('profile-page');
const profileBack = document.getElementById('profile-back');
const publicCheck = document.getElementById('public-check');

// code editor
const btnCodeview = document.getElementById('btn-codeview');
const codeEditor = document.getElementById('code-editor');
const codeTextarea = document.getElementById('code-textarea');
const codeLineNums = document.getElementById('code-line-numbers');
const btnApplyCode = document.getElementById('btn-apply-code');
const btnCloseCode = document.getElementById('btn-close-code');

function readUsers(){ try{ return JSON.parse(localStorage.getItem(LS_USERS) || '{}') }catch(e){return{}} }
function writeUsers(u){ localStorage.setItem(LS_USERS, JSON.stringify(u)) }
function getLogged(){ return localStorage.getItem(LS_LOGGED) }
function setLogged(u){ if(u) localStorage.setItem(LS_LOGGED,u); else localStorage.removeItem(LS_LOGGED) }
function now(){ return new Date().toISOString() }
function readPublic(){ try{ return JSON.parse(localStorage.getItem(LS_PUBLIC) || '[]') }catch(e){return[]} }
function writePublic(a){ localStorage.setItem(LS_PUBLIC, JSON.stringify(a)) }

// seed public demo if empty
if(!localStorage.getItem(LS_PUBLIC)){
  writePublic([{id:'pub1', author:'demo', name:'Public Demo', html:'<h1>Public Demo</h1><p>Welcome to Codebit v5</p>'}]);
}

// render recent public list
function renderRecent(){
  const list = readPublic();
  recentProjectsEl.innerHTML='';
  list.slice().reverse().forEach(p=>{
    const el = document.createElement('div'); el.className='item'; el.innerHTML = `<strong>${p.name}</strong><small> by ${p.author}</small>`;
    el.addEventListener('click', ()=> showProjectPreview(p));
    recentProjectsEl.appendChild(el);
  });
}
renderRecent();

function showProjectPreview(p){
  showModal(`<h3>${escapeHtml(p.name)}</h3><p>By: ${escapeHtml(p.author)}</p><iframe style="width:100%;height:320px;border:0" srcdoc="${p.html}"></iframe>`);
}

// auth
btnRegister.addEventListener('click', ()=>{
  const u = authUsername.value.trim(), p = authPassword.value;
  if(!u||!p){ alert('kullanıcı ve şifre'); return; }
  const users = readUsers(); if(users[u]){ alert('var'); return; }
  users[u] = { password:p, createdAt: now(), projects: [], studios: [] };
  writeUsers(users); setLogged(u); enterStudio();
});
btnLogin.addEventListener('click', ()=>{
  const u = authUsername.value.trim(), p = authPassword.value;
  const users = readUsers(); if(!users[u]||users[u].password!==p){ alert('hata'); return; }
  setLogged(u); enterStudio();
});

function enterStudio(){
  const u = getLogged(); if(!u) return showLanding();
  landing.classList.add('hidden'); studio.classList.remove('hidden'); profilePage.classList && profilePage.classList.add('hidden');
  studioWelcome.textContent = `Tekrardan hoşgeldin, ${u}`;
  studioMeta.textContent = `Hesap: ${u} • Oluşturma: ${readUsers()[u].createdAt}`;
  renderUserProjects(); renderStudios(); renderProjectStudioOptions(); renderTopActions();
  const users = readUsers(), me = users[u]; if(me.projects && me.projects.length) selectProject(me.projects[0].id); else clearWorkspace();
  renderRecent();
}

function showLanding(){ landing.classList.remove('hidden'); studio.classList.add('hidden'); renderRecent(); renderTopActions(); }

function renderTopActions(){
  const top = document.getElementById('top-actions');
  const u = getLogged();
  if(!u){ top.innerHTML=''; return; }
  top.innerHTML = `<span style="color:white;margin-right:8px">Hi, ${u}</span><button id="top-profile">Profil</button><button id="top-logout" class="danger">Çıkış</button>`;
  document.getElementById('top-logout').addEventListener('click', ()=>{ setLogged(null); showLanding(); });
  document.getElementById('top-profile').addEventListener('click', ()=> openProfile(u));
}

// projects
let activeProjectId = null;
function makeProject(name='Yeni Proje'){ return { id:'p_'+Date.now()+'_'+Math.floor(Math.random()*9999), name, created:now(), updated:now(), blocks:[], studioId:null, public:false, html:'' }; }

function renderUserProjects(){
  projectsListEl.innerHTML='';
  const users = readUsers(), u = getLogged(); if(!u||!users[u]) return;
  users[u].projects.forEach(p=>{
    const el = document.createElement('div'); el.className='proj'; el.textContent = p.name; el.dataset.id=p.id;
    el.addEventListener('click', ()=> selectProject(p.id));
    projectsListEl.appendChild(el);
  });
}

function renderStudios(){ studioListEl.innerHTML=''; const users = readUsers(), u=getLogged(); if(!u||!users[u]) return; users[u].studios.forEach(s=>{ const el=document.createElement('div'); el.className='proj'; el.textContent=s.name; el.dataset.id=s.id; el.addEventListener('click', ()=> openStudioView(s.id)); studioListEl.appendChild(el); }); }

function renderProjectStudioOptions(){ projectStudioSelect.innerHTML='<option value="">(Stüdyo seç)</option>'; const users = readUsers(), u=getLogged(); if(!u||!users[u]) return; users[u].studios.forEach(s=>{ const o=document.createElement('option'); o.value=s.id; o.textContent=s.name; projectStudioSelect.appendChild(o); }); }

btnManageStudios?.addEventListener('click', ()=>{
  showModal(`<h3>Stüdyolar</h3><p>Yeni stüdyo:</p><input id="new-studio-name" placeholder="Ad"/><input id="new-studio-desc" placeholder="Açıklama"/><button id="create-studio">Oluştur</button>`);
  document.getElementById('create-studio').addEventListener('click', ()=>{
    const name = document.getElementById('new-studio-name').value.trim(), desc = document.getElementById('new-studio-desc').value.trim();
    if(!name) return alert('ad'); const users = readUsers(), u=getLogged(); const s={id:'s_'+Date.now(),name,desc,created:now(),projects:[]}; users[u].studios.push(s); writeUsers(users); closeModal(); renderStudios(); renderProjectStudioOptions();
  });
});

btnAttachStudio?.addEventListener('click', ()=>{ const sid = projectStudioSelect.value; if(!sid) return alert('seç'); const users = readUsers(), u=getLogged(); if(!u) return; const p = users[u].projects.find(x=>x.id===activeProjectId); if(!p) return alert('proje seç'); p.studioId = sid; writeUsers(users); alert('eklendi'); renderStudios(); });

btnNewProject.addEventListener('click', ()=>{ const users = readUsers(), u=getLogged(); if(!u) return alert('giriş'); const p = makeProject('Yeni Proje'); users[u].projects.unshift(p); writeUsers(users); renderUserProjects(); selectProject(p.id); });

function selectProject(id){
  const users = readUsers(), u=getLogged(); if(!u) return; const p = users[u].projects.find(x=>x.id===id); if(!p) return;
  activeProjectId = p.id; projectNameInput.value = p.name; publicCheck.checked = !!p.public; projectStudioSelect.value = p.studioId||'';
  workspace.innerHTML=''; (p.blocks||[]).forEach(b=> renderBlockFromData(b)); renderPreview();
}

function clearWorkspace(){ workspace.innerHTML=''; projectNameInput.value=''; activeProjectId=null; renderPreview(); }

// palette actions
paletteButtons.forEach(btn=> btn.addEventListener('click', ()=>{
  const type = btn.dataset.type;
  let val = '';
  if(type==='img'||type==='iframe'||type==='a') val = prompt('URL girin:');
  else if(type==='style' || type==='script' || type==='raw') val = prompt('Kod girin:');
  else if(type==='ul') val = prompt('Her satır yeni li olacak. Metin girin (satırla ayır):');
  else val = prompt('Metin girin:');
  if(val===null) return;
  createBlockFromPalette(type, val);
}));

function createBlockFromPalette(type, text){
  const data = { id:'b_'+Date.now()+'_'+Math.floor(Math.random()*9999), type, text, x:20, y:20, w:260, h:60, children:[] };
  const u = getLogged(); if(!u) return alert('giriş yap');
  const users = readUsers();
  let p = users[u].projects.find(x=>x.id===activeProjectId);
  if(!p){ p = makeProject('Untitled'); users[u].projects.unshift(p); writeUsers(users); renderUserProjects(); selectProject(p.id); }
  p.blocks.push(data); writeUsers(users);
  renderBlockFromData(data); renderPreview();
}

function renderBlockFromData(b){
  const el = document.createElement('div'); el.className='block'; el.style.left=(b.x||20)+'px'; el.style.top=(b.y||20)+'px'; el.style.width=(b.w||260)+'px'; el.style.height=(b.h||60)+'px'; el.dataset.id=b.id;
  el.innerHTML = `<div class="label">${b.type}</div><div class="content">${escapeHtml(b.text)}</div><div class="actions"><button class="edit">✎</button><button class="remove">Sil</button></div>`;
  workspace.appendChild(el);
  makeDraggable(el);
  el.querySelector('.edit').addEventListener('click', ()=>{ const nv = prompt('Yeni içerik', b.text||''); if(nv===null) return; b.text=nv; el.querySelector('.content').textContent = nv; updateBlockData(b); renderPreview(); });
  el.querySelector('.remove').addEventListener('click', ()=>{ if(!confirm('Sil?')) return; el.remove(); removeBlockData(b.id); renderPreview(); });
}

function updateBlockData(b){ const users = readUsers(), u=getLogged(); if(!u) return; const p = users[u].projects.find(x=>x.id===activeProjectId); if(!p) return; const idx = p.blocks.findIndex(x=>x.id===b.id); if(idx>=0) p.blocks[idx]=b; else p.blocks.push(b); p.updated=now(); writeUsers(users); }
function removeBlockData(id){ const users = readUsers(), u=getLogged(); if(!u) return; const p = users[u].projects.find(x=>x.id===activeProjectId); if(!p) return; p.blocks = p.blocks.filter(b=>b.id!==id); writeUsers(users); }

// draggable with merge detection
function makeDraggable(el){
  el.addEventListener('pointerdown', pointerDown);
  el.style.touchAction='none';
  function pointerDown(e){
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    const startX = e.clientX, startY = e.clientY; const origLeft = parseInt(el.style.left)||0, origTop = parseInt(el.style.top)||0;
    const id = el.dataset.id;
    function move(ev){
      const nx = origLeft + (ev.clientX - startX); const ny = origTop + (ev.clientY - startY);
      const snap = 8; const sx = Math.round(nx/snap)*snap; const sy = Math.round(ny/snap)*snap;
      el.style.left = sx+'px'; el.style.top = sy+'px';
      const users = readUsers(), u=getLogged(); if(!u) return; const p = users[u].projects.find(x=>x.id===activeProjectId); if(!p) return; const b = p.blocks.find(bb=>bb.id===id); if(!b) return; b.x=sx; b.y=sy; writeUsers(users);
      // highlight potential parent
      const all = Array.from(workspace.querySelectorAll('.block')).filter(x=>x!==el);
      all.forEach(other=>{ const r1 = el.getBoundingClientRect(), r2 = other.getBoundingClientRect();
        if(Math.abs(r1.top - (r2.bottom)) < 20 && !(r1.right < r2.left || r1.left > r2.right)) other.classList.add('merge-target'); else other.classList.remove('merge-target');
      });
      renderPreview();
    }
    function up(ev){
      el.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      const all = Array.from(workspace.querySelectorAll('.block')).filter(x=>x!==el);
      let merged=false;
      all.forEach(other=>{
        const r1 = el.getBoundingClientRect(), r2 = other.getBoundingClientRect();
        if(Math.abs(r1.top - (r2.bottom)) < 20 && !(r1.right < r2.left || r1.left > r2.right)){
          // attach child to parent in data model
          const users = readUsers(), u=getLogged(); if(!u) return; const p = users[u].projects.find(x=>x.id===activeProjectId); if(!p) return;
          const parent = p.blocks.find(bb=>bb.id===other.dataset.id); const child = p.blocks.find(bb=>bb.id===el.dataset.id);
          if(parent && child){ parent.children = parent.children || []; if(!parent.children.find(c=>c.id===child.id)){ parent.children.push(child); child.parent = parent.id; // adjust position
            el.style.left = (parseInt(other.style.left)+20)+'px'; el.style.top = (parseInt(other.style.top)+other.offsetHeight+8)+'px'; updateBlockData(parent); updateBlockData(child); merged=true;
          } }
        }
        other.classList.remove('merge-target');
      });
      if(merged) renderPreview();
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  }
}

// build HTML from blocks including nested children
function buildHtmlFromBlocks(){
  const users = readUsers(), u=getLogged(); if(!u) return '<!doctype html><html><body></body></html>';
  const p = users[u].projects.find(x=>x.id===activeProjectId); if(!p) return '<!doctype html><html><body></body></html>';
  let head = '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">', body='';
  function renderBlock(b){
    if(b.type==='style') head += '<style>'+b.text+'</style>';
    else if(b.type==='script') body += '<script>'+b.text+'</'+'script>';
    else if(b.type==='img') body += '<img src="'+escapeHtml(b.text)+'">';
    else if(b.type==='iframe') body += '<iframe src="'+escapeHtml(b.text)+'"></iframe>';
    else if(b.type==='ul') body += '<ul>'+(b.text||'').split('\n').map(li=>'<li>'+escapeHtml(li)+'</li>').join('')+'</ul>';
    else if(b.type==='raw') body += b.text;
    else body += '<'+b.type+'>'+escapeHtml(b.text)+'</'+b.type+'>';
    if(b.children && b.children.length) b.children.forEach(c=> renderBlock(c));
  }
  (p.blocks||[]).forEach(b=>{ if(!b.parent) renderBlock(b); });
  return '<!doctype html><html><head>'+head+'</head><body>'+body+'</body></html>';
}

function renderPreview(){
  try{ const html = buildHtmlFromBlocks(); const doc = previewIframe.contentWindow.document; doc.open(); doc.write(html); doc.close(); }
  catch(e){ previewIframe.setAttribute('srcdoc', buildHtmlFromBlocks()); }
}

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// data helpers
function updateBlockData(b){ const users=readUsers(), u=getLogged(); if(!u) return; const p=users[u].projects.find(x=>x.id===activeProjectId); if(!p) return; const idx=p.blocks.findIndex(x=>x.id===b.id); if(idx>=0) p.blocks[idx]=b; else p.blocks.push(b); p.updated=now(); writeUsers(users); }
function removeBlockData(id){ const users=readUsers(), u=getLogged(); if(!u) return; const p=users[u].projects.find(x=>x.id===activeProjectId); if(!p) return; p.blocks=p.blocks.filter(b=>b.id!==id); writeUsers(users); }

// save project and publish if checked
btnSaveProject.addEventListener('click', ()=>{
  const users = readUsers(), u=getLogged(); if(!u) return alert('giriş'); if(!activeProjectId) return alert('seç');
  const p = users[u].projects.find(x=>x.id===activeProjectId);
  p.name = projectNameInput.value || p.name; p.public = !!publicCheck.checked; p.updated = now(); p.html = buildHtmlFromBlocks(); writeUsers(users);
  if(p.public){ const pub = readPublic(); const existing = pub.find(x=>x.id===p.id); const entry={id:p.id,author:u,name:p.name,html:p.html}; if(existing){ const i=pub.findIndex(x=>x.id===p.id); pub[i]=entry; } else pub.push(entry); writePublic(pub); }
  else { let pub = readPublic(); pub = pub.filter(x=>x.id!==p.id); writePublic(pub); }
  renderUserProjects(); renderRecent(); alert('kaydedildi');
});

btnDeleteProject.addEventListener('click', ()=>{
  const users = readUsers(), u=getLogged(); if(!u) return; if(!activeProjectId) return alert('seç'); if(!confirm('sil?')) return;
  users[u].projects = users[u].projects.filter(x=>x.id!==activeProjectId); writeUsers(users); let pub = readPublic(); pub = pub.filter(x=>x.id!==activeProjectId); writePublic(pub); activeProjectId=null; renderUserProjects(); clearWorkspace(); renderRecent();
});

// save/load json
btnSaveJson.addEventListener('click', ()=>{ const users=readUsers(), u=getLogged(); if(!u) return alert('giriş'); if(!activeProjectId) return alert('seç'); const p = users[u].projects.find(x=>x.id===activeProjectId); const blob = new Blob([JSON.stringify(p,null,2)], {type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=(p.name||'project')+'.json'; a.click(); URL.revokeObjectURL(url); });
btnLoadJson.addEventListener('click', ()=> fileLoad.click());
fileLoad.addEventListener('change', e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const obj=JSON.parse(r.result); const users=readUsers(), u=getLogged(); if(!u) return alert('giriş'); users[u].projects.unshift(obj); writeUsers(users); renderUserProjects(); selectProject(obj.id); alert('yüklendi'); }catch(err){ alert('hata'); } }; r.readAsText(f); });

// code editor (simple CodeMirror-like feel)
btnCodeview.addEventListener('click', ()=>{ codeEditor.classList.toggle('hidden'); if(!codeEditor.classList.contains('hidden')){ const users=readUsers(), u=getLogged(); if(!u) return; const p=users[u].projects.find(x=>x.id===activeProjectId); const snap = p ? (p.html||buildHtmlFromBlocks()) : buildHtmlFromBlocks(); codeTextarea.value = snap; updateLineNumbers(); } });
btnCloseCode.addEventListener('click', ()=> codeEditor.classList.add('hidden'));
codeTextarea.addEventListener('input', ()=> updateLineNumbers());
function updateLineNumbers(){ const lines = codeTextarea.value.split('\n').length; document.getElementById('code-line-numbers').innerHTML = Array.from({length:lines}).map((_,i)=>'<div>'+(i+1)+'</div>').join(''); }
btnApplyCode.addEventListener('click', ()=>{ if(!confirm('Mevcut bloklar silinip raw HTML bloğu oluşturulsun mu?')) return; const users=readUsers(), u=getLogged(); if(!u) return; const p=users[u].projects.find(x=>x.id===activeProjectId); if(!p) return; p.blocks = [{ id:'b_'+Date.now(), type:'raw', text: codeTextarea.value, x:20, y:20, w:360, h:200, children:[] }]; p.html = codeTextarea.value; writeUsers(users); renderWorkspaceFromProject(); renderPreview(); codeEditor.classList.add('hidden'); alert('uygulandı'); });

// render workspace
function renderWorkspaceFromProject(){ workspace.innerHTML=''; const users=readUsers(), u=getLogged(); if(!u) return; const p=users[u].projects.find(x=>x.id===activeProjectId); if(!p) return; p.blocks.forEach(b=> renderBlockFromData(b)); renderPreview(); }

function renderBlockFromData(b){ const el=document.createElement('div'); el.className='block'; el.style.left=(b.x||20)+'px'; el.style.top=(b.y||20)+'px'; el.style.width=(b.w||260)+'px'; el.style.height=(b.h||60)+'px'; el.dataset.id=b.id; el.innerHTML = `<div class="label">${b.type}</div><div class="content">${escapeHtml(b.text)}</div><div class="actions"><button class="edit">✎</button><button class="remove">Sil</button></div>`; workspace.appendChild(el); makeDraggable(el); el.querySelector('.edit').addEventListener('click', ()=>{ const nv=prompt('Yeni içerik', b.text||''); if(nv===null) return; b.text=nv; el.querySelector('.content').textContent=nv; updateBlockData(b); renderPreview(); }); el.querySelector('.remove').addEventListener('click', ()=>{ if(!confirm('sil?')) return; el.remove(); removeBlockData(b.id); renderPreview(); }); }

// simple profile & pages
btnProfile.addEventListener('click', ()=> openProfile(getLogged()));
function openProfile(username){ const users=readUsers(), u=username||getLogged(); if(!u||!users[u]) return alert('kullanıcı yok'); profilePage.classList.remove('hidden'); studio.classList.add('hidden'); landing.classList.add('hidden'); document.getElementById('profile-username').textContent = u; document.getElementById('profile-meta').innerHTML = `<p>Kayıt: ${users[u].createdAt}</p><p>Projeler: ${users[u].projects.length}</p>`; const pdiv=document.getElementById('profile-projects'); pdiv.innerHTML=''; users[u].projects.filter(x=>x.public).forEach(pr=>{ const d=document.createElement('div'); d.className='proj'; d.innerHTML = `<strong>${pr.name}</strong><small> by ${u}</small>`; d.addEventListener('click', ()=> showProjectPreview({id:pr.id,author:u,name:pr.name,html:pr.html||buildHtmlFromBlocks()})); pdiv.appendChild(d); }); const sdiv=document.getElementById('profile-studios'); sdiv.innerHTML=''; users[u].studios.forEach(st=>{ const d=document.createElement('div'); d.className='proj'; d.textContent=st.name; sdiv.appendChild(d); }); }
profileBack.addEventListener('click', ()=>{ profilePage.classList.add('hidden'); enterStudio(); });

// modal helpers
function showModal(html){ modal.innerHTML = '<div class="card">'+html+'<div style="text-align:right;margin-top:8px"><button id="modal-close">Kapat</button></div></div>'; modal.classList.remove('hidden'); document.getElementById('modal-close').addEventListener('click', closeModal); }
function closeModal(){ modal.classList.add('hidden'); modal.innerHTML=''; }

// helper escape
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// initial seeding demo
(function seed(){
  const users = readUsers(); if(Object.keys(users).length===0){ users['demo'] = { password:'demo', createdAt: now(), projects: [ makeProject('Demo Project') ], studios: [] }; users['demo'].projects[0].blocks = [{id:'b1',type:'h1',text:'Merhaba Codebit',x:20,y:20,children:[]},{id:'b2',type:'p',text:'Demo paragraf',x:20,y:100,children:[] }]; writeUsers(users); }
})();

function makeProject(name){ return { id:'p_'+Date.now()+'_'+Math.floor(Math.random()*9999), name, created:now(), updated:now(), blocks:[], studioId:null, public:false, html:'' }; }

// renderRecent and top actions on load
document.addEventListener('DOMContentLoaded', ()=>{ renderRecent(); if(getLogged()) enterStudio(); else showLanding(); });
// small helper functions used earlier
function renderRecent(){ const list=readPublic(); recentProjectsEl.innerHTML=''; list.slice().reverse().forEach(p=>{ const el=document.createElement('div'); el.className='item'; el.innerHTML=`<strong>${p.name}</strong><small> by ${p.author}</small>`; el.addEventListener('click', ()=> showProjectPreview(p)); recentProjectsEl.appendChild(el); }); }
function renderUserProjects(){ projectsListEl.innerHTML=''; const users=readUsers(), u=getLogged(); if(!u||!users[u]) return; users[u].projects.forEach(p=>{ const el=document.createElement('div'); el.className='proj'; el.textContent=p.name; el.dataset.id=p.id; el.addEventListener('click', ()=> selectProject(p.id)); projectsListEl.appendChild(el); }); renderTopActions(); }
