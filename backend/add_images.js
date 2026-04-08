const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect('mongodb://127.0.0.1:27017/organizerdb', {
})
    .then(async () => {
        console.log("Connected to MongoDB.");
        const events = await Event.find();
        console.log(`Found ${events.length} events to update.`);
        const images = [
            "https://picsum.photos/seed/techsummit/1000/600",
            "https://picsum.photos/seed/comedyclub/1000/600",
            "https://picsum.photos/seed/musicfest/1000/600",
            "https://picsum.photos/seed/party/1000/600"
        ];

        for (const event of events) {
            let imageUrl = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"; // default event image
            const nameLabel = event.name.toLowerCase();

            if (nameLabel.includes('tech') || nameLabel.includes('summit')) {
                // Tech Event / Conference
                imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80";
            } else if (nameLabel.includes('comedy') || nameLabel.includes('laugh')) {
                // Microphone / Comedy
                imageUrl = "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1000&auto=format&fit=crop&q=80";
            } else if (nameLabel.includes('music') || nameLabel.includes('fest')) {
                // Concert / Music Festival
                imageUrl = "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=1000&auto=format&fit=crop&q=80";
            }

            event.imageUrl = imageUrl;
            await event.save();
            console.log(`Updated ${event.name} with contextual image.`);
        }

        console.log("Finished updating events.");
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
