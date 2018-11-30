var express = require('express');
var { buildSchema } = require('graphql');
var userFacede = require("../facades/UserFacade");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
input UserInput {
    firstName: String!
    lastName: String!
      userName: String!
      password: String!
      email: String!
  }


  type User {
    id: ID
      userName: String
      firstName: String
      lastName: String
      password: String
      email: String
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  type Mutation {
    createUser(input: UserInput): User
  }

`);

class User {
    constructor({ id, userName, firstName, lastName, password, email }) {
        this.id = id;
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName
        this.password = password
        this.email = email
    }
}

// Maps username to content
var fakeDatabase = {};

var root = {
    getUsers: async function () {
        console.log("getUsres")
        const users = [];
        let allUsers = await userFacede.getAllUsers();
        console.log(allUsers);
        for (let prop in allUsers) {
            console.log("Hej")
            users.push(new User(allUsers[prop]))
        }
        return users;
    },
    getUser: async function ({id}) {
        let user = await userFacede.findById(id)
        if(user == null)
        {
            return console.error("hej");
        }
        return new User(user);
      }
      ,
    createUser: function ({ input }) {
       // userFacede.addUser(input.firstName, input.lastName, input.userName, input.password, input.email);
        userFacede.addUser(input);
        return new User(input);
    },
};


module.exports = {
    root: root,
    schema: schema
}

