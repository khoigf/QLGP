const express = require('express');
const {postLogin,postRegister,getUser,getLogout} = require('../controller/homeController')
var router = express.Router();

router.post("/login", postLogin);

router.post("/register", postRegister);

router.get("/user",getUser);

router.get("/logout",getLogout);

module.exports = router;