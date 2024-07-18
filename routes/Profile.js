const express = require('express');
const router = express.Router();

const { auth } = require("../middlewares/auth");


//<===============================================>
//<============[ Profile Controllers ]============>
//<===============================================>

const { 
     updateProfile, 
     deleteAccount, 
     getAllUserDetails,
     updateDisplayPicture,
     getEnrolledCourses,
    } = require("../controllers/Profile");



//<===============================================>
//<================[ Profile Routes ]=============>
//<===============================================>

//Routes for Delete User Account
router.delete('/deleteAccount', auth, deleteAccount);
// routes of update the profile
router.put('/updateProfile', auth, updateProfile);
// routes for getting all the user information for particular user
router.get('/getAllUserDetails', auth, getAllUserDetails);


//Get Enrolled Courses
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);

module.exports = router;