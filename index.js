// imports
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// instantiate server
const server = express();
server.use(express.json());
server.use(cors());

// middleware
// jwt
// generate token
const jwtSecret =
  process.env.JWT_SECRET || "add a secret to your .env file with this key";
const generateToken = user => {
  const jwtPayload = {
    ...user,
    hello: "FSW13",
    roles: "admin"
  };
  const jwtOptions = {
    expiresIn: "1h"
  };
  return jwt.sign(jwtPayload, jwtSecret, jwtOptions);
};

// protected
const protected = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        // token verification failed
        res.status(401).json({ message: "invalid token" });
      } else {
        // token is valid
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "no token provided" });
  }
};

// check role
const checkRole = role => {
  return (req, res, next) => {
    if (req.decodedToken && req.decodedToken.roles.includes(role)) {
      next();
    } else {
      res.status(403).json({ message: "you shall not pass! forbidden" });
    }
  };
};

// endpoints
server.post("/api/register", (req, res) => {
  const creds = req.body;
  //hash
  const hash = bcrypt.hashSync(creds.password, 10);
  creds.password = hash;
  db("users")
    .insert(creds)
    .then(ids => res.status(201).json(ids[0]))
    .catch(err => res.status(500).json(err));
});

server.post("/api/login", (req, res) => {
  const creds = req.body;
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        // create token{}
        const token = generateToken(user);
        res.status(200).json({ welcome: user.username, token });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(err => console.error(err));
});

server.get("/api/users", protected, checkRole("admin"), (req, res) => {
  console.log(req.decoded);
  db("users")
    .then(users => res.status(200).json({ users }))
    .catch(err => res.status(500).json(err));
});

// server port
server.listen(9000, () => {
  console.log("Server is running on port 9000");
});

// knex
const knex = require("knex");
const knexConfig = require("./knexfile");
const db = knex(knexConfig.development);
