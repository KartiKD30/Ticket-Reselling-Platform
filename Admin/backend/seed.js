require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const connectDB = require('./db/connect');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});

    console.log('Seeding Data...');

    // 1. Create Super Admin
    const admin = new User({
        name: 'Super Admin',
        email: 'admin@smartticket.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'Admin'
    });
    await admin.save();
    console.log('Admin account created: admin@smartticket.com / admin123');

    // 2. Create Sample Users & Organizers
    const user1 = new User({
        name: 'John Organizer',
        email: 'organizer@example.com',
        password: 'password123',
        role: 'Organizer'
    });
    await user1.save();

    const user2 = new User({
        name: 'Jane Customer',
        email: 'user@example.com',
        password: 'password123',
        role: 'User'
    });
    await user2.save();

    // 3. Create Sample Events
    const events = [
        {
            title: 'Tomorrowland Music Festival',
            description: 'The biggest EDM festival in the world.',
            date: new Date('2026-07-20'),
            venue: 'Belgium Grand Arena',
            category: 'Music',
            price: 299,
            totalSeats: 50000,
            availableSeats: 45000,
            organizer: user1._id,
            status: 'Active'
        },
        {
            title: 'FIFA World Cup Final',
            description: 'The ultimate football showdown.',
            date: new Date('2026-08-15'),
            venue: 'Lusail Stadium, Qatar',
            category: 'Sports',
            price: 500,
            totalSeats: 80000,
            availableSeats: 2000,
            organizer: user1._id,
            status: 'Active'
        },
        {
            title: 'Coldplay: Music of the Spheres',
            description: 'Experience the magic of Coldplay live.',
            date: new Date('2026-12-10'),
            venue: 'Wembley Stadium, London',
            category: 'Concert',
            price: 150,
            totalSeats: 90000,
            availableSeats: 5000,
            organizer: user1._id,
            status: 'Active'
        }
    ];

    await Event.insertMany(events);
    console.log('Sample Events Seeded!');

    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
};

seedData();
