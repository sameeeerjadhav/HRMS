const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Remove @@ignore lines completely
schema = schema.replace(/@@ignore\n?/g, '');

// For any line that has `id Int` or `id Int @db.UnsignedInt` that does NOT already have `@id`, replace it
const lines = schema.split('\n');
const newLines = lines.map(line => {
  if (line.match(/^\s+id\s+Int/) && !line.includes('@id')) {
    return line.replace(/id\s+Int(\s+@db\.UnsignedInt)?/, 'id Int @id @default(autoincrement())$1');
  }
  return line;
});

fs.writeFileSync(schemaPath, newLines.join('\n'));
console.log('Fixed Prisma Schema Formatting 3!');
