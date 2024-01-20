const { ObjectId } = require("mongodb");
const db = require("../config/connection");
const COLLECTION = require("../config/collection");
const bcrypt = require("bcrypt");

module.exports = {
  addStudent: async (student, callback) => {
    try {
        // Generate a unique admission number
        const lastAdmissionNumber = await db
            .get()
            .collection(COLLECTION.STUDENTS_COLLECTION)
            .find()
            .sort({ admissionNo: -1 })
            .limit(1)
            .toArray();

        const lastAdmission = lastAdmissionNumber[0];
        const lastAdmissionNo = lastAdmission ? lastAdmission.admissionNo : 999; // Default to 999 if NaN

        const newAdmissionNumber = isNaN(lastAdmissionNo) ? 1000 : lastAdmissionNo + 1;

        student.admissionNo = newAdmissionNumber;

        // Generate a unique roll number based on the student's class
        const lastRollNumber = await db
            .get()
            .collection(COLLECTION.STUDENTS_COLLECTION)
            .find({ class: student.class })
            .sort({ rollNumber: -1 })
            .limit(1)
            .toArray();

        const lastRoll = lastRollNumber[0];
        const newRollNumber = lastRoll && lastRoll.rollNumber !== undefined ? lastRoll.rollNumber + 1 : 1;

        // Assign the new roll number
        student.rollNumber = newRollNumber;

        // Hash the password
        student.password = await bcrypt.hash(student.password, 10);

        // Insert the student with the assigned admission number and roll number
        const result = await db.get().collection(COLLECTION.STUDENTS_COLLECTION).insertOne(student);

        // Pass the admission number and roll number in the callback
        callback(result.insertedId, newAdmissionNumber, newRollNumber);
    } catch (error) {
        console.error('Error in addStudent:', error);
        throw error;
    }
},


  getAllStudents: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let students = await db
          .get()
          .collection(COLLECTION.STUDENTS_COLLECTION)
          .find()
          .toArray();
        resolve(students);
      } catch (error) {
        console.error("Error in getAllStudents:", error);
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
        console.error("Error in getStudentById:", error);
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
            class: student.class,
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
        console.error("Error in updatestudent:", error);
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
        console.error("Error in removeTeacher:", error);
        reject(error);
      }
    });
  },
  getStudentByEmail: (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const student = await db
          .get()
          .collection(COLLECTION.STUDENTS_COLLECTION)
          .findOne({ email: email });
        resolve(student);
      } catch (error) {
        console.error("Error in getTeacherByEmail:", error);
        reject(error);
      }
    });
  },
  comparePasswords: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  getAllStudentsByClass: (studentClass) => {
    return new Promise(async (resolve, reject) => {
      try {
        let filter = {}; // Default filter to get all students
  
        // If a class is provided, use it as a filter
        if (studentClass) {
          filter = { class: studentClass };
        }
  
        let students = await db
          .get()
          .collection(COLLECTION.STUDENTS_COLLECTION)
          .find(filter)
          .toArray();
  
        resolve(students);
      } catch (error) {
        console.error("Error in getAllStudents:", error);
        reject(error);
      }
    });
  },
};
