const express = require('express');
const {getHomepage,postLogin,postRegister,getUserHomepage} = require('../controller/homeController')
var router = express.Router();

router.get('/', getHomepage);

router.post("/login", postLogin);

router.post("/register", postRegister);

router.get('/user/:uid',getUserHomepage);
  
module.exports = router;