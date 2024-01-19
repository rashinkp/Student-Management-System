const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const COLLECTION = require('../config/collection');

module.exports = {
    insertRequestAnnouncement: (requestDetails) => {
        return new Promise(async (resolve, reject) => {
          try {
            const reqAnnouncementCollection = await db.get().collection(COLLECTION.REQ_ANNOUNCEMENT_COLLECTION);
            const result = await reqAnnouncementCollection.insertOne(requestDetails);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      },
      moveRequestToAnnouncement: async (requestId) => {
        try {
          const reqAnnouncementCollection = await db.get().collection(COLLECTION.REQ_ANNOUNCEMENT_COLLECTION);
          const announcementCollection = await db.get().collection(COLLECTION.ANNOUNCEMENT_COLLECTION);
    
          // Find the request in the req_announcement collection
          const request = await reqAnnouncementCollection.findOne({ _id: ObjectId(requestId) });
    
          // Check if the request exists and if the approval is true
          if (request && request.approval) {
            // Insert the request into the announcement collection
            const result = await announcementCollection.insertOne(request);
    
            // Remove the request from the req_announcement collection
            await reqAnnouncementCollection.deleteOne({ _id: ObjectId(requestId) });
    
            return result;
          } else {
            // Return null if the request doesn't exist or approval is false
            return null;
          }
        } catch (error) {
          throw error;
        }
      },
      getAllRequestsSortedByDate: async () => {
        try {
          const reqAnnouncementCollection = await db.get().collection(COLLECTION.REQ_ANNOUNCEMENT_COLLECTION);
          
          // Fetch requests and sort them by 'date' field in descending order
          const requests = await reqAnnouncementCollection.find().sort({ date: -1 }).toArray();
    
          return requests;
        } catch (error) {
          throw error;
        }
      },
      removeRequest: async (requestId) => {
        try {
          const reqAnnouncementCollection = await db.get().collection(COLLECTION.REQ_ANNOUNCEMENT_COLLECTION);
    
          // Remove the request from the req_announcement collection
          await reqAnnouncementCollection.deleteOne({ _id:new ObjectId(requestId) });
        } catch (error) {
          throw error;
        }
      },
      approveRequest: async (requestId) => {
        try {
          const reqAnnouncementCollection = await db.get().collection(COLLECTION.REQ_ANNOUNCEMENT_COLLECTION);
          const announcementCollection = await db.get().collection(COLLECTION.ANNOUNCEMENT_COLLECTION);
          const request = await reqAnnouncementCollection.findOne({ _id:new ObjectId(requestId) });
          if (request) {
            await announcementCollection.insertOne(request);
            await reqAnnouncementCollection.deleteOne({ _id:new ObjectId(requestId) });
          } else {
            return null;
          }
        } catch (error) {
          throw error;
        }
      },
      insertRequestAdmission: (requestDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                const reqAdmissionCollection = await db.get().collection(COLLECTION.REQ_ADMISSION);
                const result = await reqAdmissionCollection.insertOne(requestDetails);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },
    getAllAdmissionRequest: async () => {
      try {
          const reqAdmissionCollection = await db.get().collection(COLLECTION.REQ_ADMISSION);

          // Fetch requests and sort them by 'date' field in descending order
          const requests = await reqAdmissionCollection.find().sort({ date: -1 }).toArray();

          return requests;
      } catch (error) {
          throw error;
      }
  },
};
