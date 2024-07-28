const router = require("express").Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!

const {
  add,
} = require('../users/users-model')

router.post("/register", validateRoleName, (req, res, next) => {
  const { username, password } = req.body;
  const role_name = req.role_name;

  const hash = bcrypt.hashSync(password, 8)

  add({ username, password: hash, role_name })
    .then(([saved]) => {
      res.status(201).json(saved);
    })
    .catch(next)
});

router.post("/login", checkUsernameExists, (req, res, next) => {
  const { username, password, user } = req.body;

  if (bcrypt.compareSync(password, user.password)) {
    const token = buildToken(user)
    res.json({ message: `${username} is back!`, token });
  } else {
    next({ status: 401, message: 'Invalid credentials' });
  }
});

function buildToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name
  }
  const options = {
    expiresIn: '1d'
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

module.exports = router;
