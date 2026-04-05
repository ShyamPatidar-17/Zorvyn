import Transaction from '../models/Transaction.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;

    const isGlobalRole = ['Admin', 'Analyst'].includes(role);
    const matchFilter = isGlobalRole ? {} : { userId: userId };

    const summaryData = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          "totals": [
            {
              $group: {
                _id: null,
                totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
              }
            }
          ],
          "categories": [
            { $group: { _id: "$category", amount: { $sum: "$amount" } } },
            { $sort: { amount: -1 } }
          ],
          "recent": [
            { $sort: { date: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users', 
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                amount: 1,
                type: 1,
                category: 1,
                date: 1,
                description: 1,
               
                userDetails: {
                  fullName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                  email: '$user.email',
                  role: '$user.role',
                  id: '$user._id'
                }
              }
            }
          ]
        }
      }
    ]);

    const stats = summaryData[0].totals[0] || { totalIncome: 0, totalExpenses: 0 };

    res.json({
      role: role,
      scope: isGlobalRole ? 'All Customers' : 'Personal Account',
      netBalance: stats.totalIncome - stats.totalExpenses,
      income: stats.totalIncome,
      expenses: stats.totalExpenses,
      categoryTotals: summaryData[0].categories,
      recentActivity: summaryData[0].recent
    });
  } catch (error) {
    res.status(500).json({ message: "Analytics Error", error: error.message });
  }
};