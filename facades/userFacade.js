var User = require("../models/User");

function getAllUsers() {
  return User.find({}).exec();
}

function addUser(input) {
  return new User(input).save().catch(res => false);
}

function findByUsername(username) {
  return User.findOne({ userName: username }).exec();
}


function findById(id) {
  return User.findById({ _id: id }).exec();
}

function updateUser(input){
  User.findByIdAndUpdate(input._id, input, {new: true}, (err, user) => {
    if(err){
      return null;
    } 
    return user;
  });
}

function removeUser(input){
  User.findByIdAndDelete(input._id, (err, user) => {
    if(err){
      return false;
     } 
     return true;
    });
}

module.exports = {
  getAllUsers: getAllUsers,
  addUser: addUser,
  findByUsername: findByUsername,
  findById: findById,
  updateUser: updateUser,
  removeUser: removeUser
}