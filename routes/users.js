var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('user/home',{});
});
router.get('/login',(req,res)=>{
  res.render('user/login');
})

module.exports = router;
