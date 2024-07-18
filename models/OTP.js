const mongoose = require("mongoose");
const mailSender = require('../utils/mailSender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');


const OTPSchema = new mongoose.Schema({

    email : {
        type: String,
        required: true,
    },

    otp: {
        type: String,
        required: true,
    },

    createdAt: {
        type: String,
        default: Date.now(),
        expires: 60 * 5, //The document will be automatically deleted after 5-minutes of its creation
    }
});


//async function -> to send emails
async function sendVerificatonEmail(email, otp) {
  //Create a transporter to send emails

  //Define the email options

  //send the email

  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email From StudyNotion",
      emailTemplate(otp)
    );
    console.log("Email send Successfully ", mailResponse);
  } catch (error) {
    console.log("Error Occured while sendi mails: ", error);
    throw error;
  }
}


//Defining a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function(next) {
    console.log("New document saved to the database");

    //only send an email when a new document is created 
   if(this.isNew) {
    await sendVerificatonEmail(this.email, this.otp);
   }
    next();
})


module.exports = mongoose.model("OTP", OTPSchema);










