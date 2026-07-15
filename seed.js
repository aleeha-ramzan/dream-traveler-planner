// seed.js — Run this file once to create demo accounts + sample destinations.
// Usage: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Destination = require('./models/Destination');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dreamTravelerPlanner';

const sampleDestinations = [
  { name: 'Santorini', country: 'Greece', description: 'White-washed houses, blue domes, and sunsets over the caldera.', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', estimatedBudget: 2500, priority: 'High', status: 'Planned', targetDate: '2026-08-05', notes: 'Best visited in September to avoid peak crowds.' },
  { name: 'Kyoto', country: 'Japan', description: 'Ancient temples, cherry blossoms, and traditional tea houses.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', estimatedBudget: 3200, priority: 'High', status: 'Booked', targetDate: '2026-07-25', notes: 'Flights already booked. Need to arrange ryokan stay.' },
  { name: 'Reykjavik', country: 'Iceland', description: 'Northern lights, geothermal spas, and dramatic waterfalls.', image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800', estimatedBudget: 2800, priority: 'Medium', status: 'Planned', targetDate: '2026-12-10', notes: 'Winter trip for the northern lights.' },
  { name: 'Hunza Valley', country: 'Pakistan', description: 'Snow-capped peaks, apricot orchards, and turquoise rivers.', image: 'https://images.unsplash.com/photo-1626621341169-a26d7e910364?w=800', estimatedBudget: 800, priority: 'High', status: 'Visited', targetDate: '2025-06-01', notes: 'Already visited last summer — unforgettable!' },
  { name: 'Machu Picchu', country: 'Peru', description: 'Ancient Incan citadel high in the Andes mountains.', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', estimatedBudget: 2200, priority: 'Medium', status: 'Planned', targetDate: '2027-04-05', notes: 'Need to book Inca Trail permits months in advance.' },
  { name: 'Bali', country: 'Indonesia', description: 'Tropical beaches, rice terraces, and vibrant temples.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', estimatedBudget: 1500, priority: 'Low', status: 'Planned', targetDate: '2026-11-20', notes: 'Good for a relaxed budget trip.' }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Destination.deleteMany({});
    console.log('🧹 Cleared existing users & destinations');

    // Create demo accounts (passwords are hashed automatically by the User model)
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@dream.com',
      password: 'Admin@123',
      role: 'admin'
    });

    const demoUser = await User.create({
      name: 'Chichi',
      email: 'user@dream.com',
      password: 'User@123',
      role: 'user'
    });

    console.log('👤 Created admin account   -> admin@dream.com / Admin@123');
    console.log('👤 Created demo user account -> user@dream.com / User@123');

    const destinationsWithOwner = sampleDestinations.map(d => ({ ...d, owner: demoUser._id }));
    const inserted = await Destination.insertMany(destinationsWithOwner);
    console.log(`🌍 Inserted ${inserted.length} sample dream destinations for the demo user`);

    await mongoose.disconnect();
    console.log('✅ Done. Go to http://localhost:5000/login.html and log in with either account.');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
