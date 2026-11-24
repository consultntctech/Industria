// Renames the stored product/batch type 'Finished Good' -> 'Unfinished Good'.
// Packaged items (LineItems) are the real finished goods and are not touched.
//
// Usage:
//   node --env-file=.env scripts/migrate-unfinished-goods.mjs          (dry run, counts only)
//   node --env-file=.env scripts/migrate-unfinished-goods.mjs --apply  (writes changes)

import mongoose from "mongoose";

const OLD = "Finished Good";
const NEW = "Unfinished Good";
const apply = process.argv.includes("--apply");

const uri = process.env.MONGO;
if (!uri) {
  console.error("MONGO is not set. Run with: node --env-file=.env scripts/migrate-unfinished-goods.mjs");
  process.exit(1);
}

await mongoose.connect(uri);
const db = mongoose.connection.db;

const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);
let total = 0;

for (const name of collections) {
  const col = db.collection(name);
  const count = await col.countDocuments({ type: { $in: [OLD, "Finished Goods"] } });
  if (!count) continue;
  total += count;

  if (apply) {
    const a = await col.updateMany({ type: OLD }, { $set: { type: NEW } });
    const b = await col.updateMany({ type: "Finished Goods" }, { $set: { type: "Unfinished Goods" } });
    console.log(`${name}: updated ${a.modifiedCount + b.modifiedCount} of ${count}`);
  } else {
    console.log(`${name}: ${count} document(s) would be updated`);
  }
}

console.log(total ? (apply ? "Done." : "Dry run only. Re-run with --apply to write.") : "Nothing to migrate.");
await mongoose.disconnect();
