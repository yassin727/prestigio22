const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testAccounts = [
  {
    username: 'testuser',
    name: 'Test User',
    email: 'testuser@prestigio.com',
    phone: '01012345678',
    address: '123 Test Street',
    city: 'Cairo',
    age: 25,
    password: 'Test@123',
    role: 'user'
  },
  {
    username: 'admin',
    name: 'Admin User',
    email: 'admin@prestigio.com',
    phone: '01098765432',
    address: '456 Admin Avenue',
    city: 'Cairo',
    age: 30,
    password: 'Admin@123',
    role: 'admin'
  }
];

async function createTestAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if accounts already exist
    for (const account of testAccounts) {
      const existingUser = await User.findOne({ 
        $or: [
          { username: account.username },
          { email: account.email }
        ]
      });

      if (existingUser) {
        console.log(`Account ${account.username} already exists`);
        continue;
      }

      // Create new account
      const user = new User(account);
      await user.save();
      console.log(`Created ${account.role} account: ${account.username}`);
    }

    console.log('\nTest accounts created successfully!');
    console.log('\nRegular User Account:');
    console.log('Username: testuser');
    console.log('Password: Test@123');
    console.log('\nAdmin Account:');
    console.log('Username: admin');
    console.log('Password: Admin@123');

  } catch (error) {
    console.error('Error creating test accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestAccounts(); 