const {validationResult} = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');

exports.getPosts = async (req,res,next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try{
        const totalItems = await Post.find().countDocuments()
        const posts = await Post.find().populate('creator').skip((currentPage -1)*perPage).limit(perPage);
        res.status(200).json({
            message : "Fetched posts sucess",
            posts : posts,
            totalItems : totalItems,
        })
    }
    catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = async (req,res,next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('"Validatiion failed, entered data is incorect"');
            error.statusCode = 442;
            throw error;
        }
        if(!req.file){
            const error = new Error('Validation failed, entered data is incorect.');
            error.statusCode = 442;
            throw error;
        }
        const imageUrl = req.file.path;
        const title = req.body.title;
        const content = req.body.content;
        let creator;
        const post = new Post({
            title : title,
            content : content,
            imageUrl : imageUrl,
            creator : req.userId
        });
        await post.save()
        const user = await User.findById(req.userId);
        creator = user;
        user.posts.push(post);
        await user.save()
        res.status(201).json({
            post : post,
            creator : {_id : creator._id, name : creator.name}
        });
    }
    catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getPost = async (req,res,next) => {
    try{
        const postId = req.params.postId;
        const post = await Post.findById(postId)
        if(!post){
            const error = new Error("Not Found Post");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message : "Post fetched",
            post : post
        })
    }
    catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.updatePost = async (req,res,next) => {
    try{
        const errors = validationResult(req);
        console.log(errors);
        if(!errors.isEmpty()){
            const error = new Error('"Validatiion failed, entered data is incorect"');
            error.statusCode = 442;
            throw error;
        }
        const postId = req.params.postId;
        const title = req.body.title;
        const  content = req.body.content;
        let imageUrl = req.body.image;
        if(req.file) {
            imageUrl = req.file.path;
        }
        if(!imageUrl){
            const error = new Error('No file packed.');
            error.statusCode = 422;
            throw error;
        }
        const post = await Post.findById(postId);
        if(!post){
            const error = new Error("Not Found Post");
            error.statusCode = 404;
            throw error;
        }
        if(imageUrl != post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const result = await  post.save();
        res.status(200).json({
            message : 'Post updated',
            post: result
        })
        
    }
    catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deletePost = async(req,res,next) => {
    try{
        const postId = req.params.postId;
        const post = await Post.findById(postId)
        if(!post){
            const error = new Error("Not Found Post");
            error.statusCode = 404;
            throw error;
        }
        clearImage(post.imageUrl)
        await Post.findByIdAndDelete(postId);
        res.status(200).json({
            message : "Deleted Post."
        })
    }
    catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname,'..',filePath);
    fs.unlink(filePath, err => console.log(err));
}

