const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Remove @@ignore lines completely
schema = schema.replace(/@@ignore\n?/g, '');

// For any line that has `id Int`, replace it with `id Int @id @default(autoincrement())`
schema = schema.replace(/(\s+)id\s+Int(\s+@db\.UnsignedInt)?/g, '$1id Int @id @default(autoincrement()) $2');

// Fix formatting slightly
schema = schema.replace(/(\s+)id Int @id @default\(autoincrement\(\)\) \s+/g, '$1id Int @id @default(autoincrement()) ');

fs.writeFileSync(schemaPath, schema);
console.log('Fixed Prisma Schema!');
