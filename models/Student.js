const mongoose = require('mongoose');

// Define the Student schema
const studentSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Fname: { type: String, required: true },
    Email: { type: String, required: true },
    Address: { type: String, required: true },
    City: { type: String, required: true },
    State: { type: String, required: true },
    Phone: { type: String, required: true },
    Whatsapp: { type: String, required: true },
    GuardianPhone: { type: String },
    highschool: { type: String, required: true },
    inter: { type: String, required: true },
    Graduation: { type: String, required: true },
    Course: { type: String, required: true },
    OtherCourse: { type: String },
    Gender: { type: String, required: true },
    registrationNumber: { type: String },
    photo: { type: String },           // Path to the uploaded photo
    signature: { type: String },       // Path to the uploaded signature
    documents: [String],               // Array of paths to uploaded documents
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Export the Student model
module.exports = mongoose.model('Student', studentSchema);
