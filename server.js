'use strict';

/**
 * Module dependencies
 */

let request = require('request'),
    http = require('http'),
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
    let hosts = db.getCollection('hosts');

    if (hosts === null) {
        hosts = db.addCollection('hosts', {
            unique: ['host']
        });
    }

    app.set('hosts', hosts);

    setInterval(updateAnl, 30000);

    app.listen(port, config.ip);
    console.log('GEEQ ANL Server started on port ' + port + ' with IP ' + config.ip);

    updateAnl();
}

var exports = module.exports = app;

function updateAnl() {
    let hosts = app.get('hosts');
    let hostList = hosts.chain().data({removeMeta: true});

    let completed_requests = 0;

    if (hosts.count() === 0) return;

    console.log('Updating ANL...');

    hostList.forEach(function(host) {
        console.log('Contacting host ' + host.host + '...');

        http.get({hostname: host.host, port: 12626, path: '/heartbeat', timeout: 5000 }, (res) => {
            completed_requests++;
            if (completed_requests === hostList.length) {
                console.log('ANL updated.');
            }
        }).on('error', (e) => {
            if (e.code === 'ECONNREFUSED' || e.code === 'ETIMEOUT') {
                completed_requests++;
                let badhost = hosts.findOne({host: e.address});
                hosts.remove(badhost);
                console.log('Timeout connecting to ' + e.address + '. Removed from ANL.');
            }
            //console.error('Error: ' + JSON.stringify(e));
        });
        if (completed_requests === hostList.length) {
            console.log('ANL updated.');
        }

    });
}


process.on('SIGINT', function() {
    console.log('Flushing DB');
    db.close();
    process.exit(0);
});
