const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderScheme = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  restaurantid: {
    type: Schema.Types.ObjectId,
    ref: "restaurants"
  },
  orderitems: [
    {
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  totalprice: {
    type: Number,
    required: true
  }
});

module.exports = order = mongoose.model("order", orderScheme);
