const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv');
const app = express();
const router = require('./route/user');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


env.config();
app.use('/', router);

app.listen(process.env.PORT, () =>{console.log(`server is running on port ${process.env.PORT}`);});