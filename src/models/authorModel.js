const mongoose = require('mongoose');
const validator = require('validator');

const authorSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: "First name is required",
        trim: true
    },
    lname: {
        type: String,
        required: "Last name is required",
        trim: true
    },
    title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss"],
        required: "Title is required"
    },
    emailId: {
        type: String,
        unique: true,
        required: "Email is required",
        trim: true,
        lowercase: "true",
        validate: function(emailId) {
            if (!validator.isEmail(emailId)) return true
            return "Please fill a valid email address."
        }
    },
    password: {
        type: String,
        required: "Password is required",
        trim: true
    },

}, { timestamps: true });

module.exports = mongoose.model('Auther', authorSchema)