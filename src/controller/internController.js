const collegeModel = require('../model/collegeModel')
const internModel = require('../model/internModel')
const validator = require('../validator/validator')


const createIntern = async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin','*')
    try {
        let internData = req.body

        // BODY VALIDATION
        if (!validator.isValidRequestBody(internData)) {
            return res.status(400).send({ status: false, msg: "Intern details is required !" })
        }

        // NAME VALIDATION
        if (!validator.isValidField(internData.name)) {
            return res.status(400).send({ status: false, msg: "Name is required" })
        }
        if (!validator.isValidName(internData.name)) {
            return res.status(400).send({ status: false, msg: "Name is not valid" })
        }

        // EMAIL VALIDATION
        if (!validator.isValidField(internData.email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        }
        if (!validator.isValidEmail(internData.email)) {
            return res.status(400).send({ status: false, msg: "Enter valid email id" })
        }
        let emailExist = await internModel.findOne({ email: internData.email })
        if (emailExist) {
            return res.status(400).send({ status: false, msg: "Email is already registered" })
        }

        // MOBILE VALIDATION
        if (!validator.isValidField(internData.mobile)) {
            return res.status(400).send({ status: false, msg: "Enter mobile number" })
        }
        if (!validator.isValidMobile(internData.mobile)) {
            return res.status(400).send({ status: false, msg: "Enter valid Mobile Number" })
        }
        let mobileExists = await internModel.findOne({ mobile: internData.mobile })
        if (mobileExists) {
            return res.status(400).send({ status: false, msg: "Mobile has been already registered" })
        }



        // CREATE INTERN DATA
        let checkCollege = await collegeModel.findOne({ name: internData.collegeName, isDeleted: false })
        if (!checkCollege) return res.status(400).send({ msg: "collage not exists" })

        internData.collegeId = checkCollege._id
        let createdIntern = await internModel.create(internData)

        let result = {}

        //To add multiple key/value pairs to an object in the same statement, use the Object.assign()
        Object.assign(result, {
            isDeleted: createdIntern.isDeleted,
            name: internData.name.trim(),
            email: internData.email,
            mobile: internData.mobile,
            collegeId: internData.collegeName
        })

        return res.status(201).send({ status: true, data: createdIntern })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.createIntern = createIntern
