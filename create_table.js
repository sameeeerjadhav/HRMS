const mariadb = require('mariadb');

async function main() {
  const pool = mariadb.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '',
    database: 'u587292075_portal'
  });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS u587292075_portal.employee_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT UNSIGNED,
        doc_type VARCHAR(100),
        doc_key VARCHAR(100),
        file_path VARCHAR(255),
        original_name VARCHAR(255),
        mime_type VARCHAR(100),
        file_size INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_emp_doc (employee_id)
      );
    `);
    console.log("Table created successfully via mariadb.");
  } catch (err) {
    console.error("Error connecting to DB:", err);
  } finally {
    if (conn) conn.release();
    pool.end();
  }
}

main();
