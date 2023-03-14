const mysql = require('mysql')

const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Host name for database connection:
  port: process.env.DB_PORT, // Port number for database connection:
  user: process.env.DB_USER, // Database user:
  password: process.env.DB_PASSWORD, // Password for the above database user:
  database: process.env.DATABASE // Database name:
})
connection.connect()

module.exports = connection