const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const COLLECTION = require('../config/collection');

module.exports = {
    addAnnouncement: (announcementData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const announcement = {
                    title: announcementData.title,
                    date: announcementData.date,
                    description: announcementData.description,
                };

                const announcementCollection = await db.get().collection(COLLECTION.ANNOUNCEMNT_COLLECTION);
                const result = await announcementCollection.insertOne(announcement);
                resolve(result.insertedId);
            } catch (error) {
                reject(error);
            }
        });
    },
    getAllAnnouncements: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const announcementCollection = await db.get().collection(COLLECTION.ANNOUNCEMNT_COLLECTION);
                
                // Sort the announcements based on the 'date' property in descending order
                const announcements = await announcementCollection.find().sort({ date: -1 }).toArray();
                
                resolve(announcements);
            } catch (error) {
                reject(error);
            }
        });
    },
    removeAnnouncement: (announcementId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const announcementCollection = await db.get().collection(COLLECTION.ANNOUNCEMNT_COLLECTION);
                await announcementCollection.deleteOne({ _id:new ObjectId(announcementId) });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
};
