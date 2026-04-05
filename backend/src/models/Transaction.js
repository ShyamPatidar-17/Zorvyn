import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, "User reference is required"],
    index: true 
  },
  amount: { 
    type: Number, 
    required: [true, "Amount is required"],
    min: [0, 'Amount cannot be negative']
  },
  type: { 
    type: String, 
    enum: {
      values: ['income', 'expense'],
      message: '{VALUE} is not a valid transaction type'
    },
    required: true 
  },
  category: { 
    type: String, 
    required: [true, "Category is required"],
    trim: true,
    index: true 
  },
  date: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [500, "Description is too long"] 
  },
  metadata: {
    isRecurring: { type: Boolean, default: false },
    tags: [String]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

TransactionSchema.virtual('signedAmount').get(function() {
  return this.type === 'expense' ? -this.amount : this.amount;
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;