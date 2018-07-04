'use strict';

/**
 * The config
 */
module.exports = {
    app: {
        title: 'geeq-anl-server',
        description: 'The authoritative ANL server for GEEQ.',
        keywords: 'Express, Node.js, blockchain'
    },
    port: process.env.PORT || 12626,
    ip: process.env.IP || '127.0.0.1'
};
