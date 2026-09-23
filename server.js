const express=require('express');
const session=require('express-session');
const bcrypt=require('bcryptjs');
const Database=require('better-sqlite3');
const multer=require('multer');
const path=require('path');
const fs=require('fs');

const app=express();
const PORT=process.env.PORT||3000;
const DATA=path.join(__dirname,'data'); const UP=path.join(__dirname,'uploads');
fs.mkdirSync(DATA,{recursive:true}); fs.mkdirSync(UP,{recursive:true});
const db=new Database(path.join(DATA,'platform.db'));
db.pragma('foreign_keys=ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'student',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS courses(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS lectures(id INTEGER PRIMARY KEY AUTOINCREMENT,course_id INTEGER NOT NULL,title TEXT NOT NULL,description TEXT,video_path TEXT,file_path TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE);
`);
const adminEmail='admin@taha-platform.local';
if(!db.prepare('SELECT id FROM users WHERE email=?').get(adminEmail)){
  db.prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)').run('مدير المنصة',adminEmail,bcrypt.hashSync('ChangeMe123!',10),'admin');
}
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SECRET_SESSION||'change-this-session-secret',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax'}}));
app.use(express.static(path.join(__dirname,'public')));
app.use('/uploads',express.static(UP));

function auth(req,res,next){if(!req.session.user)return res.status(401).json({error:'يجب تسجيل الدخول'});next()}
function admin(req,res,next){if(!req.session.user||req.session.user.role!=='admin')return res.status(403).json({error:'صلاحية المدير مطلوبة'});next()}

const storage=multer.diskStorage({destination:(_,__,cb)=>cb(null,UP),filename:(_,file,cb)=>cb(null,Date.now()+'-'+file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_'))});
const upload=multer({storage,limits:{fileSize:1024*1024*1024}});

app.get('/api/courses',(req,res)=>{
 const courses=db.prepare('SELECT * FROM courses ORDER BY id DESC').all();
 const ls=db.prepare('SELECT * FROM lectures ORDER BY id ASC').all();
 res.json(courses.map(c=>({...c,lectures:ls.filter(l=>l.course_id===c.id)})));
});
app.post('/api/login',(req,res)=>{
 const u=db.prepare('SELECT * FROM users WHERE email=?').get(req.body.email);
 if(!u||!bcrypt.compareSync(req.body.password,u.password))return res.status(401).json({error:'بيانات الدخول غير صحيحة'});
 req.session.user={id:u.id,name:u.name,email:u.email,role:u.role};res.json({user:req.session.user});
});
app.get('/api/me',(req,res)=>{if(!req.session.user)return res.status(401).json({error:'غير مسجل'});res.json(req.session.user)});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.post('/api/courses',admin,(req,res)=>{
 if(!req.body.title?.trim())return res.status(400).json({error:'اسم الدورة مطلوب'});
 const r=db.prepare('INSERT INTO courses(title,description) VALUES(?,?)').run(req.body.title.trim(),req.body.description||'');
 res.json({id:r.lastInsertRowid});
});
app.post('/api/lectures',admin,upload.fields([{name:'video',maxCount:1},{name:'file',maxCount:1}]),(req,res)=>{
 const c=db.prepare('SELECT id FROM courses WHERE id=?').get(req.body.courseId);
 if(!c)return res.status(400).json({error:'الدورة غير موجودة'});
 const video=req.files?.video?.[0]?.filename; const file=req.files?.file?.[0]?.filename;
 const r=db.prepare('INSERT INTO lectures(course_id,title,description,video_path,file_path) VALUES(?,?,?,?,?)')
 .run(req.body.courseId,req.body.title,req.body.description||'',video?'/uploads/'+video:null,file?'/uploads/'+file:null);
 res.json({id:r.lastInsertRowid});
});
app.get('/api/admin/data',admin,(req,res)=>{
 const courses=db.prepare('SELECT * FROM courses ORDER BY id DESC').all();
 const lectures=db.prepare('SELECT * FROM lectures').all();
 const students=db.prepare("SELECT COUNT(*) n FROM users WHERE role='student'").get().n;
 res.json({courses:courses.map(c=>({...c,lectures:lectures.filter(l=>l.course_id===c.id)})),stats:{courses:courses.length,lectures:lectures.length,students}});
});
app.listen(PORT,()=>console.log(`Platform running at http://localhost:${PORT}`));
