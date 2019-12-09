const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/app");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB connected...");
});

//定义模型
const ProductSchema = mongoose.Schema({
    SKU: {type: String, required: true},
    price: {type: Number, required: true},
    inventory: {type: Number, required: true},
    url: {type: String, required: true},
    title_ZH: {type: String, required: true},
    title_EN: {type: String, required: true},
    category1: {type: String, required: true},
    category2: {type: String, required: true},
    category3: {type: String, required: true},  
    images: {type: Array, required: true},
    length: {type: Number, required: true},
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    weight: {type: Number, required: true},
    text: { type: String, required: true },
    on_shelf: {type: Boolean, required: true}

}, {versionKey: false});

let Product = mongoose.model("Product", ProductSchema);

exports.savetodb = (data) => {
  let product = new Product(data);
  product.save((err, product) => {
    if(err) console.log(err);
    console.log(data.SKU + "sucessefully saved...");
  });
}


