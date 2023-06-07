
const config = {
    user :'sa',
    password :'Anuska@123',
    server:'127.0.0.1',
    database:'bitespeed',
    options:{
        trustedconnection: true,
        enableArithAbort : true, 
        trustServerCertificate: true
        // instancename :'SQLEXPRESS'
    },
    port : 1433
}

module.exports = config; 