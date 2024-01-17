var express = require('express');
var teacherHelpers = require('../helpers/teacher-helpers');
var studentHelpers = require('../helpers/student-helpers');
var announcementHelpers = require('../helpers/announcement-helpers')
const reqHelpers = require('../helpers/req-helpers');
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


module.exports = router;
