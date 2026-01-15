require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers["h-api-key"];
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "API_KEY environment variable is not configured",
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing h-api-key header",
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid API key",
    });
  }

  next();
};

// Proxy endpoint
app.post("/proxy", authenticate, async (req, res) => {
  try {
    const { url, method = "GET", headers = {}, body } = req.body;

    // Validate required URL parameter
    if (!url) {
      return res.status(400).json({
        error: "Missing required parameter: url",
      });
    }

    // Prepare axios request configuration
    const axiosConfig = {
      url,
      method: method.toUpperCase(),
      headers,
      validateStatus: () => true, // Accept any status code to pass through errors
    };

    // Add body for methods that support it
    if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      axiosConfig.data = body;
    }

    // Make the request to the target service
    const response = await axios(axiosConfig);

    // Pass through the response status, headers, and data
    res.status(response.status);

    // Forward response headers (excluding some that shouldn't be forwarded)
    const headersToExclude = ["transfer-encoding", "connection", "keep-alive"];
    Object.keys(response.headers).forEach((key) => {
      if (!headersToExclude.includes(key.toLowerCase())) {
        res.set(key, response.headers[key]);
      }
    });

    // Send the response data
    res.send(response.data);
  } catch (error) {
    // Handle network errors or other axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx (shouldn't happen due to validateStatus)
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({
        error: "Service Unavailable",
        message: "Could not reach the target service",
        details: error.message,
      });
    } else {
      // Something happened in setting up the request
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "proxy-server" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
  console.log(`POST to http://localhost:${PORT}/proxy to forward requests`);
});
