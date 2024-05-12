const express = require('express');
const {postLogin,postRegister,getUser} = require('../controller/homeController')
var router = express.Router();

router.post("/login", postLogin);

router.post("/register", postRegister);

router.get("/user",getUser);

module.exports = router;