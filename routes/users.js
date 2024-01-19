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
router.post('/req-admission', verifyLoginUser, (req, res) => {
  req.body.userId = req.session.user._id;
  reqHelpers.insertRequestAdmission(req.body).then((response) => {
      console.log(response);
      res.redirect('/');
  });
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
