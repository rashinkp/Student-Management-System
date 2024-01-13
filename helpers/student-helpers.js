const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const COLLECTION = require('../config/collection');
const bcrypt = require('bcrypt');

module.exports = {
    addStudent: async(student, callback) => {
        try {
            student.password = await bcrypt.hash(student.password, 10);
            const result = await db.get().collection(COLLECTION.STUDENTS_COLLECTION).insertOne(student);
            callback(result.insertedId);
        } catch (error) {
            console.error('Error in addStudent:', error);
            throw error;
        }
    },
    getAllStudents: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let students = await db.get().collection(COLLECTION.STUDENTS_COLLECTION).find().toArray();
                resolve(students);
            } catch (error) {
                console.error('Error in getAllStudents:', error);
                reject(error);
            }
        });
    },
    getStudentById: (studentId) => {
        return new Promise(async (resolve, reject) => {
          try {
            const student = await db
              .get()
              .collection(COLLECTION.STUDENTS_COLLECTION)
              .findOne({ _id: new ObjectId(studentId) });
    
            resolve(student);
          } catch (error) {
            console.error('Error in getStudentById:', error);
            reject(error);
          }
        });
      },
      updateStudent: (studentId, student) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if the password is provided before hashing
                if (student.password) {
                    student.password = await bcrypt.hash(student.password, 10);
                }
    
                // Add the image path to the update fields
                const updateFields = {
                    $set: {
                        firstName: student.firstName,
                        secondName: student.secondName,
                        age: student.age,
                        sex: student.sex,
                        class:student.class,
                        place: student.place,
                        state: student.state,
                        mobile: student.mobile,
                        email: student.email,
                        password: student.password,
                    },
                };
    
                // Update the student information
                await db
                    .get()
                    .collection(COLLECTION.STUDENTS_COLLECTION)
                    .updateOne({ _id: new ObjectId(studentId) }, updateFields);
    
                resolve();
            } catch (error) {
                console.error('Error in updatestudent:', error);
                reject(error);
            }
        });
    }, 
    removeStudent: (studentId) => {
        return new Promise(async (resolve, reject) => {
          try {
            await db
              .get()
              .collection(COLLECTION.STUDENTS_COLLECTION)
              .deleteOne({ _id: new ObjectId(studentId) });
            resolve();
          } catch (error) {
            console.error('Error in removeTeacher:', error);
            reject(error);
          }
        });
      },
};
