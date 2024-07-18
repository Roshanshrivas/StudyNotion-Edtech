const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

//=================================================
//<---------------- resetpasswordtoken ------------>
//=================================================


exports.resetPasswordToken = async (req, res) => {
   try{
     //Get Email from request Body
     const {email} = req.body;
     //Check user for this email, email validation
     const user = await User.findOne({email : email});
     if(!user){
         return res.json({
             success:false,
             message:"Your Email is not Registered with us"
         })
     }
     //Generate Token
     const token = crypto.randomBytes(20).toString("hex");

     //Update user by adding token and expiration time
     const updatedDetails = await User.findOneAndUpdate(
                                         {email:email},
                                         {
                                             token:token,
                                             resetPasswordExpires: Date.now() + 3600000,
                                         },
                                         {new:true});
    console.log('DETAILS: ', updatedDetails);

     //create url
     const url = `http://localhost:3000/update-password/${token}`;
     //send mail containing the url
     await mailSender(email,
                     "Password Reset Link",
                     `Your link for email verification is ${url}. Please click this url to reset your password.` );
 
     //return response
     return res.json({
         success:true,
         message:"Email Sent Successfully, please Check Your Mail."
     })
   }catch(error){
    console.log(error)
    return res.status(500).json({
        success:false,
        message:"Something went Wrong while reset Password Mail"
    })
   }
}


//=================================================
// <------------------- ResetPassword ------------>
//=================================================


exports.resetPassword = async (req, res) => {
   
    try{

    //Data Fetch
    const {password, confirmPassword, token} = req.body;

    //Validation
    if(password !== confirmPassword) {
        return res.json({
            success:false,
            message:"password not matching",
        })
    }
    //get userdetails from db using token
    const userdetails = await User.findOne({token: token});
    //if no entry - invalid token
    if(!userdetails){
        return res.status(400).json({
            success:false,
            message:"Token is Invalid",
        });
    }
    //token time check
    if(userdetails.resetPasswordExpires < Date.now()) {
        return res.json({
            success:false,
            message:"Token Expired, Please Regenerate with us",
        })
    }
    //Hash Password 
    const encryptedPassword = await bcrypt.hash(password, 10);

    //Password update
    await User.findOneAndUpdate(
        {token: token},
        {password: encryptedPassword},
        {new:true},
    );

    //return response
    return res.status(200).json({
        success:false,
        message:"Password Reset Successfully",
    })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Something went Wrong while reset Password Mail"
        })
    }
}













