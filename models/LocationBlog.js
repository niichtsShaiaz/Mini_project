var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var locationBlogSchema = new Schema({
  info: {type: String, required: true},
  pos : {
    longitude: {type: Number, required: true},
    latitude : {type: Number, required: true}
  },
  //Not Embeding, this represents a one to many relation with reference on the many side
  author: {type: Schema.Types.ObjectId, ref: "User", required: true},
  //Verify whether unique works this way
  likedBy : [Schema.Types.ObjectId],
  created: {type: Date, default: Date.now}
})

locationBlogSchema.virtual("slug").get(function(){
  return "/locationblog/"+this._id;
})
locationBlogSchema.virtual("likedByCount").get(function(){
  return this.likedBy.length;
})

module.exports = mongoose.model("LocationBlog",locationBlogSchema);