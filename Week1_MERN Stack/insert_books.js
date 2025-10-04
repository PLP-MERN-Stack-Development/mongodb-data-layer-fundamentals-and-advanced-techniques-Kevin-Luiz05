// insert_books.js
// Usage:
//   - Set MONGO_URI env var to your Atlas or local connection string, OR run locally with default MongoDB.
// Examples:
//   $env:MONGO_URI='mongodb://127.0.0.1:27017' ; node insert_books.js
//   MONGO_URI='mongodb+srv://user:pass@cluster.../test' node insert_books.js

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db('plp_bookstore');
    const books = db.collection('books');

    // Make this script idempotent for grading: remove existing docs in the collection
    await books.deleteMany({});

    const seedData = [
      { title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller", published_year: 2019, price: 12.99, in_stock: true, pages: 336, publisher: "Celadon Books" },
      { title: "Educated", author: "Tara Westover", genre: "Memoir", published_year: 2018, price: 14.99, in_stock: true, pages: 352, publisher: "Random House" },
      { title: "The Testaments", author: "Margaret Atwood", genre: "Fiction", published_year: 2019, price: 16.50, in_stock: false, pages: 419, publisher: "Chatto & Windus" },
      { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", published_year: 1937, price: 10.99, in_stock: true, pages: 310, publisher: "George Allen & Unwin" },
      { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", genre: "Fantasy", published_year: 1997, price: 9.99, in_stock: true, pages: 309, publisher: "Bloomsbury" },
      { title: "The Martian", author: "Andy Weir", genre: "Science Fiction", published_year: 2011, price: 11.99, in_stock: true, pages: 369, publisher: "Crown" },
      { title: "Dune", author: "Frank Herbert", genre: "Science Fiction", published_year: 1965, price: 13.99, in_stock: false, pages: 412, publisher: "Chilton" },
      { title: "Lean Startup", author: "Eric Ries", genre: "Business", published_year: 2011, price: 19.99, in_stock: true, pages: 336, publisher: "Crown Business" },
      { title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", published_year: 2014, price: 18.99, in_stock: true, pages: 443, publisher: "Harvill Secker" },
      { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", published_year: 2007, price: 12.00, in_stock: false, pages: 662, publisher: "DAW Books" },
      { title: "Atomic Habits", author: "James Clear", genre: "Self-Help", published_year: 2018, price: 17.00, in_stock: true, pages: 320, publisher: "Avery" },
      { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", published_year: 1988, price: 8.99, in_stock: true, pages: 208, publisher: "HarperOne" }
    ];

    const result = await books.insertMany(seedData);
    console.log(`Inserted ${Object.keys(result.insertedIds).length} book documents into plp_bookstore.books`);

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
  }
}

seed();
