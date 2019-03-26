const express = require("express");
const router = express.Router();
const Joi = require("joi");
const joiToForms = require("joi-errors-for-forms").form;
const convertToForms = joiToForms();
const bcrypt = require("bcryptjs");
const Owner = require("../models/Owner");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

router.post("/", (req, res) => {
  const joiOptions = { convert: true, abortEarly: false };

  const schema = Joi.object().keys({
    name: Joi.string().required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{6,15}$/)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    restaurantId: Joi.any().optional()
  });

  Joi.validate(req.body, schema, joiOptions, (errs, convertedValues) => {
    if (errs) {
      return res.status(400).json(convertToForms(errs));
    }

    const newOwner = new Owner({
      name: convertedValues.name,
      email: convertedValues.email,
      password: convertedValues.password,
      restaurants: convertedValues.restaurantId
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newOwner.password, salt, (err, hash) => {
        if (err) throw err;
        newOwner.password = hash;
        newOwner
          .save()
          .then(owner => {
            res.json(owner);
          })
          .catch(err => console.log(err));
      });
    });
  });
});

router.post("/login", (req, res) => {
  const errors = {};
  const email = req.body.email;
  const password = req.body.password;

  const joiOptions = { convert: true, abortEarly: false };

  const schema = Joi.object().keys({
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{6,15}$/)
      .required(),
    email: Joi.string()
      .email()
      .required()
  });

  Joi.validate(req.body, schema, joiOptions, (errs, convertedValues) => {
    if (errs) {
      return res.status(400).json(convertToForms(errs));
    }

    Owner.findOne({ email }).then(user => {
      if (!user) {
        errors.email = "User not found";
        res.status(404).json(errors);
      }
      bcrypt
        .compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            //user match
            const payload = { id: user._id, name: user.name, role: "owner" }; // create JWT Payload
            //sign token
            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 18000 },
              (err, token) => {
                res.json({ success: true, token: "Bearer " + token });
              }
            );
          } else {
            errors.password = "Password incorrect";
            return res.status(400).json(errors);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
});

module.exports = router;
