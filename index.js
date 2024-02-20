const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
 app = express();
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 app.use(express.static('public'));
app.use(morgan('common'));
 const mongoose = require('mongoose');
 const Models = require('./models.js');
 const Movies = Models.Movie;
 const Users = Models.User;
 const Directors = Models.Director;
 const Genres = Models.Genre;

mongoose.connect('mongodb://localhost:27017/myMoviesDb', { useNewUrlParser: true, useUnifiedTopology: true });

// GET users list
app.get('/users', async (req, res) => {
  await Users.find()
  .then((users) => {
      res.status(201).json(users);
  })
  .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

// CREATE user
app.post('/users', async (req, res) => {
  await Users.findOne({username: req.body.usernameame})
  .then((user)=>{
      if (user) {
      return res.status(400).send(req.body.username + ' already exists');
  } else {
      Users
      .create({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthDate: req.body.birthDate,
          favoriteMovie: req.body.favoriteMovie
      })
      .then((user) => {
          res.status(201).json(user)
      })
      .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
      })
  }
})
.catch((error) => {
  console.error(error);
  res.status(500).send('Error ' + error);
});
})

// UPDATE/PUT user info
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.Username },
   { $set:
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthDate: req.body.birthDate,
      favoriteMovie: req.body.favoriteMovie
    }
  },
  { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:' + err);
  })

});

// CREATE user's Fav movie
app.post('/users/:username/movies/:movieName', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username },
     { $push: { favoriteMovies: req.params.movieName }
   },
   { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// DELETE user by username
app.delete('/users/:username', async (req, res) => {
  await Users.findOneAndDelete({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET all movies
app.get('/movies', async (req, res) => {
  await Movies.find()
  .then((movies)=>{
    res.status(201).json(movies);
  })  
  .catch((err) =>{
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
// GET movies by title name
app.get('/movies/:title', async(req, res) => {
  await Movies.findOne({title: req.params.title})
  .then((movies) =>{
    res.status(201).json(movies)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error:' + err);
  });
});
// // GET movie by ID
app.get('/movies/id/:idNumber', async(req, res) => {
  await Movies.findOne({_id: req.params.idNumber})
  .then((movies) => {
    res.status(201).json(movies)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

// GET genres from movies
app.get('/movies/genre/:genreName', async(req, res) => {
  await Movies.find({genre: req.params.genreName})
  .then((movies) => {
    res.status(201).json(movies)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});
// GET genres
app.get('/genre/:genreName', async(req, res) => {
  await Genres.findOne({name: req.params.genreName})
  .then((genre) =>{
    res.status(201).json(genre)
  })
  .catch((err) =>{
    console.log(err);
    res.send(500).send('Error: ' + err)
  });
});

// GET Directors
app.get('/directors/:directorName', async(req, res) => {
  await Directors.findOne({name: req.params.directorName})
  .then((directors) =>{
    res.status(201).json(directors)
  })
  .catch((err) =>{
    console.log(err);
    res.send(500).send('Error: ' + err)
  });
});

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

