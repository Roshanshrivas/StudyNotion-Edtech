const User = require("../models/User");
const Profile = require("../models/Profile")
const OTP = require("../models/OTP");
const otpGenerator = require('otp-generator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")

require("dotenv").config();


//=================================================
// <------------------ SendOTP -------------------->
//=================================================


exports.sendotp = async (req, res) => {
    
    try {

        //fetch email from request body
        const {email} = req.body;

        //chech if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user already exist, then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered",
        })
    }

    //OTP Generator
    // This OTP Code is used only learning base beacuse comapnys are paid third party OTP generators so all times generate unique OTP.


    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP Generated: ", otp);

    //check unique otp or not
    const result = await OTP.findOne({otp: otp});

    while(result) {
        otp = otpGenerator(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        result = await OTP.findOne({otp : otp});
    }

    const otpPayload = {email, otp};

    //create an entry For OTP in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response Successfull
    res.status(200).json({
        success:true,
        message: "OTP Sent Successfully",
        otp,
    });


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};



//=================================================
// <------------------ Sign Up -------------------->
//=================================================


exports.signup = async (req, res) => {

 try {
    
    //fetch Data from reques body
    const {
        firstName, 
        lastName, 
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
        } = req.body;

    
    //Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    //Password Compare & Verify
    if(password !== confirmPassword) {
        return res.status(400).json({
            success:false,
            message:"Password and confirmPassword value does not match, please Try again",
        })
    }


    //check User already register

    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User is Already Register",

        });
    }
    
    //find most recent OTP stored for the user
    const response = await OTP.find({email}).sort({createdAt: -1}).limit(1);
    console.log('Response: ', response);

    //Validation OTP
    if(response.length == 0){
        //OTP Not Found
        return res.status(400).json({
            success:false,
            message:"OTP Not Found"
        });
    }else if(otp !== response[0].otp) {
        //Invalid OTP
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        })
    }


    //HashPassword
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create the user
    let approved = '';
    approved === 'Instructor' ? (approved = false) : (approved = true);


    //Entry create in DB
    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth: null,
        about:null,
        contactNumber:null,
    })

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountType: accountType,
        approved: approved,
        contactNumber,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    //return response

    return res.status(200).json({
        success:true,
        user,
        message:"User Registered Successfully"
    })


} catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message: "User cannot be registered, please Try Again!!",
    })
   
}

}


//=================================================
// <------------------- Login -------------------->
//=================================================


exports.login = async(req, res) => {
    
    try{

    //Get Data From Request Body
    const {email, password} = req.body;
    
    //Validation
    if(!email || !password){
        return res.status(403).json({
            success:false,
            message:"All Fields Are Required",
        });
    }
    //check User Exist or Not
    const user = await User.findOne({email}).populate("additionalDetails");
    if(!user){
        return res.status(401).json({
            success:false,
            message:"User is Not Registered, please SignUp First",
        });
    }
    //Generate JWT after Password Compare
    if( await bcrypt.compare(password, user.password)){
       
        const payload = {
            email:user.email,
            id:user._id,
            accountType:user.accountType,
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn:"24h",
        });

        //save token to user document in database
        user.token = token;
        user.password = undefined;
        

        //Create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true,
        }

        res.cookie("token", token, options).status(200).json({
            success:true,
            token,
            user,
            message:"Logged in Successfully"
        })
    }
    else {
         return res.status(401).json({
            success:false,
            message:"Password is Incorrect",
        });
    }

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure, please Try Again!!",
        });
    };
};


//=================================================
//<--------------- changepassword ---------------->
//=================================================

//HomeWork

exports.changePassword = async (req, res) => {
    try {
        
    //Get Data From Req.Body
    const userDetails = await User.findById(req.user.id);

    //get oldPassword, newPassword, confirmPassword
    const {oldPassword, newPassword} = req.body;

    //Validation
    const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

    //IF old password not match, return a Error
    if(!isPasswordMatch){
        return res.status(401).json({
            success:false,
            message: "The Password is Incorrect"
        })
    }

    //Update password in Database
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new : true }
    )

    //sendMail - send notification email
    try{

        const emailResponse = await mailSender(
            updatedUserDetails.email,
            `Password updated Successfully For 
            ${updatedUserDetails.firstName} 
            ${updatedUserDetails.lastName}`,
            passwordUpdated(
                updatedUserDetails.email,
                updatedUserDetails.firstName,
            )
        )
        console.log("Email Sent Successfully.....", emailResponse);

    }catch(error){
        console.log("Error Occurred while sending email: ", error);
        return res.status(500).json({
            success:false,
            message:"Error occurred while sending email",
        })
    }

    //Return Response
    return res.status(200).json({
        success:true,
        message:"Password Update Successfully",
    })

    } catch (error) {
    //if there's an error updating the password, log the error and return 500 (Internal Server Error) error
    console.error('Error Occurred While Updating Password', error);
    return res.status(500).json({
        success:false,
        message: "Error Occurred while updating the password",
        error: error.message,
    })
        
    }
}




























