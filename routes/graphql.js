

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112

var express = require('express');
var { buildSchema }= require('graphql');
var userFacede = require("../facades/UserFacade");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type User {
      _id: ID!
      userName: String
      firstName: String
      lastName: String
      password: String
      email: String
  }

  type Query {
    getMessage(id: ID!): Message
    getMessages: [Message]
    getUsers: [User]
  }

  type Mutation {
  }
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
  constructor(id, {content, author}) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

class User {
    constructor(_id, {userName, firstName, lastName, password, email}) {
      this._id = _id;
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
    getUsers: async function (){
        console.log("getUsres")
        const users = [];
        let allUsers = await userFacede.getAllUsers();
        console.log(allUsers);  
        for(let prop in allUsers)
        {
            console.log("Hej")
            users.push(new User(prop._id, allUsers[prop]))
        }
        return users;
    }
    ,
  getMessage: function ({id}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  
  getMessages:() => {
    const messages = [];
    for(let prop in fakeDatabase)
    {
        messages.push(new Message(prop, fakeDatabase[prop]))
    }
    return messages;
  }
  ,
  createMessage: function ({input}) {
    // Create a random id for our "database".
    var id = require('crypto').randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage: function ({id, input}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    // This replaces all old data, but some apps might want partial update.
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
};


module.exports = {
    root: root,
     schema: schema
}

