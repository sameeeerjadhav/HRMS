const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace bad formatting
schema = schema.replace(/id Int @id @default\(autoincrement\(\)\) ([a-zA-Z_]+)/g, 'id Int @id @default(autoincrement())\n  $1');

fs.writeFileSync(schemaPath, schema);
console.log('Fixed Prisma Schema Formatting!');
