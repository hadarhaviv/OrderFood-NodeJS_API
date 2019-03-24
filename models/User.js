const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create Schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "orders"
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
  }
});

module.exports = user = mongoose.model("user", userSchema);
