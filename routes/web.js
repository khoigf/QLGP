const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {postLogin,postRegister,getUser,getLogout,addRelative,
    getInfo,getAllInfo,getDetailInfo,updateFieldValues,
    addField,updateField,deleteField,drawFTree,getBaseInfPPUcomingEvts,getUpcomingEvents,
    updateUpcomingEvent,getBackup,postRestore} = require('../controller/homeController')
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

router.post("/updateField", updateField);

router.post("/deleteField", deleteField);

router.post("/drawFTree",drawFTree);

router.get("/baseInfPPUComingEvts", getBaseInfPPUcomingEvts);

router.get("/getUpcomingEvents",getUpcomingEvents);

router.post("/updateUpcomingEvent",updateUpcomingEvent);

router.get("/getBackup",getBackup);

router.post("/postRestore",upload.single('file'),postRestore);

module.exports = router;