const mysql = require('mysql');
const fastcsv = require("fast-csv");
const fs = require("fs");

const conn = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    port: "3306",
    database: "kuliah",
    charset: "utf8mb4",
    timezone: "+07:00"

});

conn.getConnection((err) => {
    if (err) throw err;
    console.log('Woi Konek dah konek');
});
module.exports = conn, fastcsv, fs;