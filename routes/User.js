//Import the required modules
const express = require('express');
const router = express.Router();

//Import the required controllers and  middleware functions
const {
    login,
    signup,
    sendotp,
    changePassword
} = require("../controllers/Auth");

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");


const { auth } = require("../middlewares/auth");


//<===============================================>
//<===========[ Authentication Routes ]===========>
//<===============================================>

//Route for user login
router.post('/login', login);

//Route for user signUp
router.post('/signup', signup);

//Route for sending OTP to the user's email
router.post('/sendotp', sendotp);

//Route for changePassword
router.post('/changepassword', auth, changePassword);



//<===============================================>
//<===========[ Reset Password Routes ]===========>
//<===============================================>

//Route for generating a reset password token
router.post('/reset-password-token', resetPasswordToken);


//Route for resetting user's password after verification
router.post('/reset-password', resetPassword);


module.exports = router;