# منصة الأستاذ طه الحسن — Render Fixed 2.0.1

هذه نسخة مصححة خصيصًا للنشر على Render.

## ما تم إصلاحه
- تثبيت Node.js على 22.22.0 عبر `.node-version` و`package.json`.
- تحديث `better-sqlite3` إلى 12.10.1 لتوافق أفضل مع إصدارات Node الحديثة.
- إضافة إعدادات جلسة مناسبة خلف HTTPS/Proxy.
- إضافة `/health` لفحص الخدمة.
- إضافة إغلاق آمن لقاعدة SQLite عند إيقاف الخدمة.

## التشغيل المحلي
```bash
npm install
npm start
```

## حساب الإدارة
البريد: `admin@taha-platform.local`
كلمة المرور: `ChangeMe123!`

## النشر على Render
Build Command:
`npm install`

Start Command:
`npm start`

بعد رفع الملفات إلى GitHub، استخدم Render > Manual Deploy > Deploy latest commit.

ملاحظة: SQLite وملفات uploads على Render تحتاج Persistent Disk إذا أردت الاحتفاظ بها بعد إعادة التشغيل/إعادة النشر. هذه النسخة تصلح لإصلاح مشكلة التشغيل الحالية، أما الإطلاق العالمي فيحتاج قاعدة بيانات وتخزين ملفات سحابيًا.
