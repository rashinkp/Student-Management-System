const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const COLLECTION = require('../config/collection');

module.exports = {
    addSubject: async (subject, mark) => {
        try {
            await db.get().collection(COLLECTION.SUBJECT).insertOne({ subject, mark });
            return true;
        } catch (error) {
            console.error('Error adding subject:', error);
            throw error;
        }
    },
      
    getAllSubjects: async () => {
        try {
            // Fetch all subjects from the database
            const subjects = await db.get().collection(COLLECTION.SUBJECT).find().toArray();
            return subjects;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    },

    getAllSubjectMarks: async () => {
        try {
            // Fetch only the marks of all subjects from the database
            const marks = await db.get().collection(COLLECTION.SUBJECT).find({}, { projection: { _id: 1, mark: 1 } }).toArray();
            return marks;
        } catch (error) {
            console.error('Error fetching subject marks:', error);
            throw error;
        }
    },

    deleteSubject: async (subjectId) => {
        try {
            await db.get().collection(COLLECTION.SUBJECT).deleteOne({ _id: new ObjectId(subjectId) });
            return true;
        } catch (error) {
            console.error('Error deleting subject:', error);
            throw error;
        }
    },

    updateSubjectMark: async (subjectId, mark) => {
        try {
            await db.get().collection(COLLECTION.SUBJECT).updateOne(
                { _id: new ObjectId(subjectId) },
                { $set: { mark } }
            );
            return true;
        } catch (error) {
            console.error('Error updating subject mark:', error);
            throw error;
        }
    },
};
