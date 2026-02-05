const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/userModel');

function printHelp() {
  const help = `
Usage: node scripts/fetchUsers.js [--out <file>] [--limit <n>] [--include-password]

Options:
  --out <file>           Write JSON output to a file instead of stdout
  --limit <n>            Limit number of users returned
  --include-password     Include passwordHash field in output
  --help                 Show this help message
`;
  console.log(help.trim());
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    printHelp();
    return;
  }

  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

  const limitIdx = args.indexOf('--limit');
  const limitRaw = limitIdx >= 0 ? args[limitIdx + 1] : null;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : null;

  const includePassword = args.includes('--include-password');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }

  await mongoose.connect(mongoUri);

  try {
    const projection = includePassword ? {} : { passwordHash: 0 };
    let query = User.find({}, projection).lean();

    if (Number.isFinite(limit)) {
      query = query.limit(limit);
    }

    const users = await query.exec();
    const json = JSON.stringify(users, null, 2);

    if (outPath) {
      fs.writeFileSync(outPath, json, 'utf8');
      console.log(`Wrote ${users.length} users to ${outPath}`);
    } else {
      console.log(json);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
