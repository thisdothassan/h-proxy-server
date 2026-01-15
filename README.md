# Proxy Server

A simple Node.js API service that acts as a proxy to forward HTTP requests to other services.

## Features

- Single POST endpoint for proxying requests
- API key authentication for security
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- Custom headers forwarding
- Request body forwarding
- Pass-through error handling
- CORS enabled
- Health check endpoint

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and set your API key:

```bash
cp .env.example .env
```

Then edit `.env` and set your API key:

```
API_KEY=GcqnbKebUK07UKcoWgd5XcOe0G3VwAjDjlsAoz7zfg0=
```

## Usage

### Start the Server

```bash
npm start
```

The server will start on port 3000 by default. You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

**Note:** The `API_KEY` environment variable must be set before starting the server.

### API Endpoint

#### POST /proxy

Forward an HTTP request to another service.

**Authentication:**

All requests to the `/proxy` endpoint require authentication via the `h-api-key` header. The API key must match the value set in the `API_KEY` environment variable.

Example header:

```
h-api-key: your-api-key-value
```

If the header is missing or invalid, the server will return a `401 Unauthorized` response.

**Request Body:**

```json
{
  "url": "https://api.example.com/endpoint",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token123",
    "Content-Type": "application/json"
  },
  "body": {
    "key": "value"
  }
}
```

**Parameters:**

- `url` (required): The target URL to forward the request to
- `method` (optional): HTTP method (GET, POST, PUT, DELETE, PATCH, etc.). Default: GET
- `headers` (optional): Object containing request headers to forward
- `body` (optional): Object containing the request body (for POST, PUT, PATCH methods)

**Response:**

The endpoint returns the exact response from the target service, including:

- Status code
- Headers
- Response body

### Examples

#### Example 1: GET Request

```bash
curl -X POST http://localhost:3000/proxy \
  -H "Content-Type: application/json" \
  -H "h-api-key: *************=" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/posts/1",
    "method": "GET"
  }'
```

#### Example 2: POST Request with Body

```bash
curl -X POST http://localhost:3000/proxy \
  -H "Content-Type: application/json" \
  -H "h-api-key: *************=" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/posts",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "title": "foo",
      "body": "bar",
      "userId": 1
    }
  }'
```

#### Example 3: Request with Custom Headers

```bash
curl -X POST http://localhost:3000/proxy \
  -H "Content-Type: application/json" \
  -H "h-api-key: *************=" \
  -d '{
    "url": "https://api.example.com/protected",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer your-token-here",
      "X-Custom-Header": "custom-value"
    }
  }'
```

#### Example 4: PUT Request

```bash
curl -X POST http://localhost:3000/proxy \
  -H "Content-Type: application/json" \
  -H "h-api-key: *************=" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/posts/1",
    "method": "PUT",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "id": 1,
      "title": "updated title",
      "body": "updated body",
      "userId": 1
    }
  }'
```

### Health Check

#### GET /health

Check if the server is running.

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok",
  "service": "proxy-server"
}
```

## Error Handling

### Authentication Errors

- `401 Unauthorized` - Missing or invalid `h-api-key` header

### Proxy Errors

The proxy server passes through the exact error response from the downstream service, including:

- Status codes (4xx, 5xx)
- Error response bodies
- Error headers

If the target service is unreachable, the proxy will return:

- `503 Service Unavailable` - When the target service cannot be reached
- `500 Internal Server Error` - For other unexpected errors

## Security Considerations

The proxy service includes API key authentication to protect the endpoint. Additional security considerations:

- API key is validated on every request to `/proxy`
- The health check endpoint (`/health`) is publicly accessible
- No rate limiting implemented
- No request size limits beyond Express defaults
- Consider additional security measures for production use (rate limiting, IP whitelisting, etc.)

## License

MIT
