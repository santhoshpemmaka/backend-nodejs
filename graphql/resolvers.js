const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async({input : userInput},req) => {
        const existingUser = await User.findOne({email: userInput.email});

        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.push({message : 'E-Mail is invalid'});
        }
        if(errors.length> 0){
            const error = new Error('Invalid input');
            throw error;
        }
        if(existingUser){
            const error = new Error('User exists already!');
            throw error;
        }
        
        const hashedPw = await bcrypt.hash(userInput.password,12);
        const user = new User({
            email : userInput.email,
            name : userInput.name,
            password : hashedPw
        });
        const createdUser = await user.save();
        return {...createdUser._doc, _id: createdUser._id.toString()}

    },
    createPost: async({input : postData},req) => {
        console.log("post",postData);
        const post = new Post({
            title : postData.title,
            author : postData.author,
            description : postData.description
        })
        const createdPost = await post.save();
        console.log("createpost",createdPost);
        return {
            ...createdPost._doc, _id: createdPost._id.toString()
        }
    },
    login: async({email, password},req) => {
        const user = await User.findOne({email: email});
        console.log(user);
        if(!user){
            const error = new Error("User not found.");
            throw error;
        }
        const isEqual = bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error("Password is incorect");
            throw error;
        }
        const token = jwt.sign({
            userId : user._id.toString(),
            email : user.email
        },"supersecret", {expiresIn : '1h'})
        return {
            token : token,
            userId : user._id.toString()
        }
    },
    viewPost: async({id},req) => {
        const post = await Posts.findOne({id: _id});
        return {
            ...post._doc, _id : post._id.toString()
        }
    },
    deletePost: async({id},req) => {
       const post = await Posts.findById(id);
    }
}