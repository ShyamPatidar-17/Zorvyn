import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { 
    type: String, 
    enum: ['Viewer', 'Analyst', 'Admin'], 
    default: 'Viewer' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  lastLogin: { type: Date }
}, { timestamps: true });


UserSchema.index({ email: 1 });

const User = mongoose.model('User', UserSchema);

export default User