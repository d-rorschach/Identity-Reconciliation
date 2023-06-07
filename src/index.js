var Order = require('./model/customer');
// const dboperations = require('./model/dboperations');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const env = require('dotenv');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// const bodyParser = require('body-parser');
const router = require('./route/user');

env.config();
// app.use(bodyParser);
app.use('/', router);
// sqlcmd -S localhost -U sa -P 'Anuska@123'

app.listen(process.env.PORT, () =>{console.log(`server is running on port ${process.env.PORT}`);});