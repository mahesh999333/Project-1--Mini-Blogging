const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const validator = require('validator');
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");


const stringV = function (value) {
    if (typeof value === undefined || value === null) return true
    if (typeof value === 'string' && value.trim().length === 0) return true
    return false
}

const idV = function (value) {
    let a = validator.isMongoId(value)
    if (!a) {
        return true
    } else return false
}

//<--------------------------------------------Creating Blog------------------------------------------------->

const createBlog = async function (req, res) {

    try {
        const { title, body, authorId, tags, category, subcategory, isPublished } = req.body

        if ((authorId) == null) {
            return res.status(400).send({ status: false, msg: "Invalid Request" })
        }

        if (stringV(title)) {
            return res.status(400).send({ status: false, msg: "Title is not valid" })
        }
        if (stringV(body)) {
            return res.status(400).send({ status: false, msg: "Body is not valid" })
        }

        if (stringV(authorId) || idV(authorId)) {
            return res.status(404).send({ status: false, msg: "Author ID is not valid." })
        }

        if (typeof (tags) !== `object`) {
            return res.status(400).send({ status: false, msg: "Tags are not valid" })
        }

        if (stringV(category) || !validator.isAlpha(category)) {
            return res.status(400).send({ status: false, msg: "Category is not valid" })
        }

        if (typeof (subcategory) !== `object`) {
            return res.status(400).send({ status: false, msg: "Sub-Category is not valid" })
        }

        let a = await authorModel.findById(authorId).select({ _id: 1 })
        if (a == null) {
            return res.status(400).send({ status: false, msg: "Author doesn't exist's." })
        }

        if (isPublished === true) {
            req.body.publishedAt = Date.now()
            let saveData = await blogModel.create(req.body)
            return res.status(201).send({ status: true, data: saveData })
        }

        let saveData = await blogModel.create(req.body)
        return res.status(201).send({ status: true, data: saveData })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


//<--------------------------------------------Get Blog details------------------------------------------------->

const getblogs = async (req, res) => {
    try {
        let result = { isDeleted: false, isPublished: true }
        let { authorId, category, tags, subcategory } = req.query
        if (Object.keys(req.query) !== 0) {
            if (authorId) {
                if (stringV(authorId) && idV(authorId)) {
                    return res.status(400).send({ status: false, msg: "Enter valid authorId" })
                } else {
                    result.authorId = authorId
                }
            }

            if (stringV(category)) {
                result.category = category
            }

            if (tags) {
                result.tags = { $in: [tags] }
            }
            if (subcategory) {
                result.subCategory = { $in: [subcategory] }
            }
        }
        let blog = await blogModel.find(result)
        if (blog.length === null) {
            return res.status(404).send({ status: true, msg: "No document found." })
        }


        return res.status(200).send({ status: true, data: blog })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//<--------------------------------------------Update Blog------------------------------------------------->

const updateBlog = async function (req, res) {

    try {
        let final = {}
        let data = req.params.blogId
        const { title, body, tags, subCategory } = req.body

        if (!(title || body || tags || subCategory)) {
            return res.status(400).send({ status: false, msg: "Please enter details (Title, Body, tags, subCategory)." })
        }

        let b = await blogModel.findOne({ _id: data })
        if (b.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "Blog is deleted" })
        }
        if (title)  { final.title = title }
        if (stringV(title)) {
            return res.status(400).send({ status: false, msg: "Title is not valid" })
        }
        if (body) { final.body = body }
        if (stringV(body)) { return res.status(400).send({ status: false, msg: "Body is not valid" }) }

        if (tags) {
            b.tags.push(tags)
            final.tags = b.tags
        }
        if (stringV(tags)) { return res.status(400).send({ status: false, msg: "Tags is not valid" }) }
        
        if (subCategory) {
            b.subCategory.push(subCategory)
            final.subCategory = b.subCategory
        }
        //console.log(final)
        // if (isPublished) {
        //     final.isPublished = true
        // }
        // if (publishedAt) {
        //     final.isPublished = Date.now()
        // }
        final.publishedAt = Date.now()
        final.isPublished = true
        let result = await blogModel.findOneAndUpdate({ _id: data }, final, { new: true })
        // console.log(result)
        return res.status(200).send({ status: true, data: result })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}






// const updateBlog = async function(req, res) {

//    try{

//     let authorTokenId = req.authorId
//     // getting blog Object id from params
//     let blogId = req.params.blogId  

//     if(idV(blogId)){
//         return  res.status(400).send({ status: false, msg: "Please provide a valid Blog id" })
//     }

//     // This blogId is present in db or not
//     let blog = await blogModel.findById(blogId)    
//     if(blog.authorId.toString()!==authorTokenId){
//         return res.status(403).send({ status: false, msg: "you are not autharise for Update anoter person data" })
//     }
//       //if not present then send error mess
//     if (!blog || blog.isDeleted == true) {
//         return res.status(404).send({ status: false, msg: "No such blog exists" });
//     }

//     // getting all the requested data form body for updatation
//     let blogData = req.body;


//    }
//    catch (error) {
//     console.log(error)
//     return res.status(500).send({ status: false, msg: error.message })
// }
// }


//<--------------------------------------Delete Blog by Path Parameters---------------------------------------->

const deleteBlogByParams = async function (req, res) {
    try {
        let data = req.params.blogId

        let b = await blogModel.findById(data).select({ _id: 1, isDeleted: 1 })

        if (b.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "Blog already deleted" })
        }

        let a = await blogModel.updateOne({ _id: data, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() })
        return res.status(200).send({ status: true, data: "The blog is deleted" })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


//<--------------------------------------------Delete Blog by Query Parameters------------------------------------------------->

const deleteBlogByQuery = async function (req, res) {
    try {
        const { category, authorId, isPublished, tags, subcategory } = req.query
        const result = { isDeleted: false }

        if (Object.keys(req.query).length === 0) {
            return res.status(400).send({ status: false, msg: "No blog to be deleted. Aborting deletion" })
        }

        if (stringV(authorId) || idV(authorId)) {
            return res.status(400).send({ status: false, msg: "Author ID is not valid." })
        }
        //console.log(authorId)

        let b = await blogModel.find({ authorId: authorId }).select({ _id: 1, isDeleted: 1 })

        if (b == null) {
            return res.status(404).send({ status: false, msg: "Blog document doesn't exists." })
        }

        let token = req.headers["x-Api-key"]
        if (!token) token = req.headers["x-api-key"]
        let decodedToken = jwt.verify(token, "mahesh-rajat-blog");


        let authorLoggedIn = decodedToken.authorId

        if (authorId != authorLoggedIn) {

            return res.status(403).send({ status: false, msg: 'Access is Denied' })

        }

        if (authorId) {
            if (stringV(authorId) && idV(authorId)) {
                return res.status(400).send({ status: false, msg: "Enter valid authorId" })
            } else {
                result.authorId = authorId
            }
        }

        if (stringV(category)) {
            result.category = category
        }

        if (tags) {
            result.tags = { $in: [tags] }
        }

        if (subcategory) {
            result.subCategory = { $in: [subcategory] }
        }

        if (isPublished) {
            result.isPublished = isPublished
        }
        const blog = await blogModel.find(result)
        if (blog.length === 0) {
            return res.status(200).send({ status: true, msg: "No blog found." })
        }

        const d = await blogModel.updateMany(result, { isDeleted: true, deletedAt: Date.now(), new: true })

        return res.status(200).send({ status: true, msg: "Blog(s) deleted successfully." })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}




module.exports.createBlog = createBlog
module.exports.getblogs = getblogs;
module.exports.updateBlog = updateBlog
module.exports.deleteBlogByParams = deleteBlogByParams
module.exports.deleteBlogByQuery = deleteBlogByQuery