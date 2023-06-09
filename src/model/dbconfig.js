
const config = {
    user :'foo',
    password :'foo',
    server:'127.0.0.1',
    database:'bitespeed',
    options:{
        trustedconnection: true,
        enableArithAbort : true, 
        trustServerCertificate: true
    },
    port : 1433
}

module.exports = config; 