const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");


//<-------------------------    ------------Authentication---------------------------------------------->

const auth = async function(req, res, next) {

    try {
        let token = req.headers["x-Api-key"]
        if (!token) token = req.headers["x-api-key"]

        if (!token) { return res.status(400).send({ status: false, msg: "Token must be present in request headers" }) }

        try {
            let decodedToken = jwt.verify(token, "mahesh-rajat-blog")

        } catch (error) {
            return res.status(401).send({ status: false, msg: error.message })
        }

        let authorIdParams = req.params.authorId
        let authorIdQuery = req.query.authorId
        let details = await authorModel.findById(authorIdParams || authorIdQuery)

        if (!details) {
            return res.status(401).send({ status: false, msg: "Author is not exist" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

    next()
}

//<-----------------------------Authorization to user to only its own data------------------------------------>

const authorisation = async function(req, res, next) {

    try {
        let token = req.headers["x-Api-key"];
        if (!token) token = req.headers["x-api-key"];

        // try {
        //     let decodedToken = jwt.verify(token, "mahesh-rajat-blog");
        //     console.log(decodedToken)
        // } catch (error) {
        //     return res.status(500).send({ status: false, msg: "Token is Invalid" })
        // }

        let decodedToken = jwt.verify(token, "mahesh-rajat-blog");
        let authorIdParams = req.params.authorId
        let authorIdQuery = req.query.authorId
            //userId for the logged-in user
        let authorLoggedIn = decodedToken.authorId

        //userId comparision to check if the logged-in user is requesting for their own data

        if ((authorIdParams != authorLoggedIn) || (authorIdQuery != authorLoggedIn)) {

            return res.send({ status: false, msg: 'Access is Denied' })

        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }


    next()
}

module.exports.auth = auth
module.exports.authorisation = authorisation