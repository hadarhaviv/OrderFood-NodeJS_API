const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
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
  restaurants: [
    {
      type: Schema.Types.ObjectId,
      ref: "restaurants"
    }
  ]
});

module.exports = owner = mongoose.model("owner", ownerSchema);
