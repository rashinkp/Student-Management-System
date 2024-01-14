var express = require('express');
var teacherHelpers = require('../helpers/teacher-helpers');
var router = express.Router();

router.get('/', function (req, res) {
  let staff = req.session.teacher
  res.render('teacher/home', { teacher: true , staff});
});

router.get('/login', function (req, res) {
  res.render('teacher/login', { teacher: true });
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
        // Passwords do not match, show an error message
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

module.exports = router;
