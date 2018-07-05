'use strict';

/**
 * Module dependencies
 */

let http = require('http');
let update = exports.update;

exports.init = function(app, db) {
    let hosts = db.getCollection('hosts');

    if (hosts === null) {
        hosts = db.addCollection('hosts', {
            unique: ['host']
        });
    }

    app.set('hosts', hosts);
};

exports.update = function(app) {
    let hosts = app.get('hosts');
    let hostList = hosts.chain().data({removeMeta: true});

    let completed_requests = 0;

    if (hosts.count() === 0) return;

    // console.log('Updating ANL...');

    hostList.forEach(function(host) {
        // console.log('Contacting host ' + host.host + '...');

        http.request({hostname: host.host, port: 12626, path: '/heartbeat', timeout: 5000 }, (res) => {
            completed_requests++;
        }).on('error', (e) => {
            if (e.code === 'ECONNREFUSED' || e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT') {
                completed_requests++;
                let badhost = hosts.findOne({host: e.address});
                hosts.remove(badhost);
                // console.log('Timeout connecting to ' + e.address + '. Removed from ANL.');
            }
            //console.error('Error: ' + JSON.stringify(e));
        });

    });
};
