const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantScheme = new Schema({
  name: {
    type: String,
    required: true,
    max: 40
  },
  image: {
    type: String
  },
  menu: [
    {
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  openhours: {
    open: {
      type: String,
      required: true
    },
    close: {
      type: String,
      required: true
    }
  },
  owners: [
    {
      type: Schema.Types.ObjectId,
      ref: "owners"
    }
  ]
});

module.exports = restaurant = mongoose.model("restaurant", restaurantScheme);
