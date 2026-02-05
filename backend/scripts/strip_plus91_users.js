const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/userModel');

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }

  await mongoose.connect(uri);

  try {
    const users = await User.find({}, { phone: 1, name: 1 }).lean();
    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      const normalized = normalizePhone(user.phone);

      if (!normalized || normalized === user.phone) {
        skipped += 1;
        continue;
      }

      const collision = await User.findOne({ phone: normalized });
      if (collision && String(collision._id) !== String(user._id)) {
        console.warn(
          `Skip ${user.name || user._id}: ${user.phone} -> ${normalized} (collision with ${collision.name || collision._id})`
        );
        skipped += 1;
        continue;
      }

      if (!dryRun) {
        await User.updateOne({ _id: user._id }, { $set: { phone: normalized } });
      }

      console.log(`Update ${user.name || user._id}: ${user.phone} -> ${normalized}`);
      updated += 1;
    }

    console.log(`Done. Updated ${updated}. Skipped ${skipped}. Dry-run: ${dryRun}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
