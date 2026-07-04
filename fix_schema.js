const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Fix lines where @@index or @@unique got appended to a field definition
// e.g. "  created_at DateTime @default(now()) @@index([work_date])" -> "  created_at DateTime @default(now())\n  @@index([work_date])"
schema = schema.replace(/ (@@index|@@unique)/g, '\n  $1');

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log("Schema formatting fixed.");
