
import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;
        let query = {};

    if (role === 'Admin' || role === 'Analyst' ) {
      query = {}; 
    } else {
      query = { _id: userId };
    }

    const users = await User.find(query).select('-password').sort({ firstName: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Access Denied", error: error.message });
  }
};


export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userToUpdate = await User.findById(id);

    if (!userToUpdate) return res.status(404).json({ message: "User not found" });

   
    if (userToUpdate._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }


    userToUpdate.status = userToUpdate.status === 'active' ? 'inactive' : 'active';
    await userToUpdate.save();

    res.json({ 
      message: `User ${userToUpdate.firstName} is now ${userToUpdate.status}`, 
      status: userToUpdate.status 
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};