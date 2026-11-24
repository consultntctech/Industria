// Makes batch codes unique per organization at the database level.
// Replaces the non-unique { org: 1, code: 1 } index with a unique one.
//
// Usage:
//   node --env-file=.env scripts/batch-code-unique-index.mjs          (checks only)
//   node --env-file=.env scripts/batch-code-unique-index.mjs --apply  (replaces the index)

import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const NAME = "org_1_code_1";

if (!process.env.MONGO) {
  console.error("MONGO is not set. Run with: node --env-file=.env scripts/batch-code-unique-index.mjs");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO);
const col = mongoose.connection.db.collection("batches");

const indexes = await col.indexes();
const current = indexes.find((i) => i.name === NAME);
console.log("Current index:", current ? JSON.stringify({ key: current.key, unique: !!current.unique }) : "none");

const dups = await col.aggregate([
  { $group: { _id: { org: "$org", code: "$code" }, n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
]).toArray();
const missing = await col.countDocuments({ $or: [{ code: { $exists: false } }, { code: null }, { code: "" }] });
console.log(`Duplicate codes (same org): ${dups.length}`);
for (const d of dups) console.log("  ", JSON.stringify(d._id), "x", d.n);
console.log(`Batches with no code: ${missing}`);

if (dups.length) {
  console.error("Resolve the duplicates above before adding a unique index.");
} else if (current?.unique) {
  console.log("Index is already unique. Nothing to do.");
} else if (!apply) {
  console.log("Check only. Re-run with --apply to replace the index.");
} else {
  // MongoDB won't hold two indexes with the same key pattern, so drop the old
  // one first. If the unique build fails, restore the original index.
  if (current) await col.dropIndex(NAME);
  try {
    await col.createIndex({ org: 1, code: 1 }, { unique: true, name: NAME });
  } catch (err) {
    console.error("Unique index failed, restoring the original:", err.message);
    await col.createIndex({ org: 1, code: 1 }, { name: NAME });
    process.exitCode = 1;
  }
  const after = (await col.indexes()).find((i) => i.name === NAME);
  console.log("New index:", JSON.stringify({ key: after.key, unique: !!after.unique }));
}

await mongoose.disconnect();
