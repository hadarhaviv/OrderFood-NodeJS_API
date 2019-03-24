const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Restaruant = require("../models/Restaurant");
const joiToForms = require("joi-errors-for-forms").form;
const convertToForms = joiToForms();

router.get("/all", (req, res) => {
  const errors = {};
  Restaruant.find()
    .then(Restaruants => {
      if (!Restaruants) {
        errors.norestaurants = "There is no Restaruants";
        return res.status(404).json(errors);
      }
      res.json(Restaruants);
    })
    .catch(err => {
      res.status(404).json({ Restaruants: "There are no Restaruants" });
    });
});

router.get("/owner/:ownerid", (req, res) => {
  const errors = {};
  Restaruant.find({ owners: req.params.ownerid })
    .then(restaurant => {
      if (!restaurant) {
        errors.owners = "there are no restaurants for this id";
        return res.status(404).json(errors);
      }
      res.json(restaurant);
    })
    .catch(err => res.status(404).json(errors));
});

router.get("/:id", (req, res) => {
  const errors = {};
  Restaruant.findById(req.params.id)
    .then(restaurant => {
      if (!restaurant) {
        errors.restaurant = "there are no restaurants for this id";
        return res.status(404).json(errors);
      }
      res.json(restaurant);
    })
    .catch(err => res.status(404).json(errors));
});

router.post("/", (req, res) => {
  const joiOptions = { convert: true, abortEarly: false };

  let menuItem = Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number()
      .precision(2)
      .required(),
    category: Joi.any()
      .allow(["firstcourse", "maincourse", "dessert", "drink"])
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

    const newRestaurant = new Restaruant({
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
