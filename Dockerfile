# استخدام نسخة خفيفة من Node.js
FROM node:18-alpine

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات تعريف المكتبات أولاً
COPY package*.json ./

# تثبيت المكتبات (بدون مكتبات التطوير لتسريع العملية)
RUN npm install --production

# نسخ باقي ملفات الكود
COPY . .

# المنفذ الافتراضي لـ Cloud Run هو 8080
EXPOSE 8080

# أمر تشغيل الموقع
CMD [ "npm", "start" ]