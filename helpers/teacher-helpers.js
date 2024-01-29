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
      // console.log('New working days:', newWorkingDays);
      await db
        .get()
        .collection(COLLECTION.WORKING_DAYS)
        .updateOne(
          {}, // Update all documents
          { $set: { days: newWorkingDays } }, // Set the new working days
          { upsert: true } // Create a new document if it doesn't exist
        );
    } catch (error) {
      console.error('Error in updateWorkingDays:', error);
      throw error;
    }
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


  getSubjectMark: (subject) => {
    return new Promise(async (resolve, reject) => {
        try {
            const subjectMark = await db
                .get()
                .collection(COLLECTION.TOTAL_MARK)
                .findOne({ subject: subject });
            resolve(subjectMark);
        } catch (error) {
            console.error('Error in getSubjectMark:', error);
            reject(error);
        }
    });
},

// Update subject mark in the collection
updateSubjectMark: (subject, mark) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db
                .get()
                .collection(COLLECTION.TOTAL_MARK)
                .updateOne({ subject: subject }, { $set: { mark: mark } });
            resolve();
        } catch (error) {
            console.error('Error in updateSubjectMark:', error);
            reject(error);
        }
    });
},

updateTotalMarks: async (subject, mark) => {
  try {
    await fetch('/teacher/update-total-marks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject: subject, mark: mark }), // Ensure correct data is sent
    });
  } catch (error) {
    console.error('Error in updateTotalMarks:', error);
    throw error;
  }
},

addSubjectMark: (subject, mark) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db
                .get()
                .collection(COLLECTION.TOTAL_MARK)
                .insertOne({ subject: subject, mark: mark });
            resolve();
        } catch (error) {
            console.error('Error in addSubjectMark:', error);
            reject(error);
        }
    });
},


getAllSubjectMarks: () => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalMarks = await db
        .get()
        .collection(COLLECTION.TOTAL_MARK)
        .find({}, { projection: { _id: 0, subject: 1, mark: 1 } }) 
        .toArray();
      resolve(totalMarks);
    } catch (error) {
      console.error('Error in getAllSubjectMarks:', error);
      reject(error);
    }
  });
}

    
    
};
