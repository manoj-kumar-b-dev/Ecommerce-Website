import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

/**
 * Create an admin user in the database
 * Usage: node utils/createAdminUser.js <name> <email> <password>
 */
const createAdminUser = async (name, email, password) => {
  try {
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ Admin user with email ${email} already exists`);
      process.exit(1);
    }

    // Create new admin user
    const adminUser = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log(`
Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:  ${adminUser.email}
Name:   ${adminUser.name}
Role:   ${adminUser.role}
ID:     ${adminUser._id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Get arguments from command line
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.log(`
Usage: node utils/createAdminUser.js <name> <email> <password>

Example:
  node utils/createAdminUser.js "Admin User" "admin@example.com" "password123"
  `);
  process.exit(1);
}

const [name, email, password] = args;
createAdminUser(name, email, password);
