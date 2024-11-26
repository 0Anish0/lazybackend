// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  first_name: {type: String, required: true,},
  last_name: {type: String, required: true, },
  mobile: { type: String, required: true,unique: true,},
  password: { type: String, required: true,},
  gender: { type: String,enum: ['male', 'female', 'other'],required: true,},
  country: {type: String, required: true,},
  state: {type: String, required: true,},
  city: {type: String,required: true,},
  live_image: {type: String,required: true,},
  role: { type: String,enum: ['user', 'admin', 'partner'], default: 'user',},
  isDeleted: { type: Boolean,default: false,}
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
