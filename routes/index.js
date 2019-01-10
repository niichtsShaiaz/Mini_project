var express = require('express');
var router = express.Router();
var userFacade = require('../facades/userFacade');
var blogFacade = require('../facades/blogFacade');
var posFacade = require('../facades/posFacade');
var gju = require('geojson-utils');
var circleToPolygon = require('circle-to-polygon');
//var posFacade = require('../facades/posFacade');

/* Get connection */
require('../dbSetup')(require("../settings").TEST_DB_URI);;

//index

router.post('/api/register', async function (req, res, next) {
  var newUser = req.body;
  var result = await userFacade.addUser(newUser)
  if (!result) {
    res.send(JSON.stringify({ status: "User has not been registered, because the username already exists.", error: true }))
  } else {
    res.send(JSON.stringify({ status: "User has been succesfully registered", error: false }))
  }
})

router.post('/api/login', async function (req, res, next) {
  const user = req.body.user;
  const coords = req.body;
  //Get user validation
  const userInDB = await userFacade.findByUsername(user.userName);
  if(userInDB == undefined)
  {
    res.send(JSON.stringify({status: "invalid username", error: true}))
  }
  else if (userInDB.password != user.password) {
    res.send(JSON.stringify({ status: "invalid password, please try again", error: true }))
  } else {

    //Add position to user
    const pos = await posFacade.findAndUpdatePositionOnUser(userInDB._id, coords.longitude, coords.latitude).catch(res => console.log(res.message));

    res.send(JSON.stringify({ status: "Welcome: " + user.userName, error: false, payload: { username: user.userName, longitude: coords.longitude, latitude: coords.latitude } }))
  }
})

router.get('/', function (req, res) {
  res.render('index', {
    title: 'Hey',
    message: 'Hello there!'
  })
})

router.post('/', async function (req, res, next) {
  var newUser = req.body;
  var result = await userFacade.addUser(newUser)
  if (!result) {
    res.send(JSON.stringify({ status: "User has not been registered, because the username already exists.", error: true }))
  } else {
    res.send(JSON.stringify({ status: "User has been succesfully registered", error: false }))
  }
})

router.post('/api/updatePos', async function (req, res, next) {
  const body = req.body;
  console.log(body);
  const pos = await posFacade.findAndUpdatePositionOnUsername(body.userName, body.longitude, body.latitude).catch(res => console.log(res.message));

  res.send(JSON.stringify({ status: "Welcome: " + body.username, error: false, payload: { username: body.username, longitude: body.longitude, latitude: body.latitude } }))
})

/* USEr */

/* GET all users. */
router.get('/users', async function (req, res, next) {
  var result = await userFacade.getAllUsers();
  res.json(result);
});

/* GET specific user by username with params */
router.get('/users/search/:userName', async function (req, res, next) {
  var result = await userFacade.findByUsername(req.params.userName);
  res.json(result);
});

/* GET specific user by id or username with query */
router.get('/users/search', async function (req, res, next) {
  try {
    var result;
    if (req.query.uId) {
      result = await userFacade.findById(req.query.uId);
      res.json(result);
    } else if (req.query.uName) {
      result = await userFacade.findByUsername(req.query.uName);
      res.json(result);
    } else {
      throw new Error('Something went wrong with your queries. Please try again');
    }
  } catch (error) {
    next(error)
  }
});

router.post('/api/nearbyplayers', async function (req, res, next) {
  const username = req.body.userName;
  const userLoggedIn = await userFacade.findByUsername(username);
  if(userLoggedIn == undefined){
    res.send(JSON.stringify({status: "invalid username", error: true}))
  }


  const position = await posFacade.findPositionForUser(userLoggedIn._id)

  if(position == null)
  {
    res.send(JSON.stringify([]))
  }

  const getPositions = await posFacade.getAllFriends();

  const radiusIn = req.body.radius;

  const coordinates = [position.loc.coordinates[0], position.loc.coordinates[1]]; //player coordinates [lon, lat]


  const radius = radiusIn * 1000;                           // in meters to km
  const numberOfEdges = 32;                           //optional that defaults to 32
 
  //Make circle around user
  let polygon = circleToPolygon(coordinates, radius, numberOfEdges);
  // Validate if Points is in polygon
  const friendsInPolygon = [];
  getPositions.forEach(element => {
      if(gju.pointInPolygon({"type":"Point","coordinates":[element.loc.coordinates[0], element.loc.coordinates[1]] },
                 //{"type":"Polygon", "coordinates":[[[0,0],[20,0],[20,20],[0,20]]]}))
                 {"type":"Polygon", "coordinates": polygon.coordinates}))

                 friendsInPolygon.push(element)
    }
  );


  const removeUserFromList = await convertFriends(friendsInPolygon, username);

  res.send(JSON.stringify(removeUserFromList));
})

/* LOCATIONBLOGS */

/* GET all LocationBlogs. */
router.get('/locationblogs', async function (req, res, next) {
  var result = await blogFacade.getAllLocationBlogs();
  res.json(result);
});

/* GET specific user by username with params */
router.get('/locationblogs/search/:locationinfo', async function (req, res, next) {
  var result = await blogFacade.findLocationBlog(req.params.locationinfo)
  res.json(result);
});

//Add pos

router.post('/addblog', async function (req, res, next) {
  var body = req.body;
  var user = await userFacade.findById('5bc23b8d4fe27e113c5f6efa')
  var result = await blogFacade.addLocationBlog(body.info, body.longtitude, body.latitude, user)
  res.send("it's magic")
})

async function convertFriends(res, username) {
  const allFriends = [];
  for (let index = 0; index < res.length; index++) {
    const user = await posFacade.findUserForPosition(res[index]._id);
    if (user != null && user.userName !== username) {
      allFriends.push({ position: res[index].loc.coordinates, user: user.userName });
    }
  }
  return allFriends;
}

router.post('/api/allFriends', async function (req, res, next) {
  const body = req.body;
  const username = body.username;
  //First get positions.
  const getPositions = await posFacade.getAllFriends();

  const friends = await convertFriends(getPositions, username);

  res.send(JSON.stringify(friends));
  next();
})

router.get('/api/getlocation', async function (req, res, next) {
  const response = req.body // longtitude and latitude.
  //Get all positions within 1 - 5 km
  //Hardcoded
  const min = 0;
  const max = 5 * 10000000;
  const longitude = 70.324;
  const latitude = 40.765;
  const getPositions = await posFacade.findPositionplaces(min, max, longitude, latitude);

  // Map over and reformat
  const newArray = getPositions.map(obj => {
    return {
      username: obj.user.userName,
      longitude: obj.loc.coordinates[0],
      latitude: obj.loc.coordinates[1]
    }
  })

  const jsonObject = {
    friends: newArray
  };

  console.log(jsonObject);
  res.json(jsonObject);

})

router.post('/api/addPosition', async function (req, res, next) {
  var body = req.body;
  var pos = await posFacade.addPosition();
  res.json(pos)
})

router.get('/addblog', function (req, res) {
  res.render('blog', {
    title: 'blog',
    message: 'add blog'
  })
})
module.exports = router;