# PLP Africa — Week 1: MongoDB Fundamentals

This repository contains the Week 1 MongoDB assignment for the PLP Africa Full Stack MERN specialization.

## Files
- `insert_books.js` — seeds the `plp_bookstore.books` collection with sample data.
- `queries.js` — performs the CRUD operations, advanced queries, aggregation pipelines, indexing and `explain()` checks required by the assignment.

## Setup
1. Clone your GitHub Classroom repository
2. Install dependencies: `npm install`
3. Seed the database:
   - Local MongoDB: `node insert_books.js` (defaults to `mongodb://127.0.0.1:27017`)
   - Atlas: set `MONGO_URI` environment variable to your Atlas connection string and run `node insert_books.js`

## Run queries
`node queries.js`

## Deliverables
- `insert_books.js`, `queries.js`, `README.md` and screenshot of the `books` collection in MongoDB Compass or Atlas.

## Notes
- Scripts are idempotent: running `insert_books.js` repeatedly will clear and re-populate the `books` collection.
