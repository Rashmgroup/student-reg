const express = require('express');
const multer = require('multer');
const Student = require('../models/Student');
const router = express.Router();
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Render the form
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Handle form submission
router.post('/', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
]), async (req, res) => {
    try {
        const { body, files } = req;

        // Create student record
        const student = new Student({
            ...body,
            photo: files.photo?.[0]?.filename || null,
            signature: files.signature?.[0]?.filename || null,
            documents: files.documents?.map(file => file.filename) || [],
        });

        await student.save();
        res.send('Registration successful!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering student');
    }
});

module.exports = router;
