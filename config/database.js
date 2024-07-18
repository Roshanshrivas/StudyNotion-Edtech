const mongoose = require("mongoose");

//Require Dotenv
require("dotenv").config();

exports.connectDB = () => {
    mongoose.connect(process.env.MONGODB_URL, {
    }).then(() => {
        console.log("Database connect Success");
    }).catch((error) => {
        console.log(error);
        console.log("Database connection Faild!!");
        process.exit(1);
    })
};












