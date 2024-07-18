const Section = require("../models/Section");
const Course = require("../models/Course");


//=================================================
//<---------------- Create Section ------------>
//=================================================

exports.createSection = async(req, res) => {
   
    try{

        //Data Fetch from request body
        const {sectionName, courseId} = req.body;
        //data Validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //create a new section with the given name
        const newSection = await Section.create({sectionName});
        //update course with section ObjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                         courseId,
                                         {
                                            $push:{
                                                courseContent:newSection._id,
                                            }
                                         },{new:true},
                                        )
        //Hw: use populate to replace sections/sub-sections both in the updatedCourseDetails
        .populate({
            path:"courseContent",
            populate: {
                path: "subSection",
            }
        })
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created Successfully",
            updatedCourseDetails  
        })
    
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Unable to create section, please try again",
            error: error.message,
        })
    }
}



//=================================================
//<---------------- update Section ------------>
//=================================================

exports.updateSection = async(req, res) => {
   
    try{

        //Data input
        const {sectionName, sectionId} = req.body;
        //Data validation
        if(!sectionName || !sectionId){
            return res.status(404).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //update Data
        const section = await Section.findByIdAndUpdate(
                                                    sectionId,
                                                    { sectionName },
                                                    { new: true }
        );
        //return response
        return res.status(200).json({
            success:true,
            message:"Section Updated Successfully",
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section please try again",
            error:error.message,
        })
    }
}

//=================================================
//<---------------- Delete Section ------------>
//=================================================

exports.deleteSection = async(req, res) => {
    
    try{
        //Get ID
        const { sectionId, courseId } = req.body;
        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        //Update course section
        const updatedCourse = await Course.findById(courseId)
        .populate({
            path: "courseContent",
            populate: { 
                path: "subSection"
            }
        }).exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Delete Successfully",
            updatedCourse,
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section please try again",
            error:error.message,
        })
    }
}









