const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  fatherName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  whatsapp: { type: String, },
  guardianPhone: { type: String, },
  highschool: { type: String, required: true },
  inter: { type: String, required: true },
  graduation: { type: String, required: true },
  course: { type: String, required: true },
  gender: { type: String, required: true },
  otherCourse: { type: String },
  registrationNumber: { type: String, required: true },
  photo: { type: String },
  signature: { type: String },
  documents: { type: [String] }
});

module.exports = mongoose.model('Student', studentSchema);