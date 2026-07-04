const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace provider
schema = schema.replace(/provider\s*=\s*"mysql"/, 'provider = "postgresql"');

// Remove @db.* annotations like @db.UnsignedInt, @db.VarChar(255), @db.Timestamp(0), @db.Decimal(12, 2)
// This regex matches @db. followed by word characters, optionally followed by parentheses with arguments.
schema = schema.replace(/@db\.\w+(\([^)]*\))?/g, '');

// Clean up any extra spaces left before newlines or other annotations
schema = schema.replace(/ \s+@/g, ' @');
schema = schema.replace(/ \s+\n/g, '\n');

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log("Schema updated for PostgreSQL");
