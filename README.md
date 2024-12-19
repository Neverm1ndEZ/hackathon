# CommunityShield API Documentation

## Base URL
```
localhost:8000/api/
```

## Authentication
Most endpoints require authentication using a JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Responses
All endpoints may return these error status codes:
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid authentication
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource doesn't exist
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Server-side error

## User Management

### Register New User
```http
POST /users/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "skills": [
    {
      "name": "string",
      "level": "BEGINNER" | "INTERMEDIATE" | "EXPERT"
    }
  ],
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}

example : {
    "username": "neverm1nd",
    "name": "Mihir",
    "email": "randommihir837@gmail.com",
    "password": "M123456789",
    "skills": [
        {
            "name": "paramedic",
            "level": "BEGINNER"
        },
        {
            "name": "first aid",
            "level": "INTERMEDIATE"
        }
    ],
    "location": {
        "type": "Point",
        "coordinates": [
            12.98,
            77.76
        ]
    }
}

Response 201:
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "skills": [...],
      "location": {...}
    },
    "token": "string"
  }
}
```

### Authenticate User
```http
POST /users/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

example: {
  "email": "randommihir837@gmail.com",
  "password": "M123456789"
}

Response 200:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "string"
  }
}

example: 

{
    "success": true,
    "data": {
        "user": {
            "location": {
                "type": "Point",
                "coordinates": [
                    12.98,
                    77.76
                ]
            },
            "preferences": {
                "notifications": true,
                "radius": 5000
            },
            "_id": "6763f955af680662401e79e1",
            "username": "neverm1nd",
            "email": "randommihir837@gmail.com",
            "name": "Mihir",
            "skills": [
                "paramedic",
                "first aid"
            ],
            "status": "ACTIVE",
            "role": "USER",
            "lastActive": "2024-12-19T10:53:01.310Z",
            "createdAt": "2024-12-19T10:45:41.732Z",
            "updatedAt": "2024-12-19T10:53:01.313Z",
            "__v": 0
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzYzZjk1NWFmNjgwNjYyNDAxZTc5ZTEiLCJpYXQiOjE3MzQ2MDU1ODEsImV4cCI6MTczNDY5MTk4MX0.HOoteKZFFBy1yJpMYiHJiQYD4mDimqA2JGh1lN2HJO4"
    }
}
```

### Update User Skills
```http
PUT /users/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "skills": [
    {
      "name": "string",
      "level": "BEGINNER" | "INTERMEDIATE" | "EXPERT"
    }
  ]
}

Response 200:
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

### Find Nearby Skills
```http
GET /users/skills/nearby?latitude=<number>&longitude=<number>&skill=<string>&maxDistance=<number>
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "username": "string",
      "skills": [...],
      "location": {...},
      "distance": number
    }
  ]
}
```

## Resource Management

### Create Resource
```http
POST /resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "type": "WATER" | "MEDICAL" | "SHELTER" | "FOOD" | "OTHER",
  "quantity": number,
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "status": "AVAILABLE" | "LOW" | "DEPLETED",
  "description": "string",
  "expiryDate": "ISO8601 date string",
  "contactInfo": "string"
}

EXAMPLE: 
{
  "name": "Mihir",
  "type": "WATER",
  "quantity": 100,
  "location": {
    "type": "Point",
    "coordinates": [12.96, 77.78]
  },
  "status": "AVAILABLE",
  "description": "I've water",
  "expiryDate": "2025-12-19",
  "contactInfo": "9631083004"
}

Response 201:
{
  "success": true,
  "data": {
    "resource": {...}
  }
}

EXAMPLE: 
{
    "success": true,
    "data": {
        "name": "Mihir",
        "type": "WATER",
        "quantity": 100,
        "location": {
            "type": "Point",
            "coordinates": [
                12.96,
                77.78
            ]
        },
        "status": "AVAILABLE",
        "updatedBy": "6763f955af680662401e79e1",
        "description": "I've water",
        "expiryDate": "2025-12-19T00:00:00.000Z",
        "contactInfo": "9631083004",
        "_id": "6763ff466a83c11e5ee2c2ce",
        "lastUpdated": "2024-12-19T11:11:02.371Z",
        "createdAt": "2024-12-19T11:11:02.371Z",
        "updatedAt": "2024-12-19T11:11:02.371Z",
        "__v": 0
    }
}
```

### Find Nearby Resources
```http
GET /resources/nearby?latitude=<number>&longitude=<number>&type=<string>&maxDistance=<number>
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "name": "string",
      "type": "string",
      "quantity": number,
      "location": {...},
      "status": "string",
      "distance": number
    }
  ]
}
```

### Update Resource Status
```http
PATCH /resources/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "AVAILABLE" | "LOW" | "DEPLETED",
  "quantity": number
}

Response 200:
{
  "success": true,
  "data": {
    "resource": {...}
  }
}
```

## Emergency Alerts

### Create Alert
```http
POST /alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "EMERGENCY" | "MEDICAL" | "EVACUATION" | "SUPPLY",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "description": "string"
}

Response 201:
{
  "success": true,
  "data": {
    "alert": {...}
  }
}
```

### Respond to Alert
```http
POST /alerts/:alertId/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "string"
}

Response 200:
{
  "success": true,
  "data": {
    "alert": {...}
  }
}
```

### Resolve Alert
```http
POST /alerts/:alertId/resolve
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "alert": {...}
  }
}
```

## Knowledge Base

### Create Article
```http
POST /knowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "category": "FIRST_AID" | "DISASTER_RESPONSE" | "SURVIVAL" | "TECHNICAL" | "GENERAL",
  "content": "string",
  "tags": ["string"],
  "language": "string",
  "region": ["string"],
  "offline": boolean,
  "priority": number
}

Response 201:
{
  "success": true,
  "data": {
    "article": {...}
  }
}
```

### Search Knowledge Base
```http
GET /knowledge/search?query=<string>&category=<string>&tags=<comma-separated-strings>&language=<string>&region=<string>&page=<number>&limit=<number>
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "items": [...],
    "total": number,
    "page": number,
    "totalPages": number
  }
}
```

### Get Offline Articles
```http
GET /knowledge/offline?language=<string>&region=<string>
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "title": "string",
      "category": "string",
      "content": "string",
      "version": number,
      "lastUpdated": "ISO8601 date string"
    }
  ]
}
```

### Review Article
```http
POST /knowledge/:articleId/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED",
  "comments": "string"
}

Response 200:
{
  "success": true,
  "data": {
    "article": {...}
  }
}
```

## WebSocket Events
The application also supports real-time communication through WebSocket connections:

### Connection
```javascript
// Connect with authentication
socket.connect({
  auth: {
    token: "your_jwt_token"
  }
});
```

### Events
- `resource:update`: Emitted when a resource is updated
- `emergency:alert`: Emitted when a new emergency alert is created
- `mesh:message`: Emitted for peer-to-peer communication
- `user:status`: Emitted when a user's status changes
- `knowledge:sync`: Emitted during knowledge base synchronization

## Rate Limiting
All endpoints are subject to rate limiting:
- 100 requests per 15-minute window per IP address
- WebSocket connections are limited to 10 concurrent connections per user

## Offline Support
The application supports offline functionality through:
- IndexedDB for local storage
- Service Workers for offline access
- Mesh networking for peer-to-peer communication
- Automatic synchronization when online connectivity is restored