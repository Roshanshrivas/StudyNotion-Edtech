const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//=================================================
//<---------------- Create SubSection ------------>
//=================================================

exports.createSubSection = async (req, res) => {
  try {
    //Fetch Data from request body
    const { sectionId, title, description } = req.body;
    //Extraxt file/video
    const video = req.files.video

    console.log(video);
    
    //Validation- Check if all necessary fields are provided
    if( !sectionId || !title || !description || !video) {
        return res.status(400).json({
            success:false,
            message:"All Fields Are required",
        });
    }

    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
    //create a subsection with necessary information
    const newSubSection = await SubSection.create({
        title:title,
        description:description,
        timeDuration:`${uploadDetails.duration}`,
        videoUrl:uploadDetails.secure_url,
    })

    console.log("newSubSection", newSubSection);

    //update section with this subsection ObjectId
    const updateSubSection = await Section.findByIdAndUpdate(
                                                        {_id: sectionId},
                                                        {$push: {
                                                            subSection: newSubSection._id,
                                                        }},
                                                          {new:true}).populate("subSection")
    //Hw: log updated section here, after adding populate query

    console.log(updateSubSection);

    
    //return response
    return res.status(201).json({
        success:true,
        message:"Sub Section Create Successfully",
        data: updateSubSection,
    })

  } catch(error){
    //Handle any error that may occur duing the process
    console.log("error in creating a sub section ", error)
    return res.status(500).json({
        success:false,
        message:"Not Able to create a sub section",
        error:error.message,
    })
  }
};

//=================================================
//<---------------- Update SubSection ------------>
//=================================================

exports.updateSubSection = async(req, res) => {
    try{
        //Data input
        const {title, description, sectionId} = req.body;
        const subSection = await SubSection.findById(sectionId);

        //Validation
        if(!subSection){
            return res.status(404).json({
                success:false,
                message:"SubSection Not Found",
            });
        }

        if(title !== undefined){
            subSection.title = title;
        }

        if(description !== undefined){
            subSection.description = description;
        }

        if(req.files && req.files.video !== undefined){
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME,
            )
            subSection.videoUrl =  uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save();

        //return response
        return res.status(200).json({
            success:true,
            message:"Section updated Successfully",
        });

    } catch(error){
        return res.status(500).json({
            success:false,
            message: "An error occurred while updating the section",
            error:error.message,
        })
    }
}




//=================================================
//<---------------- Delete SubSection ------------>
//=================================================

exports.deleteSubSection = async(req, res) => {
    try{
    //Get ID
    const {subSectionId, sectionId} = req.body;
    //validation
    // if(!subSectionId || !sectionId){
    //     return res.status(404).json({
    //         success:false,
    //         message:"All Fields are require",
    //     })
    // }

    //$pull is remove any arrys in MOngoDB

    //SectionId findByIdAndUpdate -> remove subsection
    await Section.findByIdAndUpdate(
        {_id: sectionId},
        {
            $pull:{
                subSection: subSectionId,
            },
        }
    )

    //SubSection findByIdAndDelete
    const subSection = await SubSection.findByIdAndDelete({_id: subSectionId});

    if(!subSection){
        return res.status(404).json({
            success:false,
            message:"SubSection Is Not Found",
        })
    }

    //Return Reponse
    return res.status(200).json({
        success:true,
        message:"SubSection Deleted SuccessFully",
    })
        
    }catch(error){
        return res.status(500).json({
            success:false,
            message: "An Error Occurred While Deleting the SubSection",
            error:error.message,
        })
    }
}




