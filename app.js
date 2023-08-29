const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const app = express();
// app.use(bodyParser.urlencoded());

var { graphqlHTTP } = require("express-graphql")

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const fileStorage = multer.diskStorage({
    destination: (res,file,cb) =>{
        cb(null,'images');
    },
    filename: (req,file,cb) => {
        cb(null,new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req,file,cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    )
    {
        cb(null,true);
    }
    else{
        cb(null,false);
    }
}

app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter : fileFilter}).single('image'));
app.use('/images',express.static(path.join(__dirname,'images')));

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','*');
    res.setHeader("Access-Control-Allow-Headers",'Content-Type, Authorization');
    req.next();
});

app.use('/graphql',
    graphqlHTTP({
        schema : graphqlSchema,
        rootValue : graphqlResolver,
        graphiql: true
    })
)

app.use((error,req,res,next) => {
    console.log(error);
    const status = error.statusCode;
    const message = error.message;
    res.status(status).json({
        message : message
    });
})


mongoose.connect('mongodb+srv://santhoshpemmaka:pemmaka321@cluster0.blghpni.mongodb.net/messages')
.then(result => {
    const server = app.listen(8080);

})
.catch(err => {
    console.log("err",err);
})
