
import Transaction from '../models/Transaction.js';

export const getTransactions = async (req, res) => {
  try {
    const { type, category, search, startDate, endDate } = req.query;
    const { _id: userId, role } = req.user;

    
    let query = ['Admin', 'Analyst'].includes(role) ? {} : { userId };

  
    if (type) query.type = type;

    
    if (category) query.category = { $regex: category, $options: 'i' };

    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

   
    let records = await Transaction.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });

    
    if (search) {
      const s = search.toLowerCase();
      records = records.filter(r => 
        r.userId?.firstName?.toLowerCase().includes(s) ||
        r.userId?.lastName?.toLowerCase().includes(s) ||
        r.userId?.email?.toLowerCase().includes(s)
      );
    }

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Fetch Failed", error: error.message });
  }
};



export const getTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    
    const transactions = await Transaction.find({ userId: userId })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching user activity" });
  }
};


export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: adminId } = req.user;

   
    const record = await Transaction.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

   
    if (role !== 'Admin' && record.userId.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

   
    const updatedRecord = await Transaction.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: "Update Failed" });
  }
};



export const createTransaction = async (req, res) => {
  try {
    const { role, _id: adminId } = req.user;
    const { userId, ...transactionData } = req.body;

    const targetUserId = (role === 'Admin' && userId) ? userId : adminId;

    const transaction = await Transaction.create({ 
      ...transactionData, 
      userId: targetUserId 
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: "Validation Failed", error: error.message });
  }
};



export const deleteTransaction = async (req, res) => {
  try {
    const record = await Transaction.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete Failed", error: error.message });
  }
};