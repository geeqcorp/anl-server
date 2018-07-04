'use strict';

exports.index = function(req, res) {
    let hosts = req.app.get('hosts');
    let hostList = hosts.chain().data({removeMeta: true});

    res.json(hostList);
};

exports.addHost = function(req, res) {
    let hosts = req.app.get('hosts');

    let exists = hosts.findOne({host: req.body.host});

    if (exists !== null) {
        res.json({message: 'Host is already in the ANL.'});
        return;
    }

    hosts.insert({host: req.body.host});

    res.json({message: 'Host added'});
};