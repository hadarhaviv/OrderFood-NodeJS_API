const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Restaruant = require("../models/Restaurant");
const User = require("../models/User");
const Order = require("../models/Order");
const joiToForms = require("joi-errors-for-forms").form;
const convertToForms = joiToForms();

router.get("/all", (req, res) => {
  Order.find({}).then(orders => {
    res.json(orders);
  });
});

router.get("/user/:userid", (req, res) => {
  const errors = {};
  Order.findOne({ userid: req.params.userid })
    .then(orders => {
      if (!orders) {
        errors.noorders = "there are no orders for this user";
        res.status(404).json(errors);
      }
      res.json(orders);
    })
    .catch(err =>
      res.status(404).json({ order: "there is no order for this user" })
    );
});

router.get("/restaurant/:restaurantid", (req, res) => {
  const errors = {};
  Order.findOne({ restaurantid: req.params.restaurantid })
    .then(orders => {
      if (!orders) {
        errors.noorders = "there are no orders for this user";
        res.status(404).json(errors);
      }
      res.json(orders);
    })
    .catch(err =>
      res.status(404).json({ order: "there is no order for this user" })
    );
});

router.post("/", (req, res) => {
  const joiOptions = { convert: true, abortEarly: false };

  let orderitem = Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number()
      .precision(2)
      .required(),
    quantity: Joi.number()
  });

  const schema = Joi.object().keys({
    userid: Joi.any().required(),
    restaurantid: Joi.any().required(),
    orderitems: Joi.array()
      .items(orderitem)
      .required(),
    totalprice: Joi.number().required()
  });

  Joi.validate(req.body, schema, joiOptions, (errs, convertedValues) => {
    if (errs) {
      return res.status(400).json(convertToForms(errs));
    }

    const newOrder = new Order({
      userid: convertedValues.userid,
      restaurantid: convertedValues.restaurantid,
      orderitems: convertedValues.orderitems,
      totalprice: convertedValues.totalprice
    });

    newOrder.save().then(order => {
      User.findByIdAndUpdate(
        newOrder.userid,
        { $push: { orders: order._id } },
        { new: true }
      )
        .then(user => {
          res.json(user);
        })
        .catch(err => res.status(404).json({ usernotfound: "no user found" }));
    });
  });
});

module.exports = router;
