const express = require('express');
const dboperations = require('../model/dbopertaions');
var config = require('../model/dbconfig');
const sql = require('mssql');
// const { identify } = require('../controller/identityCheck');
const router = express.Router();

router.post('/identify', async function(req, res) {

    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    let pool = await sql.connect(config);
    console.log('db connected');
    // let count = await pool.request().query(`SELECT id FROM Customer WHERE email = "${email}" OR phoneNumber = "${phoneNumber}"`);
    let result = await pool.request().query(`SELECT * FROM Customer WHERE email = '${email}' OR phoneNumber = '${phoneNumber}'`);
    console.log("here we goooooooooooo!!!!!!!!!!!");
    console.log(result.recordset.length);
    let count = result.recordset.length;
    if(count  == 0) {
        await pool.request()
        .input('id', sql.Int, order.Id)
        .input('Title', sql.NVarChar, order.Title)
        .input('Quantity', sql.Int, order.Quantity)
        .input('Message', sql.NVarChar, order.Message)
        .input('City', sql.NVarChar, order.City)
        .execute('InsertOrders');
    }
    res.json(result.recordset);


    // dboperations.getCustomers().then(result => {
    //     console.log(result);
    //    response.json(result);
    // })

});

module.exports = router;