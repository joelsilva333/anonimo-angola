import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";

export function setupSwagger(app: Express) {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Anônimo Angola API",
        version: "1.0.0",
        description: "API para desabafos anônimos, com autenticação JWT",
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === "production"
              ? "https://anonimo-angola-api.vercel.app"
              : "http://localhost:8080",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: [
      process.env.NODE_ENV === "production"
        ? "./dist/routes/*.js"
        : "./src/routes/*.ts",
    ],
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);

  const options = {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
    ],
  };

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));
}
