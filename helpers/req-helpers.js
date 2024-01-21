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
  moveAdmissionRequestToStudent: async (requestId) => {
    try {
      const reqAdmissionCollection = await db.get().collection(COLLECTION.REQ_ADMISSION);
      const studentCollection = await db.get().collection(COLLECTION.STUDENTS_COLLECTION);
  
      const request = await reqAdmissionCollection.findOne({ _id: new ObjectId(requestId) });
  
      if (request) {
        // Generate a unique admission number for the new student
        const lastAdmissionNumber = await studentCollection
          .find()
          .sort({ admissionNo: -1 })
          .limit(1)
          .toArray();
  
        const lastAdmission = lastAdmissionNumber[0];
        const lastAdmissionNo = lastAdmission ? lastAdmission.admissionNo : 999; // Default to 999 if NaN
  
        const newAdmissionNumber = isNaN(lastAdmissionNo) ? 1000 : lastAdmissionNo + 1;
  
        // Find the last roll number for the given class
        const lastRollNumber = await studentCollection
          .find({ class: request.class })
          .sort({ rollNumber: -1 })
          .limit(1)
          .toArray();
  
        const lastRoll = lastRollNumber[0];
        const newRollNumber = lastRoll && lastRoll.rollNumber !== undefined ? lastRoll.rollNumber + 1 : 1;
  
        // Assign the admission number and roll number to the new student
        request.admissionNo = newAdmissionNumber;
        request.rollNumber = newRollNumber;
  
        // Set default values for marks and attendance
        request.marks = {
          english: 0,
          secondLanguage: 0,
          maths: 0,
          it: 0,
          science: 0,
          socialScience: 0,
          // Add more subjects as needed
        };
  
        request.attendance = 0
  
        // Insert the request into the student collection
        const result = await studentCollection.insertOne(request);
  
        // Remove the request from the req_admission collection
        await reqAdmissionCollection.deleteOne({ _id: new ObjectId(requestId) });
  
        return result;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  },

  removeAdmissionRequest: async (requestId) => {
    try {
      const reqAdmissionCollection = await db.get().collection(COLLECTION.REQ_ADMISSION);

      // Find the request in the req_admission collection
      const request = await reqAdmissionCollection.findOne({ _id: new ObjectId(requestId) });

      // Remove the request from the req_admission collection
      await reqAdmissionCollection.deleteOne({ _id: new ObjectId(requestId) });

      return request;
    } catch (error) {
      throw error;
    }
  },
};
