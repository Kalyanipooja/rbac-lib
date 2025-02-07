const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool (recommended for better performance)
const db = mysql.createPool({
host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rbac_db'
});
console.log("vgh");
// Function to get user roles from the database
async function getUserRoles(userId) {
  try {
    const [results] = await db.execute(
      `SELECT roles.name AS role
       FROM users
       JOIN user_roles ON users.id = user_roles.user_id
       JOIN roles ON user_roles.role_id = roles.id
       WHERE users.id = ?;`,
      [userId]
    );

    return results.map((row) => row.role);
  } catch (err) {
    console.error("Database error in getUserRoles:", err);
    return [];
  }
}

// Function to get user permissions
async function getUserPermissions(userId) {
  try {
    const [results] = await db.execute(
      `SELECT permissions.name AS permission
       FROM users
       JOIN user_roles ON users.id = user_roles.user_id
       JOIN roles ON user_roles.role_id = roles.id
       JOIN role_permissions ON roles.id = role_permissions.role_id
       JOIN permissions ON role_permissions.permission_id = permissions.id
       WHERE users.id = ?;`,
      [userId]
    );

    return results.map((row) => row.permission);
  } catch (err) {
    console.error("Database error in getUserPermissions:", err);
    return [];
  }
}

// Check if a user has a specific permission
async function hasPermission(userId, permissionName) {
  try {
    const permissions = await getUserPermissions(userId);
    return permissions.includes(permissionName);
  } catch (err) {
    console.error("Error in hasPermission:", err);
    return false;
  }
}

// Check if a user has a specific role
async function hasRole(userId, roleName) {
  try {
    const roles = await getUserRoles(userId);
    return roles.includes(roleName);
  } catch (err) {
    console.error("Error in hasRole:", err);
    return false;
  }
}

// Export functions
module.exports = {
  getUserRoles,
  getUserPermissions,
  hasPermission,
  hasRole,
};
