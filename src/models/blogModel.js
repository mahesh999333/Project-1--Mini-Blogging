//const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    authorId: {
        type: ObjectId,
        ref: "Author",
        required: true
    },
    tags: {
        type: []
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: []
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    publishedAt: Date,
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Blogs', blogSchema)