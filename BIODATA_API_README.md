# Authenticated Biodata API Documentation

## Overview
This document describes the authenticated API endpoints for retrieving user biodata from MongoDB using Firebase authentication.

## Schema Changes

### UserBioData Model
Added a new field to the `UserBioData` schema:
- **`user_id`**: `string` - Firebase UID (indexed for faster queries)
  - Required: `false` (for backward compatibility with existing records)
  - Index: `true`

## API Endpoints

### Base URL
All endpoints are prefixed with `/api/biodata`

### 1. Get All User Biodata
**Endpoint**: `GET /api/biodata`

**Authentication**: Required (Firebase Bearer token)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Response**:
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "template_id": "eg1",
      "form_data": { ... },
      "image_path": "https://example.com/image.jpg",
      "created_on": "2025-01-01T00:00:00.000Z"
    }
  ],
  "error": null
}
```

**Note**: Only returns `_id`, `template_id`, `form_data`, `image_path`, and `created_on` fields.

**Features**:
- Returns all biodata records for the authenticated user
- Sorted by `created_on` (newest first)
- Only returns biodata that belongs to the authenticated user

### 2. Get Specific Biodata by ID
**Endpoint**: `GET /api/biodata/:id`

**Authentication**: Required (Firebase Bearer token)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Path Parameters**:
- `id`: MongoDB document ID of the biodata

**Response** (Success):
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "template_id": "eg1",
    "form_data": { ... },
    "image_path": "https://example.com/image.jpg",
    "created_on": "2025-01-01T00:00:00.000Z"
  },
  "error": null
}
```

**Note**: Only returns `_id`, `template_id`, `form_data`, `image_path`, and `created_on` fields.

**Response** (Not Found):
```json
{
  "status": false,
  "data": null,
  "error": {
    "message": "Biodata not found or you don't have access to it",
    "code": 404
  }
}
```

**Features**:
- Returns a specific biodata record by ID
- Validates that the biodata belongs to the authenticated user
- Returns 404 if not found or user doesn't have access

## Error Responses

### 401 Unauthorized
```json
{
  "status": false,
  "data": null,
  "error": {
    "message": "No token provided",
    "code": 401
  }
}
```

### 400 Bad Request
```json
{
  "status": false,
  "data": null,
  "error": {
    "message": "User ID not found in token",
    "code": 400
  }
}
```

### 500 Internal Server Error
```json
{
  "status": false,
  "data": null,
  "error": {
    "message": "Failed to fetch biodata: <error details>",
    "code": 500
  }
}
```

## Authentication Flow

1. User authenticates with Firebase on the frontend
2. Frontend receives a Firebase ID token
3. Frontend sends requests with the token in the Authorization header:
   ```
   Authorization: Bearer <firebase_id_token>
   ```
4. Backend verifies the token using Firebase Admin SDK
5. Backend extracts the user ID (uid) from the decoded token
6. Backend queries MongoDB for biodata matching the user_id

## Security Features

- **Firebase Authentication**: All endpoints require valid Firebase ID tokens
- **User Isolation**: Users can only access their own biodata
- **Token Verification**: Each request verifies the Firebase token
- **Ownership Validation**: Biodata ID lookups validate user ownership

## Usage Example (JavaScript/TypeScript)

```javascript
// Get Firebase ID token (after user authentication)
const idToken = await firebase.auth().currentUser.getIdToken();

// Fetch all user biodata
const response = await fetch('http://localhost:3000/api/biodata', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

// Fetch specific biodata
const biodataId = '507f1f77bcf86cd799439011';
const specificResponse = await fetch(`http://localhost:3000/api/biodata/${biodataId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});

const specificData = await specificResponse.json();
console.log(specificData);
```

## Files Modified/Created

1. **Created**: `src/routes/biodata.ts` - New biodata route handlers
2. **Modified**: `src/routes/index.ts` - Added biodata routes to main router
3. **Modified**: `src/models/userBioData.ts` - Added `user_id` field to schema

## Migration Notes

For existing biodata records without a `user_id`:
- The field is optional for backward compatibility
- You may want to run a migration script to populate `user_id` for existing records
- Consider making it required after migration is complete

