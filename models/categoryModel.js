const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/app");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB connected...");
});

//定义模型
const CategorySchema = mongoose.Schema({
    name: {type: String, required: true},
    url: { type: String, required: true },
    parent: {type: String, required: true},

}, {versionKey: false});

let Category = mongoose.model("Category", CategorySchema);

exports.savetodb = (data) => {
  let category = new Category(data);
  category.save((err, category) => {
    if(err) console.log(err);
    console.log(category.name + "sucessefully saved...");
  });
}


