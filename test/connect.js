const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/user-data");

mongoose.connection.once("open", function(){
  console.log("connection established");
}).on("error", function (error) {
  console.log("connection error", error);
})
