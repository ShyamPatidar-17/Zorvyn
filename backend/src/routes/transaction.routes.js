// routes/transaction.routes.js
import express from 'express';
import { getTransactions,  createTransaction,  updateTransaction,  deleteTransaction ,getTransactionsByUser
} from '../controllers/transaction.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get( '/',  protect, authorize('Analyst', 'Admin','Viewer'), getTransactions);

router.get('/user/:userId', protect, authorize('Admin', 'Analyst'), getTransactionsByUser);


router.post( '/',  protect,  authorize('Admin'),  createTransaction);
router.put('/:id', protect, authorize('Admin'), updateTransaction);
router.delete('/:id', protect, authorize('Admin'), deleteTransaction);

export default router;