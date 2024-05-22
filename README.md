# Movie API Documentation

## Technologies Used
- Node.js
- Express.js
- MongoDB with Mongoose
- bcrypt
- body-parser
- cors
- express-validator
- jsonwebtoken
- passport
- passport-jwt
- passport-local
- uuid

## Getting Started
1. Install dependencies: npm install
2. Start the server: npm start or for development with nodemon: npm run dev

## API Endpoints
## 1. Get All Movies
- Request:
  - Method: GET
  - URL: /movies
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object containing data on all movies.

## 2. Get All Users
- Request:
  - Method: GET
  - URL: /users
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object containing data on all users.

## 3. Create a user
- Request:
  - Method: POST
  - URL: /users
  - Request Body format: JSON
  ```json
  { "username": "eva_user", "password": "eva_secure_pass", "email": "eva@email.com", "birthDate": { "$date": "1995-11-28T00:00:00.000Z" }, "favoriteMovies": [ "Inception" ] }
- Response:
  - Format: JSON
  - Description: A JSON object holding data about a userid, username, email, password, birthDate, favorite movies.

## 4. Update a user
- Request:
  - Method: PUT
  - URL: /users/:Username
  - Request Body format: JSON
  ```json
  { "username": "eva_user", "password": "eva_secure_pass", "email": "eva@email.com", "birthDate": { "$date": "1995-11-28T00:00:00.000Z" }, "favoriteMovies": [ "Inception" ] }
- Response:
  - Format: JSON
  - Description: A JSON object of updated user.

## 5. Create user's favourite movie
- Request:
  - Method: POST
  - URL: /users/:username/movies/:movieName
  - Request Body format: None
- Response:
  - Format: JSON
  - Description: A JSON object of updated user.

## 6. Delete user by user name
- Request:
  - Method: DELETE
  - URL: /users/:username
  - Request Body format: None
- Response:
  - Format: JSON
  - Description: A text message indicating whether the movie was successfully removed.

## 7. Get All Movies
- Request:
  - Method: GET
  - URL: /movies
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object holding data about all movies

## 8. Get movie data by title name	
- Request:
  - Method: GET
  - URL: /movies/:title	
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object holding data about the movie ID, title, description,genre, director,featured.

## 9. Get movie data by ID
- Request:
  - Method: GET
  - URL: /movies/id/:idNumber
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object holding data about the movie ID, title, description,genre, director,featured.
  
## 10. Get genres from movies list	
- Request:
  - Method: GET
  - URL: /movies/genre/:genreName
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object holding data about the movie ID, title, description,genre, director,featured related to specified genre.

## 11. Get genres from genres list		
- Request:
  - Method: GET
  - URL: /genre/:genreName
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object holding data about the genre ID, name and description.

## 12. Get directors from directors list			
- Request:
  - Method: GET
  - URL: /directors/:directorName
  - Request Body: None
- Response:
  - Format: JSON
  - Description: A JSON object holding data about director's ID, name, bio, birthdate, deathdate.

## Author
- ## Marline John

  
  
