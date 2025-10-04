// queries.js
// Run with: node queries.js

const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('plp_bookstore');
    const books = db.collection('books');

    console.log('\n--- Basic queries ---');

    // 1. Find all books in a specific genre (example: 'Fantasy')
    const fantasy = await books.find({ genre: 'Fantasy' }).toArray();
    console.log('\nBooks in genre = Fantasy:');
    console.table(fantasy.map(b => ({ title: b.title, author: b.author, year: b.published_year })));

    // 2. Find books published after a certain year (example: 2010)
    const after2010 = await books.find({ published_year: { $gt: 2010 } }).toArray();
    console.log('\nBooks published after 2010:');
    console.table(after2010.map(b => ({ title: b.title, year: b.published_year })));

    // 3. Find books by a specific author (example: 'Andy Weir')
    const byAndy = await books.find({ author: 'Andy Weir' }).toArray();
    console.log('\nBooks by Andy Weir:');
    console.table(byAndy.map(b => ({ title: b.title, year: b.published_year })));

    // 4. Update the price of a specific book
    const updateResult = await books.updateOne({ title: 'The Martian' }, { $set: { price: 12.99 } });
    console.log(`\nUpdatePrice - matched: ${updateResult.matchedCount}, modified: ${updateResult.modifiedCount}`);

    // 5. Delete a book by its title
    const deleteResult = await books.deleteOne({ title: 'The Alchemist' });
    console.log(`\nDelete - deletedCount: ${deleteResult.deletedCount}`);

    // Task 3: Advanced Queries
    console.log('\n--- Advanced queries ---');

    // Find books that are both in stock and published after 2010
    const inStockAfter2010 = await books.find({ in_stock: true, published_year: { $gt: 2010 } })
                                   .project({ title: 1, author: 1, price: 1, _id: 0 })
                                   .toArray();
    console.log('\nIn-stock & published after 2010:');
    console.table(inStockAfter2010);

    // Sorting by price ascending
    const sortAsc = await books.find().project({ title: 1, price: 1, _id: 0 }).sort({ price: 1 }).toArray();
    console.log('\nBooks sorted by price (ascending):');
    console.table(sortAsc);

    // Sorting by price descending
    const sortDesc = await books.find().project({ title: 1, price: 1, _id: 0 }).sort({ price: -1 }).toArray();
    console.log('\nBooks sorted by price (descending):');
    console.table(sortDesc);

    // Pagination (5 books per page) - example pages
    const pageSize = 5;
    async function showPage(page) {
      const docs = await books.find().project({ title: 1, author: 1, price: 1, _id: 0 })
                              .sort({ title: 1 })
                              .skip((page - 1) * pageSize)
                              .limit(pageSize)
                              .toArray();
      console.log(`\nPage ${page} (pageSize=${pageSize}):`);
      console.table(docs);
    }
    await showPage(1);
    await showPage(2);

    // Task 4: Aggregation pipelines
    console.log('\n--- Aggregations ---');

    // 1. Average price of books by genre
    const avgByGenre = await books.aggregate([
      { $group: { _id: '$genre', averagePrice: { $avg: '$price' }, count: { $sum: 1 } } },
      { $sort: { averagePrice: -1 } }
    ]).toArray();
    console.log('\nAverage price by genre:');
    console.table(avgByGenre.map(g => ({ genre: g._id, averagePrice: Number(g.averagePrice.toFixed(2)), count: g.count })));

    // 2. Author with the most books
    const topAuthor = await books.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log('\nAuthor with most books:');
    console.table(topAuthor.map(a => ({ author: a._id, count: a.count })));

    // 3. Group books by publication decade and count them
    const byDecade = await books.aggregate([
      { $group: { 
          _id: { $multiply: [ { $floor: { $divide: [ '$published_year', 10 ] } }, 10 ] },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log('\nBooks grouped by decade:');
    console.table(byDecade.map(d => ({ decade: `${d._id}s`, count: d.count })));

    // Task 5: Indexing and explain()
    console.log('\n--- Indexing & explain() ---');

    // Ensure title index is removed for a 'before' explain check (ignore errors)
    try { await books.dropIndex('title_idx'); } catch (e) { /* ignore if not exists */ }

    // Explain before creating index
    const explainBefore = await books.find({ title: 'Dune' }).explain('executionStats');
    const beforePlan = explainBefore.queryPlanner && explainBefore.queryPlanner.winningPlan ? explainBefore.queryPlanner.winningPlan : explainBefore;
    console.log('\nExplain (before index) - winning plan:');
    console.log(JSON.stringify(beforePlan, null, 2));

    // Create indexes
    await books.createIndex({ title: 1 }, { name: 'title_idx' });
    await books.createIndex({ author: 1, published_year: -1 }, { name: 'author_year_idx' });
    console.log('\nCreated index: title_idx and author_year_idx');

    // Explain after creating index
    const explainAfter = await books.find({ title: 'Dune' }).explain('executionStats');
    const afterPlan = explainAfter.queryPlanner && explainAfter.queryPlanner.winningPlan ? explainAfter.queryPlanner.winningPlan : explainAfter;
    console.log('\nExplain (after index) - winning plan:');
    console.log(JSON.stringify(afterPlan, null, 2));

    console.log('\nSummary: look for COLLSCAN before index (collection scan) and IXSCAN / index usage after index creation.');

  } catch (err) {
    console.error('Error running queries:', err);
  } finally {
    await client.close();
  }
}

run();
