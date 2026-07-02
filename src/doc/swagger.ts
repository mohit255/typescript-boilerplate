import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import config from "../config/index";

// When running via ts-node: __dirname = src/doc, __filename ends in .ts
// When running compiled:    __dirname = dist/doc, __filename ends in .js
const isTsNode = path.extname(__filename) === ".ts";
const root = path.resolve(__dirname, "../"); // src/ or dist/ — always one level up
const ext = isTsNode ? "ts" : "js";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Client Bids Wallet Poller Consumer",
      version: "1.0.0",
      description: "Internal API documentation",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local",
      },
      { url: process.env.QA_BASE_URL || "", description: "QA" },
      { url: process.env.PROD_BASE_URL || "", description: "Production" },
    ].filter((s) => s.url),
  },
  apis: [`${root}/routes/**/*.${ext}`, `${root}/controllers/**/*.${ext}`],
};

export const swaggerSpec = swaggerJSDoc(options);
