require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'school_management',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  const files = process.argv.slice(2);
  const targets = files.length ? files : ['new_modules.sql'];
  const dir = __dirname;

  for (const file of targets) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    console.log(`Running ${file}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    await conn.query(sql);
    console.log(`Done ${file}`);
  }

  await conn.end();
  console.log('Migrations complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
