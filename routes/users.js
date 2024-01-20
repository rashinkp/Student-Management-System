var express = require('express');
var router = express.Router();
const path = require('path');
var teacherHelpers = require('../helpers/teacher-helpers');
var studentHelpers = require('../helpers/student-helpers');
var announcementHelpers = require('../helpers/announcement-helpers');
var reqHelpers = require('../helpers/req-helpers');
var userHelpers = require('../helpers/user-helpers')
const fs = require('fs');
const { ExplainVerbosity } = require('mongodb');

const verifyLoginUser = (req, res, next) => {
  if (req.session.user && req.session.loggedIn) {
    next();
  } else {
    res.redirect("/user-login");
  }
};
/* GET users listing. */
router.get('/', function(req, res) {
  res.render('user/home',{});
});
router.get('/login',(req,res)=>{
  res.render('user/login')
})
router.get('/admission-req',verifyLoginUser,(req,res)=>{
  res.render('principal/add-student',{user:true})
})
router.post('/req-admission', verifyLoginUser, async (req, res) => {
  try {
    if (req.file) {
      let image = req.file;
      const studentData = req.body;
      const result = await reqHelpers.insertRequestAdmission(studentData);

      const id = result.insertedId; // Get the inserted document's ID

      const destinationPath = path.join(__dirname, '../public/images/student', id + '.jpg');
      
      fs.rename(image.path, destinationPath, (err) => {
        if (!err) {
          res.redirect('/');
        } else {
          console.log(err);
          res.status(500).send('Error moving the file');
        }
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


router.get('/user-login',(req,res)=>{
  res.render('user/user-login')
})

router.post('/user-login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
          req.session.user = response.user;
          req.session.loggedIn = true;
          res.redirect('/');
      } else {
          res.redirect('/user-login');
      }
  });
});
router.get('/user-signup',(req,res)=>{
  res.render('user/user-signup')
})
router.post('/user-signup', (req, res) => {
  userHelpers.addUser(req.body).then((response) => {
      console.log(response);
      res.redirect('/');
  });
});
module.exports = router;
