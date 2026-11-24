// Renames stored type values:
//   products: 'Finished Good' / 'Unfinished Good'  -> 'Processed Good'
//   batches:  'Finished Good' / 'Unfinished Good'  -> 'Production'
// Packaged items (LineItems) are the real finished goods and are not touched.
//
// Usage:
//   node --env-file=.env scripts/migrate-processed-goods.mjs          (dry run, counts only)
//   node --env-file=.env scripts/migrate-processed-goods.mjs --apply  (writes changes)

import mongoose from "mongoose";

const OLD = ["Finished Good", "Finished Goods", "Unfinished Good", "Unfinished Goods"];
const TARGETS = { products: "Processed Good", batches: "Production" };
const apply = process.argv.includes("--apply");

if (!process.env.MONGO) {
  console.error("MONGO is not set. Run with: node --env-file=.env scripts/migrate-processed-goods.mjs");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO);
const db = mongoose.connection.db;

for (const [name, value] of Object.entries(TARGETS)) {
  const col = db.collection(name);
  const filter = { type: { $in: OLD } };
  const count = await col.countDocuments(filter);
  if (apply && count) {
    const res = await col.updateMany(filter, { $set: { type: value } });
    console.log(`${name}: updated ${res.modifiedCount} of ${count} -> '${value}'`);
  } else {
    console.log(`${name}: ${count} document(s) ${apply ? "found" : "would be updated"} -> '${value}'`);
  }
}

// Anything else still holding an old value?
for (const { name } of await db.listCollections({}, { nameOnly: true }).toArray()) {
  if (name in TARGETS) continue;
  const n = await db.collection(name).countDocuments({ type: { $in: OLD } });
  if (n) console.log(`WARNING ${name}: ${n} document(s) still use an old type value (not changed)`);
}

// Report duplicate batch codes per org (informational only)
const dups = await db.collection("batches").aggregate([
  { $group: { _id: { org: "$org", code: "$code" }, n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
]).toArray();
console.log(`Duplicate batch codes (same org): ${dups.length}`);

console.log(apply ? "Done." : "Dry run only. Re-run with --apply to write.");
await mongoose.disconnect();
