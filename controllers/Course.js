const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");


//=================================================
// <-------- createCourse handler function ------->
//=================================================

exports.createCourse = async (req, res) => {
 
    try{

        //Get all required fields from request body
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
            category,
            instructions,
        } = req.body;

        //get Thumbnail image from request files
        const thumbnail = req.files.thumbnailImage;

        // Convert the tag and instructions from stringified Array to Array
        console.log("tag", tag);

        //Validation -> check if any of the required fields are missing
        if(!courseName 
        || !courseDescription
        || !whatYouWillLearn
        || !price
        || !category
        || !tag
        || !thumbnail
    
      ) {
            
        return res.status(400).json({
                success:false,
                message:"All Fields Are Required",
            });
        }

        //check if the user is an instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });
        console.log("Instructor Details")
        //TODO: Verify that userId and instructorDetails._id are same or diffrent ?


        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Details Not Found",
            });
        }

        //Check Given Category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category Details Not Found",
            });
        }

        console.log(categoryDetails);

        //Upload Images to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail, 
            process.env.FOLDER_NAME 
        );
        console.log("Thum", thumbnailImage);

        //create an entry for new Course with the given details
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            Category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            instructions: instructions,
        });

        //Add the new Course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );


        //Update the category ka schema-HW-Done
        //Add the new course to the categories
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    course: newCourse._id,
                },
            },
            {new: true},
        );
        

        //return response the new course and a success message
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });


    }
    catch(error){
        //Handle any errors that occur during the creation of the course
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'failed to create course',
            error:error.message,
        })
    }
}



//=================================================
// <------ getAllCourses handler function -------->
//=================================================


exports.getAllCourses = async(req, res) => {
    
    try {
        //TODO: Change the below statement
        const allCourses = await Course.find({}, 
                                   {courseName:true,
                                    price:true,
                                    thumbnail:true,
                                    instructor:true,
                                    ratingAndReviews:true,
                                    studentsEnrolled:true,
                                   }).populate("instructor")
                                     .exec();
         return res.status(200).json({
            success:true,
            message:"Data For All Courses fetched successfully",
            data:allCourses,
         })                            
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot Fetch Course Data",
            error:error.message,
        })
    }
}


//=================================================
// <------ getCourseDetails handler function ------>
//=================================================


exports.getCourseDetails = async (req, res) => {
    try {
        //get id
        const { courseId } = req.body;
        //find course details
        const courseDetails = await Course.find(
            {_id:courseId}
        ).populate(
            {
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            }
        )
        .populate("category")
        //.populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        //validation
        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Details Fetched Successfully",
            data:courseDetails,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}










