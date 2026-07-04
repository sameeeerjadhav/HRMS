const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Remove map: "..." arguments
// Handle cases like:
// @@index([log_date], map: "idx_log_date")
// @relation(fields: [...], references: [...], onUpdate: Restrict, map: "fk_...")
// @@unique([a, b], map: "uq_...")

schema = schema.replace(/,\s*map:\s*"[^"]+"/g, '');
schema = schema.replace(/map:\s*"[^"]+"\s*,/g, ''); // just in case it's the first arg
schema = schema.replace(/\(\s*map:\s*"[^"]+"\s*\)/g, '()'); // if it was the only arg

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log("Removed map attributes from schema.");
