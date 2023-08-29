var {  buildSchema } = require("graphql");

module.exports = buildSchema(`


    type Post {
        _id : ID!
        title : String!
        content : String!
        imageUrl : String!
        creator : User!
        createdAt : String!
        updateAt : String!

    }
    

    type User {
        _id : ID!
        email : String!
        password : String
        name : String!
        status : String!
        posts : [Post!]!
    }

    input userInputData {
        email: String!
        name : String!
        password: String!
    }

    input createPostData {
        title : String!
        author : String!
        description : String!
        
    }

    type Posts {
        title : String!
        author : String!
        description : String!
        _id : ID!
    }

    type authData {
        token : String!
        userId: String!
    }
    type PostView {
        title : String!
        description : String!
        author : String!
    }


    type RootMutation {
        createUser(input : userInputData) : User!
        createPost(input : createPostData) : Posts!
        deletePost(id:ID!) : Boolean
    }
    

    type RootQuery {
        login(email: String!, password: String!): authData!
        viewPost(id : ID!): PostView
    }

    schema {
        query: RootQuery
        mutation : RootMutation
    }

`);