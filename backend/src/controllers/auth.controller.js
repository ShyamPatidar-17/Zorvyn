import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; 

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    if (user.status === 'inactive') {
      return res.status(403).json({ 
        message: "Your account has been deactivated. Please contact administration." 
      });
    }

  
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

   
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName,  
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const register = async (req, res) => {
  try {
  
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName, 
      lastName,
      email,
      password: hashedPassword,
      role: role || 'Viewer' 
    });

    res.status(201).json({ 
      id: user._id, 
      firstName: user.firstName, 
      email: user.email 
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};