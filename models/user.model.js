const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
  node_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: [true, 'Node ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['nodal_officer', 'admin', 'faculty', 'student', 'gsp_authority'],
    required: [true, 'Role is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Student specific fields
  parents_name: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  govt_id: {
    type: String,
    trim: true
  },
  govt_id_type: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'Voter ID', 'Driving License', 'Passport'],
    trim: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  payment_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  payment_date: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(12);
    this.password_hash = await bcryptjs.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password_hash);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password_hash;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);