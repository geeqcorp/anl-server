'use strict';

/**
 * Module dependencies
 */

let anl = require('./app/lib/anl.lib'),
    config = require('./config'),
    loki = require('lokijs'),
    lfsa = require('./node_modules/lokijs/src/loki-fs-structured-adapter.js');

/**
 * Main application, order of loading is important
 */

// Init the express app
let app = require('./express')();

let port = config.port;

// Get DB going
let adapter = new lfsa();

let db = new loki('./data/geeq_anl.json', {
    autoload: true,
    autoloadCallback: initAnl,
    autosave: true,
    autosaveInterval: 10000
});

function initAnl() {
    anl.init(app, db);

    setInterval(function() { anl.update(app)}, 30000);

    app.listen(port, config.ip);
    console.log('GEEQ ANL Server started on port ' + port + ' with IP ' + config.ip);

    anl.update(app);
}

var exports = module.exports = app;

process.on('SIGINT', function() {
    console.log('Flushing DB');
    db.close();
    process.exit(0);
});
