import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node TypeScript API',
      version: '1.0.0',
      description: 'API documentation for your Node.js TypeScript backend',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'QA server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['src/routes/**/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
