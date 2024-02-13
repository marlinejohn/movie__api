const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
 app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json())

let topMovies = [
  {
    id: 1,
    title: 'Schindlers\'s List',
    director: 'Steven Spielberg',
    genre: 'War History'
  },
  {
    id: 2, 
    title: 'Guardians of the Galaxy',
    director: 'James Gunn',
    genre: 'SciFi'
  },
  {
    id: 3, 
    title: 'Fight Club',
    director: 'David Fincher',
    genre: 'Triller'
  },
  {
    id: 4, 
    title: 'Friends with Benefits',
    director: 'Will Gluck',
    genre: 'Romantic Comedy'
  },
  {
    id: 5, 
    title: 'Crazy stupid Love',
    director: 'John Requa, Glenn Ficarra',
    genre: 'Romantic Comedy'
  },
  {
    id: 6,
    title: 'Iron Man',
    director: 'Jon Favreau',
    genre: 'SciFi'
  },
  {
    id: 7,
    title: 'Hunger Games',
    director: 'Gary Ross',
    genre: 'Suspence Thriller'
  },
  {
    id: 8,
    title: 'Queen',
    director: 'Vikas Bahi',
    genre: 'Comedy'
  },
  {
    id: 9,
    title: 'Real steel',
    director: 'Shawn Levy',
    genre: 'SciFi'
  },
  {
    id: 10,
    title: 'Twilight',
    director: 'Catherine Hardwicke',
    genre: 'Suspence Romance'
  },
 { 
  id: 11,
  title: 'Twilight',
  director: 'Catherine Hardwicke',
  genre: 'Suspence Romance'
}
];

// GET all movies
app.get('/movies', (req, res) => {
  res.status(200).json(topMovies);
});
// GET Titles
app.get('/movies/:title', (req, res) => {
  const {title}= req.params;
  const movie = topMovies.find(movie => movie.title === title)
   if(movie){
    res.status(200).json(movie)
   }else {
    res.status(400).send('No such movie found')
   }
});
// GET ID
app.get('/movies/id/:idNumber', (req, res) => {
  const {idNumber}= req.params;
  const id = topMovies.find(movie => movie.id == idNumber)
   if(id){
    res.status(200).json(id)
   }else {
    res.status(400).send('No such id found')
   }
});
// GET Genres
app.get('/movies/genre/:genreName', (req, res) => {
  const {genreName}= req.params;
  const genre = topMovies.find(movie => movie.genre === genreName);
   if(genre){
    res.status(200).json(genre)
   }else {
    res.status(400).send('No such genre found')
   }
});
// GET Directors
app.get('/movies/directors/:directorName', (req, res) => {
  const {directorName}= req.params;
  const director = topMovies.find(movie => movie.director === directorName);
   if(director){
    res.status(200).json(director)
   }else {
    res.status(400).send('No such director found')
   }
});
// CREATE
app.post('/movies',(req, res) => {
 const newMovie = req.body;

  if(newMovie.title ){
    newMovie.id = uuid.v4();
    topMovies.push(newMovie);
    res.status(201).json(newMovie)
  }else {
    res.status(400).send('Movie needs name')
  }
})
// UPDATE
app.put('/movies/id/:idNumber',(req, res) => {
  const {idNumber} = req.params;
 const updatedMovie = req.body;

 let movie = topMovies.find(movie => movie.id == idNumber);

  if(movie){
    movie.title = updatedMovie.title;
    res.status(200).json(movie)
  }else {
    res.status(400).send('No such movie')
  }
})
// DELETE
app.delete('/movies/id/:idNumber',(req, res) => {
  const {idNumber} = req.params;
 let movie = topMovies.find(movie => movie.id == idNumber);

  if(movie){
    topMovies= topMovies.filter(movie => movie.id != idNumber)
    res.status(200).json(`user ${idNumber} has been deleted`)
  }else {
    res.status(400).send('No such movie')
  }

})

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

