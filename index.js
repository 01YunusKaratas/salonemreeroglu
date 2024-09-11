const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const sqlite3 = require('better-sqlite3');

const app = express();
const port = 3000;

// Multer middleware ile form verilerini işlemek için
const upload = multer(); // Bu ayar, `multipart/form-data` formatında veri almak için kullanılır

// Statik dosyaları sunmak için public klasörünü kullan
app.use(express.static('public'));

// Veritabanı bağlantısı ve tablo oluşturma
const db = sqlite3('appointments.db');

// Tabloyu oluştur
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    UNIQUE(date, time)
  )
`);

// E-posta ayarları
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yunuskaratas589@gmail.com',
    pass: 'zheb pefv ufiv udcm' // Şifreyi güvende tutmak için bir çevresel değişken kullanın
  }
});

// Randevu alma rotası
app.post('/appointment', upload.none(), (req, res) => {
  const { name, email, phone, date, time } = req.body;

  // Konsolda verileri kontrol et
  console.log(`Received data: Name: ${name}, Email: ${email}, Phone: ${phone}, Date: ${date}, Time: ${time}`);

  // Randevu zamanını kontrol et
  const stmt = db.prepare('SELECT COUNT(*) AS count FROM appointments WHERE date = ? AND time = ?');
  const { count } = stmt.get(date, time);

  if (count > 0) {
    return res.status(400).json({ success: false, message: 'Seçtiğiniz tarih ve saat dolu.' });
  }
  

  // Randevuyu ekle
  const insert = db.prepare('INSERT INTO appointments (name, email, phone, date, time) VALUES (?, ?, ?, ?, ?)');
  insert.run(name, email, phone, date, time);

  const mailOptions = {
    from: 'yunuskaratas589@gmail.com',
    to: 'yunuskaratas589@gmail.com', // İşyerinin e-posta adresi
    subject: 'Yeni Randevu Talebi',
    text: `Ad: ${name}\nE-posta: ${email}\nTelefon: ${phone}\nTarih: ${date}\nSaat: ${time}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('E-posta gönderimi sırasında bir hata oluştu:', error);
      return res.status(500).json({ success: false, message: 'E-posta gönderimi başarısız.' });
    }
    res.status(200).json({ success: true, message: 'Randevu başarıyla alındı ve e-posta gönderildi.' });
  });
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
