const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");
app.use(express.static("public"));
app.use(morgan("common"));
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;
const { check, validationResult } = require('express-validator');


mongoose.connect("mongodb://localhost:27017/myMoviesDb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// GET users list
app.get("/users", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// CREATE user
app.post("/users",  [
  //input validation here
  check('Username', 'Username is required').notEmpty(),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').notEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
],
async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + " already exists");
      } else {
        Users.create({
          username: req.body.username,
          Password: hashedPassword,
          email: req.body.email,
          birthDate: req.body.birthDate,
          favoriteMovie: req.body.favoriteMovie,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error " + error);
    });
});

// UPDATE/PUT user info
app.put("/users/:username", [
  //input validation here
  check('Username', 'Username is required').notEmpty(),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').notEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], passport.authenticate('jwt', { session: false }), async (req, res) => {

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  await Users.findOneAndUpdate(
    { username: req.params.username },
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthDate: req.body.birthDate,
        favoriteMovie: req.body.favoriteMovie,
      },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

// CREATE user's Fav movie
app.post("/users/:username/movies/:movieName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate(
    { username: req.params.username },
    { $push: { favoriteMovies: req.params.movieName } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// DELETE user by username
app.delete("/users/:username", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndDelete({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + " was not found");
      } else {
        res.status(200).send(req.params.username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// DELETE Fav movie by moviename
app.delete("/users/:username/movies/:name", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({username: req.params.username},{ $pull: {favoriteMovies: req.params.name} }, {new:true})
  .then((updatedUser) => {
    res.json(updatedUser);
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});


// GET all movies
app.get("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});
// GET movies by title name
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ title: req.params.title })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});
// // GET movie by ID
app.get("/movies/id/:idNumber", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ _id: req.params.idNumber })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// GET genres from movies
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find({ genre: req.params.genreName })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// CREATE a new movie
app.post("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { title, description, genre, director, featured } = req.body;

  try {
    // Find the director's ID based on the director's name
    const directorObject = await Directors.findOne({ name: director });
    
    if (!directorObject) {
      return res.status(400).json({ message: 'Director not found' });
    }

    const newMovie = await Movies.create({
      Title: title,
      Description: description,
      Genre: { name: genre },
      Director: {
        Name: directorObject.Name,
        _id: directorObject._id  
      },
      Featured: featured
    });

    res.status(201).json(newMovie);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});
// GET genres
app.get("/genre/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Genres.findOne({ name: req.params.genreName })
    .then((genre) => {
      res.status(201).json(genre);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).send("Error: " + err);
    });
});

// GET Directors
app.get("/directors/:directorName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Directors.findOne({ name: req.params.directorName })
    .then((directors) => {
      res.status(201).json(directors);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).send("Error: " + err);
    });
});

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log("Your app is listening on port " + port);
});
