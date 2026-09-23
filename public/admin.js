const $=s=>document.querySelector(s);
async function api(url,opt={}){const r=await fetch(url,opt);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'حدث خطأ');return d}
async function init(){try{await api('/api/me');showDash()}catch{}} 
function showDash(){$('#loginBox').hidden=true;$('#dashboard').hidden=false;loadAdmin()}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('#email').value,password:$('#password').value})});showDash()}catch(x){$('#loginMsg').textContent=x.message}})
$('#logout').onclick=async()=>{await api('/api/logout',{method:'POST'});location.reload()};
$('#courseForm').onsubmit=async e=>{e.preventDefault();try{await api('/api/courses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:$('#courseTitle').value,description:$('#courseDesc').value})});e.target.reset();loadAdmin()}catch(x){alert(x.message)}};
$('#lectureForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);try{await api('/api/lectures',{method:'POST',body:fd});e.target.reset();$('#uploadMsg').textContent='تم رفع المحاضرة بنجاح';loadAdmin()}catch(x){$('#uploadMsg').textContent=x.message}};
async function loadAdmin(){const d=await api('/api/admin/data');$('#stats').innerHTML=`<div class="stat"><span>الدورات</span><strong>${d.stats.courses}</strong></div><div class="stat"><span>المحاضرات</span><strong>${d.stats.lectures}</strong></div><div class="stat"><span>الطلاب</span><strong>${d.stats.students}</strong></div>`;
$('#courseId').innerHTML=d.courses.map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join('');
$('#adminCourses').innerHTML=d.courses.map(c=>`<div class="lecture"><b>${esc(c.title)}</b> — ${c.lectures.length} محاضرة</div>`).join('')||'<p>لا توجد دورات.</p>'}
function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]) )}
init();