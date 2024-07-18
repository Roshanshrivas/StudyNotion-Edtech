const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    courseName:{
        type:String,
        required: true,
        trim: true,
    },

    courseDescription: {
        type:String,
        required: true,
        trim: true,
    },

    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    whatYouWillLearn: {
        type: String,
        required: true,
        trim: true,
    },

    courseContent: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Section",
        }
    ],

    ratingAndReviews : [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        }
    ],

    price: {
        type: Number,
        required: true,
        trim: true,
    },

    thumbnail: {
        type: String,
    },

    tag: {
        type: [String],
        required: true,
        trim: true,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        //required: true,
        ref: "Category",
    },

    studentsEnrolled: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        }
    ],

    instructions: {
        type: [String],
    },

    status: {
        type: String,
        enum: ["Draft", "Published"],
    },

    createdAt: {
        type: Date,
        Date: Date.now
    }

});

module.exports = mongoose.model("Course", courseSchema);

