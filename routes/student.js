var express = require('express');
var teacherHelpers = require('../helpers/teacher-helpers');
var studentHelpers = require('../helpers/student-helpers');
var announcementHelpers = require('../helpers/announcement-helpers')
var principalHelpers = require("../helpers/principal-helpers")
var router = express.Router();

const verifyLoginStudent = (req, res, next) => {
  if (req.session.student && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/student/login');
  }
}

router.get('/',verifyLoginStudent, function(req, res) {
  student_data = req.session.student;
  res.render('student/home',{student_check:true, student_data});
});

router.get('/login',(req,res)=>{
  res.render('student/login');
})
router.post('/login', async function (req, res) {
  const { email, password } = req.body;
  try {
    const student = await studentHelpers.getStudentByEmail(email);
    if (student) {
      const passwordMatch = await studentHelpers.comparePasswords(password, student.password);

      if (passwordMatch) {
        req.session.loggedIn = true;
        req.session.student = student;
        res.redirect('/student/'); 
      } else {
        res.render('student/login', {
          student: true,
          loginError: 'Invalid email or password',
        });
      }
    } else {
      res.render('student/login', {
        teacher: true,
        loginError: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('Error in teacher login:', error);
    res.render('student/login', {
      student: true,
      loginError: 'An error occurred. Please try again.',
    });
  }
});

router.get('/profile',verifyLoginStudent,(req,res)=>{
  let student_data=req.session.student;
  res.render('student/profile',{student_data,student_check:true});

})

router.get('/logout',verifyLoginStudent,(req,res)=>{
  req.session.student=null;
  res.redirect('/student/');
})

router.get('/list-teachers',verifyLoginStudent,(req,res)=>{
  
  teacherHelpers.getAllTeachers()
  .then(teachers=>{
    teachers.forEach((teacher, index) => {
      teacher.counter = index + 1;
    });
    if(teachers){

      let student_data = req.session.student
      res.render("teacher/list-teachers",{teachers, student_check:true,student_data});
      
      }
      else{
        return res.send('no teacher found')
      }
      })
})

router.get('/list-students',verifyLoginStudent,(req,res)=>{
    studentHelpers.getAllStudents().then((student) => {
      student.forEach((student, index) => {
        student.counter = index + 1;
      });
      let student_data = req.session.student
      res.render('student/list-students', { student_check: true, student_data,student});
    });
})

router.get('/announcements',verifyLoginStudent,async(req,res)=>{
  try {
    const announcements = await announcementHelpers.getAllAnnouncements();
    let student_data = req.session.student
    res.render('teacher/announcements', { student_check: true, announcements,student_data});
} catch (error) {
    console.error('Error in /announcements route:', error);
    res.status(500).send('Internal Server Error');
}
})

router.get('/attendance',verifyLoginStudent,async(req,res)=>{
  student_data = req.session.student;
  const workingDays = await teacherHelpers.getWorkingDays();

  res.render('student/attendance',{student_check:true,student_data,workingDays});
})

router.get('/view-principal', verifyLoginStudent, async (req, res) => {
  try {
    const principal_data = await principalHelpers.getPrincipal();
    const student_data = req.session.student;
    res.render('principal/profile', { student_check: true, student_data, principal_data });
  } catch (error) {
    console.error("Error in view-principal route:", error);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;
