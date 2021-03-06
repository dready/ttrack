'use strict';

var _ = require('lodash');
var rest = require('rest');
var mime = require('rest/interceptor/mime');
var mimeReg = require('rest/mime/registry');
var errorCode = require('rest/interceptor/errorCode');
var Immutable = require('immutable');

var myro = require('myro');

mimeReg.register('application/json', {
    read: function (str, opts) {
        return Immutable.fromJS(JSON.parse(str));
    },
    write: function (obj, opts) {
        return JSON.stringify(obj.toJS());
    }
});

var client = rest.wrap(mime).wrap(errorCode);

function fetch(uri) {
    return client(uri).then(res => res.entity);
}

function cancelRequest(req) {
    //console.log('canceling', req);
    if (req.cancel) {
        req.cancel();
    } else if (req.canceled !== true) {
        // req not initialized -> precancel
        req.canceled = true;
    } else {
        throw new Error('unexpected request state');
    }
}

function save(method, uri, obj) {
    return client({method: method, path: uri, entity: obj, headers: {'Content-Type': 'application/json'}})
        .then(function (response) {
            console.log('response', response);
            return response.entity;
        });
}

function collection(uri) {
    var route = myro({[uri]: 'uri'});
    var _data = Immutable.List();
    let req = null;
    return {
        load: function () {
            if (req) cancelRequest(req);
            req = {path: uri};
            return fetch(req).then(entity => {
                _data = entity;
                req = null;
            });
        },
        cancel: function () {
            if (req) cancelRequest(req);
            req = null;
        },
        save: function (obj) {
            return save('post', route.uri(obj.toJS()), obj);
        },
        list: () => _data
    };
}

function single(uri) {
    var route = myro({[uri]: 'uri'});
    var _data = Immutable.Map();
    let req = null;
    return {
        load: function (params) {
            if (req) cancelRequest(req);
            req = {path: route.uri(params)};
            return fetch(req).then(entity => {
                _data = entity;
                req = null;
            });
        },
        cancel() {
            if (req) cancelRequest(req);
            req = null;
        },
        get: () => _data,
        save: function (obj) {
            return save('put', route.uri(obj.toJS()), obj);
        },
        remove: function (params) {
            return client({method: 'delete', path: route.uri(params), headers: {'Content-Type': 'application/json'}})
                .then(function (response) {
                    console.log('delete response', response);
                    return response;
                });
        }
    };
}

module.exports = {collection, single};
