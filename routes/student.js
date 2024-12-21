const express = require('express');
const multer = require('multer');
const Student = require('../models/Student');
const Counter = require('../models/Counter');
const router = express.Router();
const path = require('path');
const cloudinary = require('../cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const transporter = require('../emailConfig');

// Multer configuration with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    format: async (req, file) => 'jpg', // supports promises as well
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

// Render the form
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Handle form submission
router.post(
  '/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { body, files } = req;

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Send OTP via Email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: body.email, // Ensure this matches the form field name
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Email sent: ' + info.response);
      });

      // Store OTP and registration data in session
      req.session.otp = otp;
      req.session.body = body;
      req.session.files = files;

      res.sendFile(path.join(__dirname, '../views/otp.html'));
    } catch (err) {
      console.error(err);
      res.status(500).send('Error sending OTP');
    }
  }
);

// Handle OTP verification
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    console.log('Received OTP:', otp);
    console.log('Session OTP:', req.session.otp);

    if (otp === req.session.otp) {
      const { body, files } = req.session;
      console.log('Session Body:', body);
      console.log('Session Files:', files);

      // Get the next sequence number
      const counter = await Counter.findOneAndUpdate(
        { name: 'student' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      console.log('Counter:', counter);

      // Create student record
      const student = new Student({
        ...body,
        registrationNumber: `XXXX${String(counter.seq).padStart(2, '0')}`,
        photo: files.photo?.[0]?.path || null,
        signature: files.signature?.[0]?.path || null,
        documents: files.documents?.map((file) => file.path) || [],
      });
      console.log('Student:', student);

      await student.save();

      // Send registration confirmation email
      const emailBody = `
        <html>
        <body>
          <h1>Registration Successful!</h1>
          <p><strong>Name:</strong> ${body.fullName}</p>
          <p><strong>Father's Name:</strong> ${body.fatherName}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Address:</strong> ${body.address}, ${body.city}, ${body.state}</p>
          <p><strong>Phone:</strong> ${body.phoneNumber}</p>
          <p><strong>WhatsApp:</strong> ${body.whatsapp}</p>
          <p><strong>Guardian Phone:</strong> ${body.guardianPhone}</p>
          <p><strong>High School:</strong> ${body.highschool}</p>
          <p><strong>Intermediate:</strong> ${body.inter}</p>
          <p><strong>Graduation:</strong> ${body.graduation}</p>
          <p><strong>Course Applied:</strong> ${body.course}</p>
          ${body.otherCourse ? `<p><strong>Other Course:</strong> ${body.otherCourse}</p>` : ''}
          <p><strong>Gender:</strong> ${body.gender}</p>
          <p><strong>Registration Number:</strong> ${student.registrationNumber}</p>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: body.email,
        subject: 'Registration Confirmation',
        html: emailBody,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Email sent: ' + info.response);
      });

      // Store user data in localStorage and render success page
      res.send(`
        <script>
          localStorage.setItem('userData', JSON.stringify(${JSON.stringify({
            ...body,
            registrationNumber: student.registrationNumber,
            photo: student.photo,
            signature: student.signature,
            documents: student.documents,
          })}));
          window.location.href = '/student/success';
        </script>
      `);
    } else {
      res.status(400).send('Invalid OTP');
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).send('Error verifying OTP');
  }
});

router.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/success.html'));
});

module.exports = router;