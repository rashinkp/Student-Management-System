var express = require("express");
var teacherHelpers = require("../helpers/teacher-helpers");
var studentHelpers = require("../helpers/student-helpers");
var announcementHelpers = require("../helpers/announcement-helpers");
const reqHelpers = require("../helpers/req-helpers");
var router = express.Router();

const verifyLoginTeacher = (req, res, next) => {
  if (req.session.teacher && req.session.loggedIn) {
    next();
  } else {
    res.redirect("/teacher/login");
  }
};

router.get("/", verifyLoginTeacher, function (req, res) {
  let staff = req.session.teacher;
  res.render("teacher/home", { teacher: true, staff });
});

router.get("/login", function (req, res) {
  res.render("teacher/login");
});

router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    const teacher = await teacherHelpers.getTeacherByEmail(email);
    if (teacher) {
      const passwordMatch = await teacherHelpers.comparePasswords(
        password,
        teacher.password
      );

      if (passwordMatch) {
        req.session.loggedIn = true;
        req.session.teacher = teacher;
        res.redirect("/teacher/"); // You can redirect to the teacher's dashboard or any other page
      } else {
        res.render("teacher/login", {
          teacher: true,
          loginError: "Invalid email or password",
        });
      }
    } else {
      // Teacher not found, show an error message
      res.render("teacher/login", {
        teacher: true,
        loginError: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Error in teacher login:", error);
    res.render("teacher/login", {
      teacher: true,
      loginError: "An error occurred. Please try again.",
    });
  }
});

router.get("/logout", verifyLoginTeacher, (req, res) => {
  req.session.teacher = null;
  res.redirect("/teacher/");
});

router.get("/list-students", verifyLoginTeacher, (req, res) => {
  studentHelpers.getAllStudents().then((student) => {
    student.forEach((student, index) => {
      student.counter = index + 1;
    });
    let staff = req.session.teacher;
    res.render("student/list-students", { teacher: true, student, staff });
  });
});

router.get("/student-profile/:id", verifyLoginTeacher, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentHelpers.getStudentById(studentId);
    let staff = req.session.teacher;
    res.render("principal/student-profile", { student, teacher: true, staff });
  } catch (error) {
    console.error("Error in /student-profile route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/list-teachers", verifyLoginTeacher, (req, res) => {
  teacherHelpers.getAllTeachers().then((teachers) => {
    teachers.forEach((teacher, index) => {
      teacher.counter = index + 1;
    });
    if (teachers) {
      let staff = req.session.teacher;
      res.render("teacher/list-teachers", { teachers, teacher: true, staff });
    } else {
      return res.send("no teacher found");
    }
  });
});

router.get("/teacher-profile/:id", verifyLoginTeacher, async (req, res) => {
  try {
    const teacherId = req.params.id;
    const staff = await teacherHelpers.getTeacherById(teacherId);
    res.render("principal/teacher-profile", { teacher: true, staff });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "could not find that user" });
  }
});

router.get("/classes", verifyLoginTeacher, (req, res) => {
  let staff = req.session.teacher;
  res.render("teacher/classes", { teacher: true, staff });
});

router.get("/announcements", verifyLoginTeacher, async (req, res) => {
  try {
    // Fetch announcements from the database
    const announcements = await announcementHelpers.getAllAnnouncements();
    let staff = req.session.teacher;
    res.render("teacher/announcements", {
      teacher: true,
      announcements,
      staff,
    });
  } catch (error) {
    console.error("Error in /announcements route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/request-announcement", verifyLoginTeacher, (req, res) => {
  let staff = req.session.teacher;
  res.render("teacher/request-announcement", { teacher: true, staff });
});

router.post("/request-announcement", verifyLoginTeacher, async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const requestDetails = {
      title,
      date,
      description,
      approval: false,
    };
    await reqHelpers.insertRequestAnnouncement(requestDetails);

    res.redirect("/teacher/announcements");
  } catch (error) {
    console.error("Error in /request-announcement route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/profile", verifyLoginTeacher, (req, res) => {
  let staff = req.session.teacher;
  console.log("here is the stff>>>>> ", staff);
  res.render("teacher/profile", { teacher: true, staff });
});

router.get("/attendance", verifyLoginTeacher, (req, res) => {
  studentHelpers.getAllStudents().then((student) => {
    student.forEach((student, index) => {
      student.counter = index + 1;
    });
    let staff = req.session.teacher;
    res.render("teacher/attendance", { teacher: true, staff,student});
  });
});

router.get('/view-class/:class', verifyLoginTeacher, async (req, res) => {
  try {
    const studentClass = req.params.class;

    if (!studentClass) {
      return res.status(400).send('Class parameter not provided');
    }

    // Get the working days from the database
    const workingDays = await teacherHelpers.getWorkingDays();
    
    // Get students in the specified class
    const students = await studentHelpers.getAllStudentsByClass(studentClass);

    let staff = req.session.teacher;
    res.render('teacher/view-class', { teacher: true, staff, students, workingDays });
  } catch (error) {
    console.error('Error in /view-class route:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST route to update working days
router.post('/update-working-days', verifyLoginTeacher, async (req, res) => {
  try {
    const { workingDays } = req.body;

    // Update the working days in the database
    await teacherHelpers.updateWorkingDays(workingDays);

    res.json({ success: true, workingDays });
  } catch (error) {
    console.error('Error updating working days:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/update-present-days/:id', verifyLoginTeacher, async (req, res) => {
  try {
    const { presentDays } = req.body;
    const studentId = req.params.id; // Extract student ID from the URL parameter

    // Update the present days in the database for the specific student
    await studentHelpers.updatePresentDays(presentDays, studentId);

    res.json({ success: true, presentDays });
  } catch (error) {
    console.error('Error updating present days:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
