var mongoose = require('mongoose');
var Position = require('../models/Position');
var User = require('../models/User');

function findPositionplaces(min, max, longitude, latitude) {
    return Position.find({
            loc: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $minDistance: min,
                    $maxDistance: max
                }
            }
        }).populate('user')
        .exec();
}

function findAndUpdatePositionOnUser(userId, longitude, latitude) {
    return Position.findOneAndUpdate({ _id: userId }, { loc: { type: "Point", coordinates: [longitude, latitude] } }, { upsert: true , returnNewDocument: false } );
}

function findAndUpdatePositionOnUsername(username, longitude, latitude) {
    return Position.findOneAndUpdate({ userName: username }, { loc: { type: "Point", coordinates: [longitude, latitude] } } );
}

function getAllFriends() {
    return Position.find({});
}

function findUserForPosition(id) {
    return User.findById(id);
}

function findPositionForUser(id) {
    return Position.findOne({ _id: id });
}


module.exports = {
    findPositionplaces: findPositionplaces,
    findAndUpdatePositionOnUser: findAndUpdatePositionOnUser,
    getAllFriends: getAllFriends,
    findUserForPosition: findUserForPosition,
    findAndUpdatePositionOnUsername: findAndUpdatePositionOnUsername,
    findPositionForUser: findPositionForUser
}