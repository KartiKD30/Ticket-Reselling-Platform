const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect('mongodb://127.0.0.1:27017/organizerdb', {})
.then(async () => {
    console.log("Connected. Dropping old events...");
    await Event.deleteMany({});
    
    console.log("Creating 6 new events with fresh schema...");

    await Event.insertMany([
        {
            title: 'Tech Innovators Summit', 
            description: 'Annual tech conference for innovators.',
            date: new Date('2026-05-20T09:00:00Z'),
            time: '09:00',
            venue: 'Grand Convention Center',
            price: 150,
            category: 'Technology',
            images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80"],
            createdBy: 'organizer_123',
            totalTickets: 1000,
            availableTickets: 1000,
            source: 'organizer',
            status: 'upcoming'
        },
        {
            title: 'Standup Comedy Night', 
            description: 'A night full of laughs and drinks.',
            date: new Date('2026-04-10T20:00:00Z'),
            time: '20:00',
            venue: 'Laugh Factory',
            price: 50,
            category: 'Entertainment',
            images: ["https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1000&auto=format&fit=crop&q=80"],
            createdBy: 'organizer_123',
            totalTickets: 300,
            availableTickets: 300,
            source: 'organizer',
            status: 'completed'
        },
        {
            title: 'Neon Nights Music Fest', 
            description: 'Biggest EDM festival in town.',
            date: new Date('2026-06-15T18:00:00Z'),
            time: '18:00',
            venue: 'Central Park',
            price: 80,
            category: 'Music',
            images: ["https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=1000&auto=format&fit=crop&q=80"],
            createdBy: 'organizer_123',
            totalTickets: 5000,
            availableTickets: 5000,
            source: 'organizer',
            status: 'upcoming'
        },
        {
            title: 'Global Business Expo', 
            description: 'Connect with industry leaders across the globe.',
            date: new Date('2026-08-12T10:00:00Z'),
            time: '10:00',
            venue: 'Metro Expo Center',
            price: 250,
            category: 'Business',
            images: ["https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&auto=format&fit=crop&q=80"],
            createdBy: 'organizer_123',
            totalTickets: 2000,
            availableTickets: 2000,
            source: 'organizer',
            status: 'upcoming'
        },
        {
            title: 'Art & Wine Festival', 
            description: 'Explore local art galleries while sipping fine wine.',
            date: new Date('2026-09-05T14:00:00Z'),
            time: '14:00',
            venue: 'Downtown Square',
            price: 30,
            category: 'Arts',
            images: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1000&auto=format&fit=crop&q=80"],
            createdBy: 'organizer_123',
            totalTickets: 800,
            availableTickets: 800,
            source: 'organizer',
            status: 'upcoming'
        },
        {
            title: 'Marathon City Run', 
            description: 'Annual 10K running marathon across the city.',
            date: new Date('2026-11-01T06:00:00Z'),
            time: '06:00',
            venue: 'Starting line: City Hall',
            price: 45,
            category: 'Sports',
            images: ["https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1000&auto=format&fit=crop&q=80"],
            createdBy: 'organizer_123',
            totalTickets: 500,
            availableTickets: 500,
            source: 'organizer',
            status: 'upcoming'
        }
    ]);

    console.log("Migration complete.");
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
