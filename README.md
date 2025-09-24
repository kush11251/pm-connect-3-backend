# pm-connect-3-backend

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server in dev mode:
   ```sh
   npm run dev
   ```

## API Endpoints & Sample cURL

### 1. User Signup
`POST /api/user/signup`

**Body:**
```json
{
  "username": "jdoe",
  "password": "yourpassword",
  "firstName": "John",
  "middleName": "M",
  "lastName": "Doe",
  "gender": "male",
  "post": "Developer",
  "role": "user",
  "project": "ProjectX",
  "email": "jdoe@example.com",
  "phoneNumber": "1234567890"
}
```
**Sample cURL:**
```sh
curl -X POST http://localhost:3000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"jdoe","password":"yourpassword","firstName":"John","middleName":"M","lastName":"Doe","gender":"male","post":"Developer","role":"user","project":"ProjectX","email":"jdoe@example.com","phoneNumber":"1234567890"}'
```

### 2. Bulk Signup
`POST /api/user/bulk-signup`

**Body:** (Array of users, password auto-generated)
```json
[
  {
    "username": "jdoe",
    "firstName": "John",
    "middleName": "M",
    "lastName": "Doe",
    "gender": "male",
    "post": "Developer",
    "role": "user",
    "project": "ProjectX",
    "email": "jdoe@example.com",
    "phoneNumber": "1234567890"
  },
  {
    "username": "asmith",
    "firstName": "Alice",
    "middleName": "B",
    "lastName": "Smith",
    "gender": "female",
    "post": "Manager",
    "role": "admin",
    "project": "ProjectY",
    "email": "asmith@example.com",
    "phoneNumber": "9876543210"
  }
]
```
**Sample cURL:**
```sh
curl -X POST http://localhost:3000/api/user/bulk-signup \
  -H "Content-Type: application/json" \
  -d '[{"username":"jdoe","firstName":"John","middleName":"M","lastName":"Doe","gender":"male","post":"Developer","role":"user","project":"ProjectX","email":"jdoe@example.com","phoneNumber":"1234567890"},{"username":"asmith","firstName":"Alice","middleName":"B","lastName":"Smith","gender":"female","post":"Manager","role":"admin","project":"ProjectY","email":"asmith@example.com","phoneNumber":"9876543210"}]'
```

### 3. User Login
`POST /api/user/login`

**Body:**
```json
{
  "username": "jdoe",
  "password": "yourpassword"
}
```
**Sample cURL:**
```sh
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jdoe","password":"yourpassword"}'
```
**Response:**
```json
{
  "user": {
    "_id": "...",
    "uuid": "...",
    "username": "jdoe",
    "firstName": "John",
    "middleName": "M",
    "lastName": "Doe",
    "gender": "male",
    "post": "Developer",
    "role": "user",
    "project": "ProjectX",
    "email": "jdoe@example.com",
    "phoneNumber": "1234567890",
    "cabStatus": "allocated",
    "cabDetail": { /* cab info if allocated */ }
    // ...other fields
  },
  "token": "<jwt_token>"
}
```

### 4. Get Current User (from token)
`GET /api/user/me`

**Headers:**
- `Authorization: Bearer <token>`

**Sample cURL:**
```sh
curl -X GET http://localhost:3000/api/user/me \
  -H "Authorization: Bearer <token>"
```

### 5. Get All Users (admin only)
`GET /api/user/all`

**Headers:**
- `Authorization: Bearer <token>`

**Sample cURL:**
```sh
curl -X GET http://localhost:3000/api/user/all \
  -H "Authorization: Bearer <token>"
```

### 6. Cab Allocation (Upload JSON)
`POST /api/cab/allocate`

**Body:** (Array of cabs, each with up to 3 user IDs)
```json
[
  {
    "driverName": "Ravi Kumar",
    "driverNumber": "9998887776",
    "startingPoint": "A",
    "middleStoppagePoints": ["X", "Y"],
    "stoppingPoint": "B",
    "users": ["<user_id1>", "<user_id2>"]
  },
  {
    "driverName": "Suman Singh",
    "driverNumber": "8887776665",
    "startingPoint": "C",
    "middleStoppagePoints": [],
    "stoppingPoint": "D",
    "users": ["<user_id3>"]
  }
]
```
**Sample cURL:**
```sh
curl -X POST http://localhost:3000/api/cab/allocate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[{"driverName":"Ravi Kumar","driverNumber":"9998887776","startingPoint":"A","middleStoppagePoints":["X","Y"],"stoppingPoint":"B","users":["<user_id1>","<user_id2>"]},{"driverName":"Suman Singh","driverNumber":"8887776665","startingPoint":"C","middleStoppagePoints":[],"stoppingPoint":"D","users":["<user_id3>"]}]'
```
**Response:**
```json
{
  "cabs": [
    {
      "cab": { /* cab object */ },
      "failedUsers": [/* user ids that failed to update */]
    }
  ]
}
```

### 7. Get Cab Route by Driver ID
`GET /api/cab/route/:driverId`

**Headers:**
- `Authorization: Bearer <token>`

**Sample cURL:**
```sh
curl -X GET http://localhost:3000/api/cab/route/<driverId> \
  -H "Authorization: Bearer <token>"
```

### 8. Verify Token
`POST /api/token/verify`

**Headers:**
- `Authorization: Bearer <token>`

**Sample cURL:**
```sh
curl -X POST http://localhost:3000/api/token/verify \
  -H "Authorization: Bearer <token>"
```

### 9. Generate Token (Demo)
`POST /api/token/generate`

**Body:**
```json
{
  "id": "<user_id>",
  "username": "jdoe"
}
```
**Sample cURL:**
```sh
curl -X POST http://localhost:3000/api/token/generate \
  -H "Content-Type: application/json" \
  -d '{"id":"<user_id>","username":"jdoe"}'
```

### 10. Get All Cab Driver Details (admin only)
`GET /api/cab/drivers`

**Headers:**
- `Authorization: Bearer <token>` (must be an admin user)

**Sample cURL:**
```sh
curl -X GET http://localhost:3000/api/cab/drivers \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
[
  {
    "driverId": "...",
    "driverName": "Ravi Kumar",
    "driverNumber": "9998887776",
    "startingPoint": "A",
    "middleStoppagePoints": ["X", "Y"],
    "stoppingPoint": "B",
    "users": [
      {
        "_id": "...",
        "uuid": "...",
        "username": "jdoe",
        "firstName": "John",
        "lastName": "Doe",
        // ...other user fields (except password)
      }
      // ...more users
    ]
  },
  // ...more drivers
]
```

## Notes
- User data is stored in MongoDB.
- JWT secret and MongoDB URL are loaded from `.env`.
- Bulk signup auto-generates password as lowercase(first+middle+last name, no spaces/special chars).
- Login returns user data (without password) and a JWT token valid for 1 day.
- `GET /api/user/all` requires the user to have `role: "admin"`.
- Each cab can have a maximum of 3 users. Cab allocation updates user cab status and details.
- Use `/api/cab/route/:driverId` to view a driver's route and users.
- Each cab can have multiple middle stoppage points (see `middleStoppagePoints` in allocation and cab details).
- File upload and download endpoints have been removed as per latest requirements.
