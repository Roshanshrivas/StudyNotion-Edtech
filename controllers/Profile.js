const Profile = require("../models/Profile");
const User = require("../models/User");
const {uploadImageToCloudinary} = require('../utils/imageUploader');



//=================================================
//<------------- updateProfile Function ---------->
//=================================================


exports.updateProfile = async(req, res) => {
    
    try{
        //Fetch Data From Request Body
        const {dateOfBirth="", about="", contactNumber, gender=""} = req.body;
        //Get UserId
        const id = req.user.id;
        
        //Find the Profile by id
        const userDetails = await User.findById(id);
        const profile = await Profile.findById(userDetails.additionalDetails);

        //Update Profile fields
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.gender = gender;
        profile.contactNumber = contactNumber;


        //Save the updated profile
        await profile.save();

        //return response
        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfuly",
            profile,
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Errorin updating profile",
            error: error.message,
        })
    }
}


//=================================================
//<------------- Delete Acount Function ---------->
//=================================================

//Explore -> How can we schedule this delete operation

exports.deleteAccount = async(req, res) => {
    
    try{
        //TODO: Find More on Job Schedule
        //const job = schedule.scheduleJob("10 * * * * *", function () {
        // console.log("The answer to life, the universe, and everything!");
        // });
        // console.log(job);


        //get id
        const id = req.user.id;
        //validation
        const user = await User.findById({_id: id});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }
        //delete associated profile with user
        await Profile.findByIdAndDelete({_id: user.additionalDetails});
        //TODO:HW unenroll user form all enrolled courses
        //Now delete user
        await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully",
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"User Cannot be delete",
            error: error.message
        })
    }
}


//=================================================
//<---------------- getAllUserDetails ------------>
//=================================================


exports.getAllUserDetails = async(req, res) => {
   
    try{
        //get id
        const id = req.user.id;
        //validation and get user details
        const userDetails = await User.findById(id)
          .populate("additionalDetails")
          .exec();
          console.log(userDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"User Data fetched successfully",
            data: userDetails,
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"All userDetails Error!",
            error:error.message,
        });
    }
}


//=================================================
//<-------------- updateDisplayPicture ------------>
//=================================================

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        console.log(displayPicture);
        
        const userId = req.user.id;
        console.log(userId);

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000, 
            1000
        )
        console.log(image);

        const updatedProfile = await User.findByIdAndUpdate(
            {_id: userId},
            {image: image.secure_url},
            {new: true}
        )
        console.log(updatedProfile);


        res.send ({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })

    } catch (error) {
        console.log("File not uploaded error!!");
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


//=================================================
//<-------------- getEnrolledCourses ------------>
//=================================================


exports.getEnrolledCourses = async (req, res) => {
    try {
        //Get Id
        const userId = req.user.id;
        //Fetch UserId
        const userDetails = await User.findOne({
            _id: userId,
        })
        .populate('courses')
        .exec()

        //Validation
        if(!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could Not Find User With Id: ${userDetails}`,
            })
        }

        //return response
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
