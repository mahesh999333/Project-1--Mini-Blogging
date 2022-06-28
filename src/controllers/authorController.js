const authorModel = require("../models/authorModel")
const validator = require('validator');
const jwt = require('jsonwebtoken')

// Checks the validity of requested body is string or not
const stringV = function(value) {
    if (typeof value === undefined || value === null) return true
    if (typeof value === 'string' && value.trim().length === 0) return true
    return false
}

const createAuthor = async function(req, res) {
    try {

        const { fname, lname, title, emailId, password } = req.body

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, msg: "Please enter all the details(fname, lname, title, emailId, password)." })
        }

        if (stringV(fname) || !validator.isAlpha(fname)) {
            return res.status(400).send({ status: false, msg: "First name is not valid" })
        }
        if (stringV(lname) || !validator.isAlpha(lname)) {
            return res.status(400).send({ status: false, msg: "Last name is not valid" })
        }

        if ((title != 'Mr') && (title != 'Mrs') && (title != 'Miss')) {
            return res.status(400).send({ status: false, msg: "Please enter the correct title (Mr, Mrs, Miss)" })
        }

        if (stringV(emailId) || !validator.isEmail(emailId)) {
            return res.status(400).send({ status: false, mgs: `${emailId}: Email not in correct format.` })
        }

        let duplicate = await authorModel.findOne({ emailId: emailId })
        if (duplicate) {
            return res.status(400).send({ status: false, msg: `${emailId}: Already registered email.` })
        }

        if (stringV(password)) {
            return res.status(400).send({ status: false, msg: "Password is not in correct format" })
        }

        if (password.length < 8) {
            return res.status(400).send({ status: false, msg: "Password should have atleast 8 charactes." })
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).send({ status: false, msg: "Kindly use atleast one uppercase alphabets, numbers and special characters for strong password." })
        }

        let duplicatePassword = await authorModel.findOne({ password: password })

        if (duplicatePassword) {
            return res.status(400).send({ status: false, msg: "Password is very common, try to use different password." })
        }

        let saveData = await authorModel.create(req.body)

        res.status(201).send({ status: true, data: saveData })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const login = async(req, res) => {
    try {
        const { emailId, password } = req.body

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, msg: "Invalid request. Kindly provide details" })
        }

        if (stringV(emailId)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        }

        let author = await authorModel.findOne({ emailId: emailId }).select({ emailId: 1, password: 1 })
        if (!author) {
            return res.status(400).send({ status: false, msg: "Please enter correct email." })
        }

        if (stringV(password)) {
            return res.status(400).send({ status: false, msg: "Password is required" })
        }

        if (password !== author.password) {
            return res.status(401).send({ status: false, msg: "Invalid login credentials. Kindly enter the correct password." })
        }

        let token = jwt.sign({ authorId: author._id.toString(), batch: "Radon" }, //payload
            "mahesh-rajat-blog" //secret key
        );
        res.setHeader("x-api-key", token)
        res.status(201).send({
            status: true,
            msg: "Author login successfull",
            data: { token }
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports.createAuthor = createAuthor
module.exports.login = login