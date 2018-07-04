'use strict';

module.exports = function(app) {
    let core = require('./controller.server');
    app.route('/').get(core.index);

    app.route('/add').post(core.addHost);
};