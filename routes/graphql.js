var express = require('express');
var { buildSchema } = require('graphql');
var userFacede = require("../facades/UserFacade");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
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
    }
};


module.exports = {
    root: root,
    schema: schema
}

