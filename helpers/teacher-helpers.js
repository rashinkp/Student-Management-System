const { ObjectId } = require('mongodb');
var db = require('../config/connection');
var COLLECTION = require('../config/collection');
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const { rejects } = require('assert');
const collection = require('../config/collection');
const { response } = require('express');
const { resolveSrv } = require('dns');

module.exports = {
    addTeacher: async(teacher, callback) => {
        teacher.password = await bcrypt.hash(teacher.password,10)
        db.get().collection(COLLECTION.TEACHERS_COLLECTION).insertOne(teacher).then((data) => {
            callback(data.insertedId);
        });
    },
    getAllTeachers: () => {
        return new Promise(async (resolve, reject) => {
            let teachers = await db.get().collection(COLLECTION.TEACHERS_COLLECTION).find().toArray();
            resolve(teachers);
        });
    },
    getTeacherById: (teacherId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const teacher = await db
                    .get()
                    .collection(COLLECTION.TEACHERS_COLLECTION)
                    .findOne({ _id: new ObjectId(teacherId) });
    
                resolve(teacher);
            } catch (error) {
                console.error('Error in getTeacherById:', error);
                reject(error);
            }
        });
    },
    updateTeacher: (teacherId, teacher) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if the password is provided before hashing
                if (teacher.password) {
                    teacher.password = await bcrypt.hash(teacher.password, 10);
                }
    
                // Add the image path to the update fields
                const updateFields = {
                    $set: {
                        firstName: teacher.firstName,
                        secondName: teacher.secondName,
                        age: teacher.age,
                        sex: teacher.sex,
                        qualification: teacher.qualification,
                        place: teacher.place,
                        state: teacher.state,
                        section: teacher.section,
                        subject: teacher.subject,
                        mobile: teacher.mobile,
                        email: teacher.email,
                        password: teacher.password,
                    },
                };
    
                // Update the teacher information
                await db
                    .get()
                    .collection(COLLECTION.TEACHERS_COLLECTION)
                    .updateOne({ _id: new ObjectId(teacherId) }, updateFields);
    
                resolve();
            } catch (error) {
                console.error('Error in updateTeacher:', error);
                reject(error);
            }
        });
    }, 
    removeTeacher: (teacherId) => {
        return new Promise(async (resolve, reject) => {
          try {
            await db
              .get()
              .collection(COLLECTION.TEACHERS_COLLECTION)
              .deleteOne({ _id: new ObjectId(teacherId) });
            resolve();
          } catch (error) {
            console.error('Error in removeTeacher:', error);
            reject(error);
          }
        });
      },

      getTeacherByEmail: (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const teacher = await db
          .get()
          .collection(COLLECTION.TEACHERS_COLLECTION)
          .findOne({ email: email });
        resolve(teacher);
      } catch (error) {
        console.error('Error in getTeacherByEmail:', error);
        reject(error);
      }
    });
  },

  comparePasswords: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  getWorkingDays: async () => {
    try {
      const workingDaysDoc = await db
        .get()
        .collection(COLLECTION.WORKING_DAYS)
        .findOne();

      return workingDaysDoc ? workingDaysDoc.days : 0;
    } catch (error) {
      console.error('Error in getWorkingDays:', error);
      throw error;
    }
  },

  updateWorkingDays: async (newWorkingDays) => {
    try {
      await db
        .get()
        .collection(COLLECTION.WORKING_DAYS)
        .updateOne({}, { $set: { days: newWorkingDays } }, { upsert: true });
    } catch (error) {
      console.error('Error in updateWorkingDays:', error);
      throw error;
    }
  },
    
};
