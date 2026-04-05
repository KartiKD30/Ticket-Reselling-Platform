const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./models/Event');
const Ticket = require('./models/Ticket');
const Booking = require('./models/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/organizerdb';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Clear existing
    await Event.deleteMany({});
    await Ticket.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    const organizerId = 'mock_organizer_1';

    // 1. Create Events
    const events = await Event.insertMany([
      { name: 'Neon Nights Music Fest', date: new Date('2026-06-15T18:00:00Z'), venue: 'Central Park', description: 'Biggest EDM festival in town.', status: 'upcoming', organizerId },
      { name: 'Tech Innovators Summit', date: new Date('2026-05-20T09:00:00Z'), venue: 'Grand Convention Center', description: 'Annual tech conference.', status: 'upcoming', organizerId },
      { name: 'Standup Comedy Night', date: new Date('2026-04-10T20:00:00Z'), venue: 'Laugh Factory', description: 'A night full of laughs.', status: 'completed', organizerId }
    ]);

    console.log('Created events');

    // 2. Create Tickets
    const event1 = events[0];
    const event2 = events[1];

    const tickets = await Ticket.insertMany([
      { eventId: event1._id, category: 'VIP', price: 150, totalQuantity: 100, soldQuantity: 95 },
      { eventId: event1._id, category: 'General', price: 50, totalQuantity: 1000, soldQuantity: 650 },
      { eventId: event2._id, category: 'All Access', price: 300, totalQuantity: 50, soldQuantity: 50 },
      { eventId: event2._id, category: 'Standard', price: 100, totalQuantity: 500, soldQuantity: 200 }
    ]);
    console.log('Created tickets');

    // 3. Create Bookings (Dummy past 7 days data)
    const bookings = [];
    for(let i=0; i<30; i++) {
        // distribute over last 7 days
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 7));
        
        const tick = tickets[Math.floor(Math.random() * tickets.length)];
        const qty = Math.floor(Math.random() * 4) + 1;
        
        bookings.push({
            eventId: tick.eventId,
            ticketId: tick._id,
            userId: 'user_xyz_' + i,
            quantity: qty,
            totalAmount: tick.price * qty,
            purchaseDate: d
        });
    }

    await Booking.insertMany(bookings);
    console.log('Created bookings');

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedData();
