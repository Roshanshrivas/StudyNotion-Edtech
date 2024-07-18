const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


//=================================================
// <--------------- auth Middleware -------------->
//=================================================


exports.auth = async (req, res, next) => {
    try{
        //Extract Token
        const token = req.cookies.token 
                     || req.body.token
                     || req.header("Authorisation").replace("Bearer ", "");
   
        //Token Missing, then return response
        if(!token){
            return res.status(401).json({
                success:false,
                message: "Token is Missing",
            });
        }

        //Verify Token
        try {
            const decode = jwt.verify(token, process.env.SECRET_KEY);
            console.log(decode);
            req.user = decode;
            
        } catch (error) {
            //Verification - issues
            return res.status(401).json({
                success:false,
                message:"Token is invalid",
            });
            
        }
        next();
   
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while validating the token",
        });
    };
}


//=================================================
// <------------- isStudent Middleware ----------->
//=================================================


exports.isStudent = async(req, res, next) => {
    try {

        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student only",
            })
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verify, please try again"
        })
    }
}


//=================================================
// <------------ isInstructor Middleware --------->
//=================================================


exports.isInstructor = async(req, res, next) => {
    try {

        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student only",
            })
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verify, please try again"
        })
    }
}


//=================================================
// <---------------- isAdmin Middleware ---------->
//=================================================


exports.isAdmin = async(req, res, next) => {
    try {

        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student only",
            })
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verify, please try again"
        })
    }
}











