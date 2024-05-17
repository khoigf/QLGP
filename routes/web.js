const express = require('express');
const {postLogin,postRegister,getUser,getLogout,addRelative,
    getInfo,getAllInfo,getDetailInfo,updateFieldValues,
    addField} = require('../controller/homeController')
var router = express.Router();

router.post("/login", postLogin);

router.post("/register", postRegister);

router.get("/user",getUser);

router.get("/logout",getLogout);

router.post("/addRelative", addRelative);

router.get("/info",getInfo);

router.get("/allInfo",getAllInfo);

router.get("/detailInfo",getDetailInfo);

router.post("/updateFValue", updateFieldValues);

router.post("/addField", addField);

module.exports = router;