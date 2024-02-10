const express = require('express'),
morgan = require('morgan');
const app = express();

app.use(express.static('public'));
app.use(morgan('common'));

let topMovies = [
  {
    title: 'Guardians of the Galaxy',
    director: 'director1'
  },
  {
    title: 'Fight Club',
    director: 'director2'
  },
  {
    title: 'Friends with Benefits',
    director: 'director3'
  },
  {
    title: 'Crazy stupid Love',
    director: 'director4'
  },
  {
    title: 'Ironman',
    director: 'director5'
  },
  {
    title: 'Hunger Games',
    director: 'director6'
  },
  {
    title: 'Queen',
    director: 'director7'
  },
  {
    title: 'Lord of the Rings',
    director: 'director8'
  },
  {
    title: 'Real steal',
    author: 'director9'
  },
  {
    title: 'Twilight',
    author: 'director10'
  }
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my top 10 movies site!');
});


app.get('/movies', (req, res) => {
  res.json(topMovies);
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

