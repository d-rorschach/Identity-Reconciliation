const express = require('express');
const { identify } = require('../controller/identityCheck');
const router = express.Router();

router.post('/identify', identify);

module.exports = router;