const express = require("express");
const router = express.Router();
const Joi = require("joi");
const passport = require("passport");
const Restaurant = require("../models/Restaurant");
const joiToForms = require("joi-errors-for-forms").form;
const convertToForms = joiToForms();

router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Restaurant.find()
      .then(Restaurants => {
        if (!Restaurants) {
          errors.norestaurants = "There is no Restaurants";
          return res.status(404).json(errors);
        }
        res.json(Restaurants);
      })
      .catch(err => {
        res.status(404).json({ Restaurants: "There are no Restaurants" });
      });
  }
);

router.get("/owner/:ownerid", passport.authenticate("jwt", { session: false }), (req, res) => {
  const errors = {};
  Restaurant.findOne({ owners: req.params.ownerid })
    .then(restaurant => {
      if (!restaurant) {
        errors.owners = "there are no restaurants for this id";
        return res.status(404).json(errors);
      }
      res.json(restaurant);
    })
    .catch(err => res.status(404).json(errors));
});

router.get("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  const errors = {};
  Restaurant.findById(req.params.id)
    .then(restaurant => {
      if (!restaurant) {
        errors.restaurant = "there are no restaurants for this id";
        return res.status(404).json(errors);
      }
      res.json(restaurant);
    })
    .catch(err => res.status(404).json(errors));
});

router.post("/:id/menu", passport.authenticate("jwt", { session: false }), (req, res) => {
  const joiOptions = { convert: true, abortEarly: false };
  let menuItem = Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number()
      .precision(2)
      .required(),
    _id: Joi.any()
  });

  const schema = Joi.array().items(menuItem);

  Joi.validate(req.body, schema, joiOptions, (errs, convertedValues) => {
    if (errs) {
      return res.status(400).json(convertToForms(errs));
    }

    Restaurant.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { menu: convertedValues } },
      { new: true }
    ).then(restaurant => {
      res.json(restaurant);
    });
  });
});

router.post("/:id/hours", passport.authenticate("jwt", { session: false }), (req, res) => {
  const joiOptions = { convert: true, abortEarly: false };

  const schema = Joi.object().keys({
    open: Joi.string().required(),
    close: Joi.string().required()
  });

  Joi.validate(req.body, schema, joiOptions, (errs, convertedValues) => {
    if (errs) {
      return res.status(400).json(convertToForms(errs));
    }

    const newHours = {
      open: convertedValues.open,
      close: convertedValues.close
    };

    Restaurant.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { openhours: newHours } },
      { new: true }
    ).then(restaurant => {
      res.json(restaurant);
    });
  });
});

router.post("/", (req, res) => {
  const joiOptions = { convert: true, abortEarly: false };

  let menuItem = Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number()
      .precision(2)
      .required()
  });

  const schema = Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
    menu: Joi.array().items(menuItem),
    address: Joi.object()
      .keys({
        street: Joi.string().required(),
        city: Joi.string().required(),
        phone: Joi.string().required()
      })
      .required(),
    openhours: Joi.object({
      open: Joi.string(),
      close: Joi.string()
    }).required(),
    owners: Joi.array().optional()
  });

  Joi.validate(req.body, schema, joiOptions, (errs, convertedValues) => {
    if (errs) {
      return res.status(400).json(convertToForms(errs));
    }

    const newRestaurant = new Restaurant({
      name: convertedValues.name,
      image: convertedValues.image,
      menu: convertedValues.menu,
      address: convertedValues.address,
      openhours: convertedValues.openhours,
      owners: convertedValues.owners
    });

    newRestaurant
      .save()
      .then(restaurant => {
        res.json(restaurant);
      })
      .catch(err => console.log(err));
  });
});

module.exports = router;
