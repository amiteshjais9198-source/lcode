const mongoose = require('mongoose');
require('dotenv').config();

async function fixDb() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("Connected to MongoDB.");
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        try {
            await usersCollection.dropIndex('problemSolved_1');
            console.log("Successfully dropped problemSolved_1 index.");
        } catch (e) {
            console.log("Index problemSolved_1 might not exist or already dropped:", e.message);
        }
        
    } catch (error) {
        console.error("Connection error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

fixDb();
