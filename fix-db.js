const { execSync } = require('child_process');

// We have 27 tables. Let's get the list of tables.
const query = `SHOW TABLES`;
const cmd = `c:\\xampp\\mysql\\bin\\mysql.exe -u root -e "SHOW TABLES" u587292075_portal`;

try {
  const result = execSync(cmd).toString();
  const tables = result.split('\n').slice(1).map(t => t.trim()).filter(t => t.length > 0);
  
  for (const table of tables) {
    console.log(`Checking table: ${table}`);
    try {
      // Find duplicates
      const dupCmd = `c:\\xampp\\mysql\\bin\\mysql.exe -u root -e "SELECT id, COUNT(*) FROM ${table} GROUP BY id HAVING COUNT(*) > 1;" u587292075_portal`;
      const dups = execSync(dupCmd).toString();
      if (dups.trim().length > 0) {
        console.log(`DUPLICATES FOUND IN ${table}:\n${dups}`);
      } else {
        // Try adding primary key
        const pkCmd = `c:\\xampp\\mysql\\bin\\mysql.exe -u root -e "ALTER TABLE ${table} ADD PRIMARY KEY (id);" u587292075_portal`;
        execSync(pkCmd);
        console.log(`Successfully added PRIMARY KEY to ${table}`);
      }
    } catch (e) {
      console.log(`Could not add PRIMARY KEY to ${table}: ${e.message}`);
    }
  }
} catch (e) {
  console.error("Failed to run mysql", e);
}
