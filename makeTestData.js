require("./dbSetup.js")();

var User = require("./models/User.js");
var LocationBlog = require("./models/LocationBlog.js");
var Position = require("./models/Position.js");

//Utility Function to create users
function userCreate(firstName, lastName, userName, password, email, type, company, companyUrl) {
  var job = [{ type, company, companyUrl }, { type, company, companyUrl }];
  var userDetail = { firstName, lastName, userName, email, password, job };
  var user = new User(userDetail);
  return user.save();
}

//Utility Function to create Positions
function positionCreator(lon, lat, userId, dateInFuture) {
  var posDetail = { user: userId, loc: { coordinates: [lon, lat] } }
  if (dateInFuture) {
    posDetail.created = "2022-09-25T20:40:21.899Z"
  }
  var pos = new Position(posDetail);
  return pos.save();
}
//Utility Function to create LocationBlogs
function locationBlogCreator(info, author, longitude, latitude) {
  var LocationBlogDetail = { info, pos: { longitude, latitude }, author };
  var blog = new LocationBlog(LocationBlogDetail);
  return blog.save();
}
// Here we will setup users
async function createUsers() {
  await User.deleteMany({});
  await Position.deleteMany({});
  await LocationBlog.deleteMany({});

  const userPromises = [
    userCreate("Kurt", "Wonnegut", "kw", "test", "a@b.dk", "A type", "comp", "comp.url"),
    userCreate("Hanne", "Wonnegut", "hw", "test", "a@b.dk", "A type", "comp", "comp.url"),
    userCreate("Janne", "Wonnegut", "jw", "test", "a@b.dk", "A type", "comp", "comp.url"),
    userCreate("Iris", "Wonnegut", "iw", "test", "a@b.dk", "A type", "comp", "comp.url"),
  ]
  var users = await Promise.all(userPromises);
  var positionPromises = [
    positionCreator(10, 11, users[0]._id),
    positionCreator(11, 12, users[1]._id, true),
    positionCreator(11, 13, users[2]._id, true)
  ]
  var positions = await Promise.all(positionPromises);

  try {
    var blogPromises = [
      locationBlogCreator("Cool Place", users[0]._id, 26, 28),
      locationBlogCreator("Another Cool Place", users[0]._id, 56, 56),
      locationBlogCreator("Yet Another Cool Place", users[0]._id, 28, 56),
      locationBlogCreator("The coolest Place", users[3]._id, 34, 56),
    ];
    var blogs = await Promise.all(blogPromises);
  } catch (err) {
    console.log("UPPPS: ", err);
  }
  //Check the virtuals
  console.log("Slug for a Cool Place", blogs[0].slug);
 
  //Add a few likes for "a Cool Place"
  blogs[0].likedBy.push(users[1]); //Like by Hanne
  blogs[0].likedBy.push(users[2]); //Like by Janne
  console.log("Likes for a Cool Place", blogs[0].likedByCount);
}
createUsers();
