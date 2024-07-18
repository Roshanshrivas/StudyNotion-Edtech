const Category = require("../models/Category");


//=================================================
//<-------------------- createTag ---------------->
//=================================================


exports.createCategory = async(req, res) => {
    try{
        //fetch Data from request body
        const {name, description} = req.body;
        //Validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All Fields Required",
            })
        }
        //Create Entry in DB
        const CategoryDetails = await Category.create({
            name:name,
            description:description,
        })
        console.log(CategoryDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:"Category Created Successfully",
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: "Create Category Failed, please try again",
        });
    }
};


//=================================================
//<--------- GetAllTags Handler Function --------->
//=================================================

exports.showAllCategories = async(req, res) => {
   
    try{

        const allCategories = await Category.find(
            {}, 
            {name:true, description:true});

        res.status(200).json({
            success:true,
            message:"All Categories Return Successfylly",
            data: allCategories,
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


//=================================================
//<-------------- categoryPageDetails ------------>
//=================================================

exports.categoryPageDetails = async (req, res) => {
    try {
        //fetch categoryId from request body
        const { categoryId } = req.body;
        // Get Courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
        .populate("courses")
        .exec();
        console.log(selectedCategory);
        
        //Handle the case when the category is not found
        if(!selectedCategory) {
            console.log("Category not found");
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Handle the case when there are no courses
        if(selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category");
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category",
            });
        }

        const selectedCourses = selectedCategory.courses;

        //Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        }).populate("courses");
        let differentCourses = [];
        for (const category of categoriesExceptSelected) {
            differentCourses.push(...category.courses);
        }

        //Get Top-selling courses across all categories
        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10);

        //Return response
        res.status(200).json({
            selectedCourses: selectedCourses,
            differentCourses: differentCourses,
            mostSellingCourses: mostSellingCourses,
        })

        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}













