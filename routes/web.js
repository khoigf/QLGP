const express = require('express');
const {postLogin,postRegister} = require('../controller/homeController')
var router = express.Router();

router.post("/login", postLogin);

router.post("/register", postRegister);

  
module.exports = router;