const { execSync } = require('child_process');

console.log("Dropping and recreating database...");
execSync('c:\\xampp\\mysql\\bin\\mysql.exe -u root -e "DROP DATABASE IF EXISTS u587292075_portal;"');
execSync('c:\\xampp\\mysql\\bin\\mysql.exe -u root -e "CREATE DATABASE u587292075_portal;"');

console.log("Importing clean data from SQL dump...");
execSync('cmd.exe /c "c:\\xampp\\mysql\\bin\\mysql.exe -u root u587292075_portal < c:\\xampp\\htdocs\\Portal\\u587292075_portal.sql"');

// Now add primary keys and auto_increment
const tables = [
  'acl_requests', 'app_settings', 'attendance_locations', 'attendance_logs', 'attendance_regularizations',
  'audit_log', 'custom_field_meta', 'departments', 'employees', 'fnf_settlements', 'holidays',
  'leave_applications', 'leave_balances', 'leave_credit_log', 'leave_types', 'login_attempts',
  'password_resets', 'payslips', 'project_expenses', 'project_invoices', 'projects', 'salary_structures',
  'task_assignments', 'task_progress_logs', 'user_locations', 'user_mfa_backup_codes', 'users'
];

console.log("Adding PRIMARY KEY and AUTO_INCREMENT...");
for (const table of tables) {
  try {
    execSync(`c:\\xampp\\mysql\\bin\\mysql.exe -u root -e "ALTER TABLE ${table} ADD PRIMARY KEY (id), MODIFY id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT;" u587292075_portal`);
    console.log(`Successfully added constraints to ${table}`);
  } catch(e) {
    console.log(`Failed to alter ${table}: ${e.message}`);
  }
}
console.log("Done resetting database!");
