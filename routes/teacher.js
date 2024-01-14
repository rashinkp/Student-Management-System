var express = require('express');
var teacherHelpers = require('../helpers/teacher-helpers');
var studentHelpers = require('../helpers/student-helpers')
var router = express.Router();

const verifyLogin = (req, res, next) => {
  if (req.session.teacher && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/teacher/login');
  }
}

router.get('/',verifyLogin, function (req, res) {
  let staff = req.session.teacher
  res.render('teacher/home', { teacher: true , staff});
});

router.get('/login', function (req, res) {
  res.render('teacher/login', );
});

router.post('/login', async function (req, res) {
  const { email, password } = req.body;

  try {
    const teacher = await teacherHelpers.getTeacherByEmail(email);
    if (teacher) {
      const passwordMatch = await teacherHelpers.comparePasswords(password, teacher.password);

      if (passwordMatch) {
        req.session.loggedIn = true;
        req.session.teacher = teacher;
        res.redirect('/teacher/'); // You can redirect to the teacher's dashboard or any other page
      } else {
        res.render('teacher/login', {
          teacher: true,
          loginError: 'Invalid email or password',
        });
      }
    } else {
      // Teacher not found, show an error message
      res.render('teacher/login', {
        teacher: true,
        loginError: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('Error in teacher login:', error);
    res.render('teacher/login', {
      teacher: true,
      loginError: 'An error occurred. Please try again.',
    });
  }
});

router.get('/list-students',verifyLogin,(req,res)=>{
  studentHelpers.getAllStudents().then((student) => {
    student.forEach((student, index) => {
      student.counter = index + 1;
    });
    res.render('student/list-students', { staff: true, student });
  });
})


router.get('/student-profile/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentHelpers.getStudentById(studentId);
    res.render('principal/student-profile', { student, teacher: true });
  } catch (error) {
    console.error('Error in /student-profile route:', error);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;
