#!/usr/bin/env node

process.env.PORT = Number(process.argv[2] || 8081);
process.env.LOGGER = (process.argv[3]);

var url = require('url')
	, os = require("os")
	, express = require('express')
	, app = express();


app.configure(function () {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(function(req, res, next) {
    	console.log('==========================================================');
    	console.log('==========================================================');
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    });
    app.use(app.router);
    if (process.env.LOGGER) app.use(express.logger());
    app.use('/', express.static(__dirname + '/'));
});

app.listen(process.env.PORT, null);

// console.log('STARTED SERVER WITH PORT ' + process.env.PORT);

