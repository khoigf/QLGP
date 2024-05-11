const express = require('express');
const {getHomepage,getKhoi,postLogin,postResigter,getUserHomepage} = require('../controller/homeController')
var router = express.Router();

router.get('/', getHomepage);
  
router.get('/khoi', getKhoi);

router.post("/login", postLogin);

router.post("/register", postResigter);

router.get('/user/:uid',getUserHomepage);
  
module.exports = router;