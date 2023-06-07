var config = require('./dbconfig');
const sql = require('mssql');


async function getCustomers() {
    try {
        let pool = await sql.connect(config);
        console.log('db connected');
        let customers = await pool.request().query("SELECT * from Customer");
        console.log(customers);
        return customers.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    getCustomers: getCustomers
}