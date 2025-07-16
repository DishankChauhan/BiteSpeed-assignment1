# Identity Reconciliation Service

This is a web service for customer identity reconciliation built for the Bitespeed assignment. It helps identify and link customer contacts based on email addresses and phone numbers.

## What it does

The service implements identity linking where contacts are connected if they share an email or phone number. The oldest contact becomes primary, and newer related contacts become secondary.

## Requirements met

- Contact linking based on shared email or phone number  
- Primary/secondary contact hierarchy with oldest as primary
- Dynamic linking when two primary contacts need to be merged
- RESTful API with consolidated response format

## Tech stack

- Node.js with TypeScript
- Express.js web framework
- PostgreSQL database
- Prisma ORM
- Basic security middleware

## Setup

Install dependencies:
```bash
npm install
```

Start the database:
```bash
npx prisma dev
```

Run migrations:
```bash
npm run db:migrate
```

Generate Prisma client:
```bash
npm run db:generate
```

## Running the app

Development mode:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

Server starts on port 3000.

## API

Health check:
```
GET /health
```

Identify contact:
```
POST /identify
```

Request body:
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"  
}
```

Response:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["123456", "789012"], 
    "secondaryContactIds": [2, 3]
  }
}
```

## Examples

Create first contact:
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@hillvalley.edu","phoneNumber":"123456"}'
```

Link contact with shared phone:
```bash  
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
```

## Database schema

Contact table:
```sql
{
  id             Int       @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?
  linkPrecedence String    
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?
}
```

## Scripts

- `npm run build` - Build TypeScript
- `npm run dev` - Development with hot reload
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database
- `npm run db:studio` - Open Prisma Studio

## Testing

Run the test script:
```bash
./test_api.sh
```

## Deployment

Can be deployed to Render, Heroku, Railway, or any Node.js hosting platform. Set DATABASE_URL environment variable for production database.

## Assignment submission

- Repository: https://github.com/[username]/identity-reconciliation-service
- Demo: https://your-app.render.com
- Date: July 2025
