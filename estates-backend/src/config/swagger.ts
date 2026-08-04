import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Estates API",
      version: "1.0.0",
      description: "REST API for the Estates real-estate platform",
    },
    servers: [
      { url: "https://api.odcreations.com", description: "Production" },
      { url: "http://localhost:4000", description: "Local" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
      },
      schemas: {
        Property: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            location: { type: "string" },
            status: { type: "string", enum: ["pending", "approved", "rejected"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["user", "agent", "admin"] },
          },
        },
        Enquiry: {
          type: "object",
          properties: {
            _id: { type: "string" },
            property: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            message: { type: "string" },
            status: { type: "string", enum: ["pending", "contacted", "closed"] },
          },
        },
        Error: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication" },
      { name: "Properties", description: "Property listings" },
      { name: "Agents", description: "Agent management (admin)" },
      { name: "Users", description: "User profiles & management" },
      { name: "Enquiries", description: "Property enquiries (admin)" },
      { name: "Uploads", description: "File uploads to Cloudflare R2" },
      { name: "Dashboard", description: "Admin dashboard stats" },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.ts"), path.join(__dirname, "../routes/*.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
