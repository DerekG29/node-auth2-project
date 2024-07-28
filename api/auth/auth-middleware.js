const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const { findBy } = require('../users/users-model')

const restricted = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        next({ status: 401, message: 'Token invalid' });
      } else {
        req.decodedJWT = decoded;
        next();
      }
    })
  } else {
    next({ status: 401, message: 'Token required' });
  }
}

const only = role_name => (req, res, next) => {
  if (req.decodedJWT && req.decodedJWT.role_name === role_name) {
    next();
  } else {
    delete req.decodedJWT;
    next({ status: 403, message: 'This is not for you' });
  }
}

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const [user] = await findBy({ username });
  if (!user) {
    next({ status: 401, message: 'Invalid credentials' });
  } else {
    req.body.user = user;
    next();
  }
}

const validateRoleName = (req, res, next) => {
  const { role_name } = req.body;
  if (role_name && typeof role_name === 'string') {
    const trimmed_role_name = role_name.trim();
    if (trimmed_role_name === 'admin') {
      next({ status: 422, message: 'Role name can not be admin' });
    }
    if (trimmed_role_name.length > 32) {
      next({ status: 422, message: 'Role name can not be longer than 32 chars' });
    }
    req.role_name = trimmed_role_name;
    next();
  } else {
    req.role_name = 'student'
    next();
  }
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}
