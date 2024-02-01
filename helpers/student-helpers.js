const { ObjectId } = require("mongodb");
const db = require("../config/connection");
const COLLECTION = require("../config/collection");
const bcrypt = require("bcrypt");

const calculateAttendancePercentage = (presentDays, workingDays) => {
  if (workingDays === 0) {
    return 0;
  }
  return (presentDays / workingDays) * 100;
};

module.exports = {
  calculateAttendancePercentage,
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

      const newAdmissionNumber = isNaN(lastAdmissionNo)
        ? 1000
        : lastAdmissionNo + 1;

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
      const newRollNumber =
        lastRoll && lastRoll.rollNumber !== undefined
          ? lastRoll.rollNumber + 1
          : 1;

      // Assign the new roll number
      student.rollNumber = newRollNumber;

      student.attendance = {
        present: 0,
        percentage: 0,
      };

      // Hash the password
      student.password = await bcrypt.hash(student.password, 10);

      // Insert the student with the assigned admission number and roll number
      const result = await db
        .get()
        .collection(COLLECTION.STUDENTS_COLLECTION)
        .insertOne(student);

      // Pass the admission number and roll number in the callback
      callback(result.insertedId, newAdmissionNumber, newRollNumber);
    } catch (error) {
      console.error("Error in addStudent:", error);
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
        let filter = {};
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

  updatePresentDays: async (newPresentDays, studentId, workingDays) => {
    try {
      newPresentDays = newPresentDays || 0;
      const percentage = calculateAttendancePercentage(
        newPresentDays,
        workingDays
      ).toFixed(2);

      await db
        .get()
        .collection(COLLECTION.STUDENTS_COLLECTION)
        .updateOne(
          { _id: new ObjectId(studentId) },
          {
            $set: {
              "attendance.present": newPresentDays,
              "attendance.percentage": parseFloat(percentage), // Convert back to a number
            },
          }
        );

      return { present: newPresentDays, percentage }; // Return the updated attendance object
    } catch (error) {
      console.error("Error in updatePresentDays:", error);
      throw error;
    }
  },

  addMark: async (studentId) => {
    try {
      // Retrieve subjects from the subject collection
      const subjects = await db
        .get()
        .collection(COLLECTION.SUBJECT)
        .find({}, { projection: { subject: 1, _id: 0 } }) // Only retrieve the subject field and exclude _id
        .toArray();

      console.log("Subjects:", subjects);

      // Prepare the marks object with default values (0)
      const markObj = {};
      subjects.forEach((subject) => {
        markObj[subject.subject] = 0;
      });

      // Update the student with the mark object
      await db
        .get()
        .collection(COLLECTION.STUDENTS_COLLECTION)
        .updateOne(
          { _id: new ObjectId(studentId) },
          { $set: { mark: markObj } }
        );

      return true;
    } catch (error) {
      console.error("Error in addMark:", error);
      throw error;
    }
  },
  updateStudentMark: async (studentId, subject, mark) => {
    try {
      // Update the mark for the specified subject and student
      await db
        .get()
        .collection(COLLECTION.STUDENTS_COLLECTION)
        .updateOne(
          { _id: new ObjectId(studentId) },
          { $set: { [`mark.${subject}`]: mark } }
        );
    } catch (error) {
      console.error("Error updating student mark:", error);
      throw error;
    }
  },


};
