import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Transaction from './src/models/Transaction.js';

dotenv.config();
const seedDatabase = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance_db';
    await mongoose.connect(connString);
    console.log("Connected to MongoDB for Seeding...");

   
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log("Database cleared.");

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const usersToInsert = [];

    usersToInsert.push({
      firstName: 'Shyam',
      lastName: 'Patidar',
      email: 'admin@finance.com',
      password: hashedPassword,
      role: 'Admin',
      status: 'active'
    });

   
    for (let i = 1; i <= 9; i++) {
      usersToInsert.push({
        firstName: `Analyst`,
        lastName: `${i}`,
        email: `analyst${i}@finance.com`,
        password: hashedPassword,
        role: 'Analyst',
        status: 'active'
      });
    }

 
    for (let i = 1; i <= 40; i++) {
      usersToInsert.push({
        firstName: `Viewer`,
        lastName: `${i}`,
        email: `viewer${i}@finance.com`,
        password: hashedPassword,
        role: 'Viewer',
        status: 'active'
      });
    }

    const createdUsers = await User.insertMany(usersToInsert);
    console.log(`✅ Created ${createdUsers.length} Users.`);

   
    const categories = [
      { name: 'Salary', type: 'income', min: 4500, max: 6000 },
      { name: 'Freelance', type: 'income', min: 300, max: 1200 },
      { name: 'Rent', type: 'expense', min: 1000, max: 1800 },
      { name: 'Grocery', type: 'expense', min: 50, max: 250 },
      { name: 'Entertainment', type: 'expense', min: 30, max: 200 },
      { name: 'Utilities', type: 'expense', min: 70, max: 150 }
    ];

    let transactionsToInsert = [];

    createdUsers.forEach(user => {
      const txCount = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < txCount; i++) {
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const randomAmount = Math.floor(Math.random() * (randomCat.max - randomCat.min + 1) + randomCat.min);
        
        transactionsToInsert.push({
          userId: user._id,
          amount: randomAmount,
          type: randomCat.type,
          category: randomCat.name,
          description: `Seeded ${randomCat.name} for ${user.firstName}`,
      
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          metadata: {
            tags: ['automated-seed', user.role]
          }
        });
      }
    });

    const result = await Transaction.insertMany(transactionsToInsert);
    console.log(`✅ Seeded ${result.length} Transactions.`);
    
    console.log("--- Seeding Completed Successfully ---");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();