var express = require('express');
var router = express.Router();
const path = require('path');
var teacherHelpers = require('../helpers/teacher-helpers');
var studentHelpers = require('../helpers/student-helpers');
var announcementHelpers = require('../helpers/announcement-helpers');
var reqHelpers = require('../helpers/req-helpers');
const fs = require('fs');
const { ExplainVerbosity } = require('mongodb');
const subjectHelpers = require('../helpers/subject-helpers')
const moment = require('moment');

const verifyLoginPrincipal = (req, res, next) => {
  if (req.session.principal && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/principal/principal-login');
  }
}

router.get('/',verifyLoginPrincipal, function(req, res, next) {
  let princi = req.session.principal
  res.render('principal/home',{principal:true,princi });
});
router.get('/principal-login', (req, res) => {
  res.render('principal/login', { login: true });
});

router.post('/principal-login',(req,res)=>{
  let response = req.body
  let princi = {
    name:'Rashin KP',
    age:40,
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


router.get("/list-teachers",verifyLoginPrincipal, (req, res) => {
  teacherHelpers.getAllTeachers().then((teachers) => {
    // Add a 'counter' property to each teacher
    teachers.forEach((teacher, index) => {
      teacher.counter = index + 1;
    });

    res.render('teacher/list-teachers', { principal: true, teachers });
  });
});



router.get('/add-teacher',verifyLoginPrincipal, async(req,res)=>{
  let subjects = await subjectHelpers.getAllSubjects();
  // console.log('subjects:',subjects);
  res.render('principal/add-teacher',{principal:true,subjects});
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


router.get('/teacher-profile/:id',verifyLoginPrincipal, async (req, res) => {
  try {
      const teacherId = req.params.id;
      const staff = await teacherHelpers.getTeacherById(teacherId);
      res.render('principal/teacher-profile', { staff,principal:true });
  } catch (error) {
      console.error('Error in /teacher-profile route:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/edit-teacher/:id',verifyLoginPrincipal,async(req,res)=>{
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

router.get('/remove-teacher/:id',verifyLoginPrincipal, async (req, res) => {
  try {
    const teacherId = req.params.id;
    await teacherHelpers.removeTeacher(teacherId);
    res.redirect('/principal/list-teachers');
  } catch (error) {
    console.error('Error in /remove-teacher route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/list-students',verifyLoginPrincipal, (req, res) => {
  studentHelpers.getAllStudents().then((student) => {
    student.forEach((student, index) => {
      student.counter = index + 1;
    });
    res.render('student/list-students', { principal: true, student });
  });
});

router.get('/add-student',verifyLoginPrincipal,(req,res)=>{
  res.render('principal/add-student',{principal:true})
})


router.post('/add-student', async (req, res) => {
  try {
      if (req.file) {
          let image = req.file;
          const studentData = req.body;
          await studentHelpers.addStudent(studentData, (id, admissionNo) => {
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

router.get('/student-profile/:id',verifyLoginPrincipal, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentHelpers.getStudentById(studentId);
    const workingDays = await teacherHelpers.getWorkingDays();
    const subjects = await subjectHelpers.getAllSubjects();
    res.render('principal/student-profile', { student, principal: true,workingDays,subjects });
  } catch (error) {
    console.error('Error in /student-profile route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/edit-student/:id',verifyLoginPrincipal, async (req, res) => {
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

router.get('/remove-student/:id',verifyLoginPrincipal, async (req, res) => {
  try {
    const studentId = req.params.id;
    await studentHelpers.removeStudent(studentId);
    res.redirect('/principal/list-students');
  } catch (error) {
    console.error('Error in /remove-teacher route:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/classes',verifyLoginPrincipal,(req,res)=>{
  res.render('teacher/classes',{principal:true})
})

router.get('/announcements',verifyLoginPrincipal, async (req, res) => {
  try {
      // Fetch announcements from the database
      const announcements = await announcementHelpers.getAllAnnouncements();
      res.render('teacher/announcements', { principal: true, announcements });
  } catch (error) {
      console.error('Error in /announcements route:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/create-announcement',verifyLoginPrincipal, (req, res) => {
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


router.get('/delete-announcement/:id',verifyLoginPrincipal, async (req, res) => {
  try {
      const announcementId = req.params.id;
      await announcementHelpers.removeAnnouncement(announcementId);
      res.redirect('/principal/announcements');
  } catch (error) {
      console.error('Error in /delete-announcement route:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/profile',verifyLoginPrincipal,(req,res)=>{
  principal_data = req.session.principal
  res.render('principal/profile',{principal:true, principal_data});
})

router.get('/request-announcements', verifyLoginPrincipal, async (req, res) => {
  try {
    // Fetch requests from the req_announcement collection and sort them by date in descending order
    const requests = await reqHelpers.getAllRequestsSortedByDate();

    res.render('principal/request-announcements', { principal: true, requests });
  } catch (error) {
    console.error('Error in /request-announcements route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/delete-request/:id', verifyLoginPrincipal, async (req, res) => {
  try {
    const requestId = req.params.id;

    // Call the helper method to remove the request from the req_announcement collection
    await reqHelpers.removeRequest(requestId);

    res.redirect('/principal/request-announcements');
  } catch (error) {
    console.error('Error in /delete-request route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/approve-request/:id', verifyLoginPrincipal, async (req, res) => {
  try {
    const requestId = req.params.id;
    // console.log('raching here>>>> ',requestId)
    // Call the helper method to approve the request
    await reqHelpers.approveRequest(requestId);

    res.redirect('/principal/announcements');
  } catch (error) {
    console.error('Error in /approve-request route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout',verifyLoginPrincipal,(req,res)=>{
  req.session.principal = null
  res.redirect('/principal/')
})
router.get('/req-admission',verifyLoginPrincipal,async(req,res)=>{
  try {
    const requests = await reqHelpers.getAllAdmissionRequest();
    res.render('principal/req-admission', { principal: true, requests });

} catch (error) {
    console.error('Error in /request-announcements route:', error);
    res.status(500).send('Internal Server Error');
}
  
})

router.get('/approve-admission/:id', verifyLoginPrincipal, async (req, res) => {
  try {
    const requestId = req.params.id;

    // Call the helper method to move the request to the student collection
    const result = await reqHelpers.moveAdmissionRequestToStudent(requestId);

    if (result) {
      res.redirect('/principal/list-students');
    } else {
      res.status(404).send('Request not found');
    }
  } catch (error) {
    console.error('Error in /approve-admission route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/reject-admission/:id', verifyLoginPrincipal, async (req, res) => {
  try {
    const requestId = req.params.id;

    // Call the helper method to remove the request from the req_admission collection
    const removedRequest = await reqHelpers.removeAdmissionRequest(requestId);

    // Remove the image if the request was found
    if (removedRequest) {
      const imagePath = path.join(__dirname, '../public/images/student', requestId + '.jpg');
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error removing image:', err);
        }
        res.redirect('/principal/req-admission');
      });
    } else {
      res.status(404).send('Request not found');
    }
  } catch (error) {
    console.error('Error in /reject-admission route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/req-teacher',verifyLoginPrincipal,async(req,res)=>{
  const requests = await reqHelpers.getAllTeacherReq();
  res.render('principal/req-teacher',{principal:true,requests})
})
//>>>>


router.get('/approve-teacher/:id', verifyLoginPrincipal, async (req, res) => {
  try {
    const requestId = req.params.id;

    // Call the helper method to move the request to the student collection
    const result = await reqHelpers.moveTeacherRequestToTeacher(requestId);

    if (result) {
      res.redirect('/principal/list-teachers');
    } else {
      res.status(404).send('Request not found');
    }
  } catch (error) {
    console.error('Error in /approve-teacher route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/reject-teacher/:id', verifyLoginPrincipal, async (req, res) => {
  try {
    const requestId = req.params.id;

    // Call the helper method to remove the request from the req_admission collection
    const removedRequest = await reqHelpers.removeTeacherRequest(requestId);

    // Remove the image if the request was found
    if (removedRequest) {
      const imagePath = path.join(__dirname, '../public/images/teacher', requestId + '.jpg');
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error removing image:', err);
        }
        res.redirect('/principal/list-teachers');
      });
    } else {
      res.status(404).send('Request not found');
    }
  } catch (error) {
    console.error('Error in /reject-admission route:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/controls', verifyLoginPrincipal, async (req, res) => {
  try {
    const staff = req.session.teacher;
    const workingDays = await teacherHelpers.getWorkingDays();
    const subjects = await subjectHelpers.getAllSubjects();
    const currentDate = moment().format('DD/MM/YYYY');

    // console.log("total mark in the principal:",totalMarks)

    res.render('teacher/controls', { staff, teacher: true, workingDays, subjects, principal: true, currentDate });
  } catch (error) {
    console.error('Error in /controls route:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/add-subject', verifyLoginPrincipal, async (req, res) => {
  try {
    const { subject, mark } = req.body;
    const existingSubjects = await subjectHelpers.getAllSubjects();
    
    // Check if any subjects exist
    if (existingSubjects.length > 0) {
      // Check if the subject already exists
      const existingSubject = existingSubjects.find(s => s.subject === subject);
      if (existingSubject) {
        return res.json({ success: false, error: 'Subject already exists' });
      }
    }

    // Add the subject
    await subjectHelpers.addSubject(subject, mark);

    res.redirect('/principal/controls');
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/delete-subject', verifyLoginPrincipal, async (req, res) => {
  try {
    const { subjectId } = req.body;
    await subjectHelpers.deleteSubject(subjectId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/update-subject-mark', verifyLoginPrincipal, async (req, res) => {
  try {
    const { subjectId, mark } = req.body;
    await subjectHelpers.updateSubjectMark(subjectId, mark);
    res.redirect('/principal/controls');
  } catch (error) {
    console.error('Error updating subject mark:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/view-class/:class', verifyLoginPrincipal, async (req, res) => {
  try {
    const studentClass = req.params.class;

    if (!studentClass) {
      return res.status(400).send('Class parameter not provided');
    }

    const workingDays = await teacherHelpers.getWorkingDays();
    const students = await studentHelpers.getAllStudentsByClass(studentClass);

    res.render('teacher/view-class', { principal: true,students, workingDays });
  } catch (error) {
    console.error('Error in /view-class route:', error);
    res.status(500).send('Internal Server Error');
  }
});




module.exports = router;
