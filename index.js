require('dotenv').config(); // لقراءة المتغيرات محلياً إذا أردت
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();

// إعداد الجلسة (Session)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key_change_me',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// إعداد استراتيجية الدخول عبر جوجل (يوتيوب)
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,         // نقرأ من المتغيرات
    clientSecret: process.env.CLIENT_SECRET, // نقرأ من المتغيرات
    callbackURL: process.env.CALLBACK_URL,   // رابط العودة بعد الدخول
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] // صلاحيات يوتيوب
  },
  function(accessToken, refreshToken, profile, cb) {
    // هنا يمكن حفظ المستخدم في قاعدة البيانات، للتبسيط سنمرر البروفايل مباشرة
    return cb(null, profile);
  }
));

// حفظ واسترجاع بيانات المستخدم في الجلسة
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// --- المسارات (Routes) ---

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send('<h1>مرحباً بك في تطبيق يوتيوب</h1><a href="/auth/google">تسجيل الدخول عبر Google</a>');
});

// بدء عملية تسجيل الدخول
app.get('/auth/google', passport.authenticate('google'));

// استقبال الرد من جوجل بعد الدخول
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// صفحة البروفايل (محمية)
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  // عرض بيانات المستخدم كـ JSON بشكل مبسط
  res.send(`
    <h1>تم تسجيل الدخول بنجاح!</h1>
    <h3>مرحباً: ${req.user.displayName}</h3>
    <p>معرف القناة/المستخدم: ${req.user.id}</p>
    <img src="${req.user.photos[0].value}" alt="Profile Pic" />
    <hr>
    <pre>${JSON.stringify(req.user, null, 2)}</pre>
    <br>
    <a href="/logout">تسجيل الخروج</a>
  `);
});

// تسجيل الخروج
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// تشغيل الخادم (Cloud Run يفرض المنفذ عبر process.env.PORT)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});