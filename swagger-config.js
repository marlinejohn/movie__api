const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'mj-movies-flix',
      version: '1.0.0',
      description: 'API documentation for managing movies and users.',
    },
  },
  apis: ['./index.js'], // Specify the file where routes are defined
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
