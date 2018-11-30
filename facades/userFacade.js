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

module.exports = {
  getAllUsers: getAllUsers,
  addUser: addUser,
  findByUsername: findByUsername,
  findById: findById,
}