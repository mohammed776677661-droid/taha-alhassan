const grid=document.querySelector('#coursesGrid'); const search=document.querySelector('#search');
document.querySelector('#year').textContent=new Date().getFullYear();
let data=[];
async function load(){const r=await fetch('/api/courses'); data=await r.json(); render(data)}
function render(items){grid.innerHTML=items.map(c=>`<article class="card"><h3>${esc(c.title)}</h3><p>${esc(c.description||'')}</p>
<div>${c.lectures.map(l=>`<div class="lecture"><b>${esc(l.title)}</b><p>${esc(l.description||'')}</p>
${l.video_path?`<video controls preload="metadata" src="${l.video_path}"></video>`:''}
${l.file_path?`<a class="btn" href="${l.file_path}" target="_blank">فتح الملف المرفق</a>`:''}</div>`).join('')}</div></article>`).join('')||'<p>لا توجد دورات مضافة بعد.</p>'}
search.addEventListener('input',()=>{const q=search.value.toLowerCase();render(data.map(c=>({...c,lectures:c.lectures.filter(l=>(c.title+' '+c.description+' '+l.title+' '+l.description).toLowerCase().includes(q))})).filter(c=>c.title.toLowerCase().includes(q)||c.lectures.length)});
function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
load();