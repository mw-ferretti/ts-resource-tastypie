// Type definitions for [~Tastypie Lib~] [~1.0.2~]
// Project: [~ts-resource-tastypie~]
// Definitions by: [~MARCOS WILLIAM FERRETTI~] <[~https://github.com/mw-ferretti~]>
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Tastypie;
(function (Tastypie) {
    var Tools = (function () {
        function Tools() {
        }
        Tools.extract_domain = function (url) {
            if (url.indexOf("://") > -1) {
                return url.split('/')[0] + '//' + url.split('/')[2].split('/')[0];
            }
            else {
                return url.split('/')[0];
            }
        };
        Tools.merge_obj = function (obj1, obj2) {
            if (obj1 === void 0) { obj1 = {}; }
            if (obj2 === void 0) { obj2 = {}; }
            var obj3 = {};
            for (var attrname in obj1) {
                obj3[attrname] = obj1[attrname];
            }
            for (var attrname in obj2) {
                obj3[attrname] = obj2[attrname];
            }
            return obj3;
        };
        Tools.generate_exception = function (msg) {
            if (typeof (console) == "object")
                console.log(msg);
            return Promise.reject(msg);
        };
        return Tools;
    }());
    Tastypie.Tools = Tools;
    var Provider = (function () {
        function Provider(p) {
            this.name = p.name;
            this.url = p.url;
            this.username = p.username || '';
            this.apikey = p.apikey || '';
            this.headers = p.headers || {};
            this.headers['Content-Type'] = 'application/json';
            if (this.username && this.apikey) {
                this.headers['Authorization'] = 'ApiKey '.concat(this.username, ':', this.apikey);
            }
            this.domain = Tools.extract_domain(this.url);
        }
        Provider.add = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            for (var _a = 0, p_1 = p; _a < p_1.length; _a++) {
                var provider = p_1[_a];
                for (var i = 0; i < this._providers.length; i++) {
                    if (this._providers[i].name == provider.name) {
                        this._providers.splice(i, 1);
                    }
                }
                this._providers.push(provider);
                if (!this._default_provider) {
                    this._default_provider = provider;
                }
            }
        };
        Provider.get = function (name) {
            var ret;
            for (var _i = 0, _a = this._providers; _i < _a.length; _i++) {
                var provider = _a[_i];
                if (name == provider.name) {
                    ret = provider;
                    break;
                }
            }
            if (!ret) {
                throw new TypeError("[TastypieProvider][get] Provider " + name + " not found.");
            }
            return ret;
        };
        Provider.setDefault = function (name) {
            for (var _i = 0, _a = this._providers; _i < _a.length; _i++) {
                var provider = _a[_i];
                if (name == provider.name) {
                    this._default_provider = provider;
                    break;
                }
            }
        };
        Provider.getDefault = function () {
            if (!this._default_provider) {
                throw new TypeError("[TastypieProvider][getDefault] No registered provider.");
            }
            return this._default_provider;
        };
        return Provider;
    }());
    Provider._providers = [];
    Tastypie.Provider = Provider;
    var Resource = (function () {
        function Resource(endpoint, p) {
            this._objects = new Objects(this);
            this._endpoint = endpoint;
            if (p) {
                this._defaults = p.defaults || {};
                this._provider = p.provider;
                this._model = p.model;
            }
        }
        Object.defineProperty(Resource.prototype, "endpoint", {
            get: function () {
                return this._endpoint + '/';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "provider", {
            get: function () {
                if (!this._provider) {
                    return Provider.getDefault();
                }
                else {
                    return Provider.get(this._provider);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "defaults", {
            get: function () {
                return this._defaults;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "objects", {
            get: function () {
                return this._objects;
            },
            enumerable: true,
            configurable: true
        });
        return Resource;
    }());
    Tastypie.Resource = Resource;
    var Objects = (function () {
        function Objects(p) {
            this._resource = p;
        }
        Objects.prototype.get = function (id, params) {
            var _self = this;
            return axios_1.default({
                method: 'get',
                url: '/' + _self._resource.endpoint + id + '/',
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                params: params,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model();
                    _obj.setData(result.data);
                    return _obj;
                }
                else {
                    return result.data;
                }
            }).catch(function (error) {
                return Tools.generate_exception('[TastypieObjects][get] ' + error);
            });
        };
        Objects.prototype.delete = function (id, params) {
            var _self = this;
            return axios_1.default({
                method: 'delete',
                url: '/' + _self._resource.endpoint + id + '/',
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                params: params,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model();
                    _obj.setData(result.data);
                    return _obj;
                }
                else {
                    return result.data;
                }
            }).catch(function (error) {
                return Tools.generate_exception('[TastypieObjects][delete] ' + error);
            });
        };
        Objects.prototype.update = function (id, data) {
            var _self = this;
            return axios_1.default({
                method: 'patch',
                url: '/' + _self._resource.endpoint + id + '/',
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                data: data,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model();
                    _obj.setData(result.data);
                    return _obj;
                }
                else {
                    return result.data;
                }
            }).catch(function (error) {
                return Tools.generate_exception('[TastypieObjects][update] ' + error);
            });
        };
        Objects.prototype.create = function (data) {
            var _self = this;
            return axios_1.default({
                method: 'post',
                url: '/' + _self._resource.endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                data: data,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model();
                    _obj.setData(result.data);
                    return _obj;
                }
                else {
                    return result.data;
                }
            }).catch(function (error) {
                return Tools.generate_exception('[TastypieObjects][create] ' + error);
            });
        };
        Objects.prototype.save = function (data) {
            if (data.id) {
                return this.update(data.id, data);
            }
            else {
                return this.create(data);
            }
        };
        Objects.prototype.find = function (filter) {
            var _self = this;
            return axios_1.default({
                method: 'get',
                url: '/' + _self._resource.endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                params: Tools.merge_obj(_self._resource.defaults, filter),
                headers: _self._resource.provider.headers
            }).then(function (result) {
                return new Paginator(_self._resource, result.data, filter);
            }).catch(function (error) {
                return Tools.generate_exception('[TastypieObjects][find] ' + error);
            });
        };
        return Objects;
    }());
    Tastypie.Objects = Objects;
    var Paginator = (function () {
        function Paginator(p, obj, filters) {
            this._resource = p;
            this._defaults = filters || {};
            this._objects = [];
            if (obj) {
                this.setPage(this, obj);
            }
        }
        Object.defineProperty(Paginator.prototype, "meta", {
            get: function () {
                return this._meta;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paginator.prototype, "objects", {
            get: function () {
                return this._objects;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paginator.prototype, "index", {
            get: function () {
                return this._index;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paginator.prototype, "length", {
            get: function () {
                return this._length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paginator.prototype, "range", {
            get: function () {
                return this._range;
            },
            enumerable: true,
            configurable: true
        });
        Paginator.prototype.setPage = function (_self, result) {
            _self._meta = result.meta;
            if (_self._resource.model) {
                for (var ix1 = 0; ix1 < result.objects.length; ix1++) {
                    var _obj = new _self._resource.model();
                    _obj.setData(result.objects[ix1]);
                    _self._objects.push(_obj);
                }
            }
            else {
                _self._objects = result.objects;
            }
            _self._length = Math.ceil(result.meta.total_count / result.meta.limit);
            if (result.meta.offset == 0)
                _self._index = 1;
            else
                _self._index = (Math.ceil(result.meta.offset / result.meta.limit) + 1);
            var pgs = [];
            for (var ix2 = 1; ix2 <= _self.length; ix2++) {
                pgs.push(ix2);
            }
            _self._range = pgs;
        };
        Paginator.prototype.getPage = function (_self, url) {
            return axios_1.default({
                method: 'get',
                url: url,
                responseType: 'json',
                headers: _self._resource.provider.headers
            }).then(function (result) {
                _self.setPage(_self, result.data);
                return _self;
            }).catch(function (error) {
                return Tools.generate_exception('[TastypiePaginator][getPage] ' + error);
            });
        };
        Paginator.prototype.changePage = function (_self, index, update) {
            if ((index == _self.index) && (!update)) {
                return Tools.generate_exception('[TastypiePaginator][changePage] Index ' + index + ' has already been loaded.');
            }
            if ((index > 0) && (index <= _self.length)) {
                var filters = Tools.merge_obj(_self._resource.defaults, _self._defaults);
                filters['offset'] = ((index - 1) * _self.meta.limit);
                return axios_1.default({
                    method: 'get',
                    url: _self._resource.endpoint,
                    responseType: 'json',
                    params: filters,
                    headers: _self._resource.provider.headers
                }).then(function (result) {
                    if (result.data.meta.offset == result.data.meta.total_count) {
                        if ((index - 1) == 0) {
                            _self.setPage(_self, result.data);
                            return _self;
                        }
                        else {
                            return _self.changePage(_self, (index - 1), true);
                        }
                    }
                    else {
                        _self.setPage(_self, result.data);
                        return _self;
                    }
                }).catch(function (error) {
                    return Tools.generate_exception('[TastypiePaginator][changePage] ' + error);
                });
            }
            else {
                return Tools.generate_exception('[TastypiePaginator][changePage] Index ' + index + ' not exist.');
            }
        };
        Paginator.prototype.change = function (index) {
            return this.changePage(this, index, false);
        };
        Paginator.prototype.next = function () {
            if (this.meta.next) {
                return this.getPage(this, this._resource.provider.domain + this.meta.next);
            }
            else {
                return Tools.generate_exception('[TastypiePaginator][next] Not exist next pages.');
            }
        };
        Paginator.prototype.previous = function () {
            if (this.meta.previous) {
                return this.getPage(this, this._resource.provider.domain + this.meta.previous);
            }
            else {
                return Tools.generate_exception('[TastypiePaginator][previous] Not exist previous pages.');
            }
        };
        Paginator.prototype.refresh = function () {
            return this.changePage(this, this.index, true);
        };
        Paginator.prototype.first = function () {
            return this.changePage(this, 1, false);
        };
        Paginator.prototype.last = function () {
            return this.changePage(this, this.length, false);
        };
        return Paginator;
    }());
    Tastypie.Paginator = Paginator;
    var Model = (function () {
        function Model(resource, _obj) {
            this._resource = resource;
            if (_obj) {
                this.setData(_obj);
            }
        }
        Model.prototype.save = function (obj) {
            var _self = this;
            var to_save = (obj || _self.getData());
            return _self._resource.objects.save(to_save).then(function (r) {
                _self.setData(r);
                return r;
            });
        };
        Model.prototype.getData = function () {
            var _self = this;
            var selflist = {};
            for (var attrname in _self) {
                if (typeof _self[attrname] !== 'function') {
                    if (String(attrname).charAt(0) != '_') {
                        selflist[attrname] = _self[attrname];
                    }
                }
            }
            return selflist;
        };
        Model.prototype.setData = function (toself) {
            var _self = this;
            for (var attrname in toself) {
                _self[attrname] = toself[attrname];
            }
        };
        return Model;
    }());
    Tastypie.Model = Model;
})(Tastypie = exports.Tastypie || (exports.Tastypie = {}));
//# sourceMappingURL=tastypie.js.map