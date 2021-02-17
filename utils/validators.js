
const { body } = require("express-validator");

module.exports = {
  register: [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Please enter an email")
      .isEmail()
      .withMessage("Email is invalid")
      .trim(),
    body("fullname")
      .not()
      .isEmpty()
      .withMessage("Please enter a fullname")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Fullname must be at least 3 characters")
      .isLength({ max: 40 })
      .withMessage("Fullname must be less than 40 characters"),
    body("username")
      .not()
      .isEmpty()
      .withMessage("Please enter a username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .isLength({ max: 40 })
      .withMessage("Username must be less than 30 characters"),
    body("password", "Please enter a password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  editProfile: [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Please enter an email")
      .isEmail()
      .withMessage("Email is invalid")
      .trim(),
    body("fullname")
      .not()
      .isEmpty()
      .withMessage("Please enter a fullname")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Fullname must be at least 3 characters")
      .isLength({ max: 40 })
      .withMessage("Fullname must be less than 40 characters"),
    body("username")
      .not()
      .isEmpty()
      .withMessage("Please enter a username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .isLength({ max: 40 })
      .withMessage("Username must be less than 30 characters")
  ]
};