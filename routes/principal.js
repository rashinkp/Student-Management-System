var express = require('express');
var router = express.Router();
const path = require('path');
var teacherHelpers = require('../helpers/teacher-helpers');
var studentHelpers = require('../helpers/student-helpers');
var announcementHelpers = require('../helpers/announcement-helpers')
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  let princi = req.session.principal
  res.render('principal/home',{principal:true,princi });
});
router.get('/principal-login',(req,res)=>{
  res.render(('principal/login'));
})
router.post('/principal-login',(req,res)=>{
  let response = req.body
  let princi = {
    name:'Rashin KP',
    email:'rashinkp001@gmail.com',
    password:123
  }
  if (response.email == princi.email && response.password == princi.password){
    req.session.loggedIn = true;
    req.session.principal = princi;
    res.redirect(('/principal/'));
  }else{
    console.log("Wrong information");
    res.redirect("/principal/principal-login")
    }
})


router.get("/list-teachers", (req, res) => {
  teacherHelpers.getAllTeachers().then((teachers) => {
    // Add a 'counter' property to each teacher
    teachers.forEach((teacher, index) => {
      teacher.counter = index + 1;
    });

    res.render('teacher/list-teachers', { principal: true, teachers });
  });
});



router.get('/add-teacher',(req,res)=>{
  res.render('principal/add-teacher',{principal:true});
})
router.post('/add-teacher', (req, res) => {
  if (req.file) {
    let image = req.file;
    teacherHelpers.addTeacher(req.body, (id) => {
      const destinationPath = path.join(__dirname, '../public/images/teacher/', id + '.jpg');
      fs.rename(image.path, destinationPath, (err) => {
        if (!err) {
          res.redirect('/principal/list-teachers');
        } else {
          console.log(err);
          res.status(500).send('Error moving the file');
        }
      });
    });
  } else {
    console.log('No file uploaded');
    res.status(400).send('No file uploaded');
  }


  
});


router.get('/teacher-profile/:id', async (req, res) => {
  try {
      const teacherId = req.params.id;
      const teacher = await teacherHelpers.getTeacherById(teacherId);
      res.render('principal/teacher-profile', { teacher,principal:true });
  } catch (error) {
      console.error('Error in /teacher-profile route:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/edit-teacher/:id',async(req,res)=>{
  try{
    
    const teacherId = req.params.id;
    const teacher = await teacherHelpers.getTeacherById(teacherId);
    console.log(teacher)
    res.render('principal/edit-teacher',{teacher,principal:true})
  }catch(error){
    console.error('Error in /teacher-profile route:', error);
    res.status(500).send('Internal Server Error');
  }
})

router.post('/edit-teacher/:id', async (req, res) => {
    const teacherId = req.params.id;
    await teacherHelpers.updateTeacher(teacherId, req.body);
    res.redirect(`/principal/teacher-profile/${teacherId}`);
});

router.get('/remove-teacher/:id', async (req, res) => {
  try {
    const teacherId = req.params.id;
    await teacherHelpers.removeTeacher(teacherId);
    res.redirect('/principal/list-teachers');
  } catch (error) {
    console.error('Error in /remove-teacher route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/list-students', (req, res) => {
  studentHelpers.getAllStudents().then((student) => {
    student.forEach((student, index) => {
      student.counter = index + 1;
    });
    res.render('student/list-students', { principal: true, student });
  });
});

router.get('/add-student',(req,res)=>{
  res.render('principal/add-student',{principal:true})
})


router.post('/add-student', async (req, res) => {
  try {
    if (req.file) {
      let image = req.file;
      const studentData = req.body;
      await studentHelpers.addStudent(studentData, (id) => {
        const destinationPath = path.join(__dirname, '../public/images/student', id + '.jpg');
        fs.rename(image.path, destinationPath, (err) => {
          if (!err) {
            res.redirect('/principal/list-students');
          } else {
            console.log(err);
            res.status(500).send('Error moving the file');
          }
        });
      });
    } else {
      console.log('No file uploaded');
      res.status(400).send('No file uploaded');
    }
  } catch (error) {
    console.error('Error in /add-student route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/student-profile/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentHelpers.getStudentById(studentId);
    res.render('principal/student-profile', { student, principal: true });
  } catch (error) {
    console.error('Error in /student-profile route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/edit-student/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentHelpers.getStudentById(studentId);
    res.render('principal/edit-student', { student, principal: true });
  } catch (error) {
    console.error('Error in /edit-student route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/edit-student/:id', async (req, res) => {
  const studentId = req.params.id;
  await studentHelpers.updateStudent(studentId, req.body);
  res.redirect(`/principal/student-profile/${studentId}`);

});

router.get('/remove-student/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    await studentHelpers.removeStudent(studentId);
    res.redirect('/principal/list-students');
  } catch (error) {
    console.error('Error in /remove-teacher route:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/classes',(req,res)=>{
  res.render('teacher/classes',{principal:true})
})

router.get('/announcements', async (req, res) => {
  try {
      // Fetch announcements from the database
      const announcements = await announcementHelpers.getAllAnnouncements();
      res.render('teacher/announcements', { principal: true, announcements });
  } catch (error) {
      console.error('Error in /announcements route:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/create-announcement', (req, res) => {
  res.render('principal/create-announcement', { principal: true });
});

router.post('/create-announcement', async (req, res) => {
  try {
      const announcementData = req.body;
      const result = await announcementHelpers.addAnnouncement(announcementData);
      res.redirect('/principal/announcements');
  } catch (error) {
      console.error('Error in /create-announcement route:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/delete-announcement/:id', async (req, res) => {
  try {
      const announcementId = req.params.id;
      await announcementHelpers.removeAnnouncement(announcementId);
      res.redirect('/principal/announcements');
  } catch (error) {
      console.error('Error in /delete-announcement route:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/profile',(req,res)=>{
  res.render('principal/profile',{principal:true});
})




module.exports = router;
