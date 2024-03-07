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
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;
const { check, validationResult } = require('express-validator');


// mongoose.connect("mongodb://localhost:27017/myMoviesDb", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
 * @openapi
 * /:
 *   get:
 *     summary: Welcome message
 *     description: Get a welcome message.
 *     responses:
 *       200:
 *         description: Successful response with a welcome message.
 */
app.get("/", (req, res) => {
  res.send("Welcome to MJ's moviesFlix");
});

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 */

// GET users list
app.get("/users", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided details.
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               birthDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful response with the created user.
 *       400:
 *         description: Bad request. User with the same username already exists.
 */

// CREATE user
app.post("/users",  [
  //input validation here
  check('username', 'Username is required').notEmpty(),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').notEmpty(),
  check('email', 'Email does not appear to be valid').isEmail()
],
async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  let hashedPassword = Users.hashPassword(req.body.password);
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + " already exists");
      } else {
        Users.create({
          username: req.body.username,
          password: hashedPassword,
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

/**
 * @openapi
 * /users/{username}:
 *   put:
 *     summary: Update user information
 *     description: Update user information based on the provided username.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               birthDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated user.
 *       400:
 *         description: Bad request. Invalid input or user not found.
 */

// UPDATE/PUT user info
app.put("/users/:username", [
  //input validation here
  check('username', 'Username is required').notEmpty(),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').notEmpty(),
  check('email', 'Email does not appear to be valid').isEmail()
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
/**
 * @openapi
 * /users/{username}/movies/{movieName}:
 *   post:
 *     summary: Add a movie to a user's favorite list
 *     description: Add a movie to the favorite list of a user based on the provided username and movie name.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: movieName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated user's favorite list.
 *       500:
 *         description: Internal server error.
 */

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
/**
 * @openapi
 * /users/{username}:
 *   delete:
 *     summary: Delete a user by username
 *     description: Delete a user based on the provided username.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User successfully deleted.
 *       400:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

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

/**
 * @openapi
 * /users/{username}/movies/{name}:
 *   delete:
 *     summary: Remove a movie from user's favorite list
 *     description: Remove a movie from the favorite list of a user.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie successfully removed from the user's favorite list.
 *       500:
 *         description: Internal server error.
 */

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

/**
 * @openapi
 * /movies:
 *   get:
 *     summary: Get all movies
 *     description: Retrieve a list of all movies.
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Successful response with a list of movies.
 *       500:
 *         description: Internal server error.
 */

// GET all movies
app.get("/movies", passport.authenticate('jwt', { session: false }),  async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * @openapi
 * /movies/{title}:
 *   get:
 *     summary: Get a movie by title
 *     description: Retrieve a movie based on the provided title.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the movie details.
 *       500:
 *         description: Internal server error.
 */

// GET movies by title name
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ title: req.params.title })
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});
/**
 * @openapi
 * /movies/id/{idNumber}:
 *   get:
 *     summary: Get a movie by ID
 *     description: Retrieve a movie based on the provided ID.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: idNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the movie details.
 *       500:
 *         description: Internal server error.
 */

// GET movie by ID
app.get("/movies/id/:idNumber", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ _id: req.params.idNumber })
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});
/**
 * @openapi
 * /movies/genre/{genreName}:
 *   get:
 *     summary: Get movies by genre
 *     description: Retrieve a list of movies based on the provided genre.
 *     parameters:
 *       - in: path
 *         name: genreName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with a list of movies.
 *       500:
 *         description: Internal server error.
 */

// GET genres from movies
app.get("/movies/genre/:genreName", async (req, res) => {
  await Movies.find({ genre: req.params.genreName })
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * @openapi
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     description: Create a new movie with the provided details.
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               director:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *             required:
 *               - title
 *               - description
 *               - genre
 *               - director
 *               - imageUrl
 *     responses:
 *       201:
 *         description: Movie successfully created.
 *       400:
 *         description: Invalid request or missing required fields.
 *       500:
 *         description: Internal server error.
 */

// CREATE a new movie
app.post("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { title, description, genre, director, featured, imageUrl } = req.body;

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
      Featured: featured,
      ImageUrl: imageUrl
    });

    res.status(201).json(newMovie);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});
/**
 * @openapi
 * /genre/{genreName}:
 *   get:
 *     summary: Get details of a genre
 *     description: Retrieve details of a genre based on the provided genre name.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: genreName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with genre details.
 *       500:
 *         description: Internal server error.
 */

// GET genres
app.get("/genre/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Genres.findOne({ name: req.params.genreName })
    .then((genre) => {
      res.status(200).json(genre);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).send("Error: " + err);
    });
});

/**
 * @openapi
 * /directors/{directorName}:
 *   get:
 *     summary: Get details of a director
 *     description: Retrieve details of a director based on the provided director name.
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: directorName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with director details.
 *       500:
 *         description: Internal server error.
 */

// GET Directors
app.get("/directors/:directorName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Directors.findOne({ name: req.params.directorName })
    .then((directors) => {
      res.status(200).json(directors);
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log("Your app is listening on port " + port);
});
