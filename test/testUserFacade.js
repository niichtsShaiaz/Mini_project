const mongoose = require("mongoose");
const expect = require("chai").expect;
const dbSetup = require("../dbSetup");

//https://github.com/Automattic/mongoose/issues/1251
mongoose.models = {};
mongoose.modelSchemas = {};
mongoose.connection = {};

var userFacade = require("../facades/userFacade");
var User = require("../models/user");

let connection = null;
describe("Testing the User Facade", function () {

  /* Connect to the TEST-DATABASE */
  before(async function () {
    this.timeout(require("../settings").MOCHA_TEST_TIMEOUT);
    await dbSetup(require("../settings").TEST_DB_URI);
  })

  after(function () {
    mongoose.connection.close();
  })
  
  var users = [];
  /* Setup the database in a known state (2 users) before EACH test */
  beforeEach(async function () {
    await User.deleteMany({}).exec();
    users = await Promise.all([
      new User({ firstName: "Moppy", lastName: "Cat", userName: "mc", password: "pw", email: "meow" }).save(),
      new User({ firstName: "Gordon", lastName: "Ramsey", userName: "gr", password: "pw", email: "dummyemail" }).save(),
    ])
  })

  it("Should find all users", async function () {
    var users = await userFacade.getAllUsers();
    expect(users.length).to.be.equal(2);
  });

  it("Should Find Moppy by Username", async function () {
    var foundUser = await userFacade.findByUsername("mc");
    expect(foundUser.firstName).to.be.equal("Moppy");
  });

  it("Should Find Gordon by ID", async function () {
    var user = await userFacade.findById(users[1]._id);
    expect(user.firstName).to.be.equal("Gordon");
  });

  it("Should add Anduin wrynn", async function () {
    var user = await userFacade.addUser("Anduin", "Wrynn", "aw", "password", "anotherdummy");
    expect(user).to.not.be.null;
    expect(user.firstName).to.be.equal("Anduin");
    var users = await userFacade.getAllUsers();
    expect(users.length).to.be.equal(3);
  });

})