// Type definitions for [~Tastypie Lib~] [~1.0.0~]
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
                throw new TypeError("Provider " + name + " not found.");
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
                throw new TypeError("No registered provider.");
            }
            return this._default_provider;
        };
        return Provider;
    }());
    Provider._providers = [];
    Tastypie.Provider = Provider;
    var Resource = (function () {
        function Resource(endpoint, p) {
            this.objects = new TastypieObjects(this);
            this._endpoint = endpoint;
            this._defaults = p.defaults || {};
            this._provider = p.provider;
        }
        Object.defineProperty(Resource.prototype, "endpoint", {
            get: function () {
                return this._endpoint + '/';
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
        return Resource;
    }());
    Tastypie.Resource = Resource;
    var TastypieObjects = (function () {
        function TastypieObjects(p) {
            this._resource = p;
        }
        TastypieObjects.prototype.get = function (id, params) {
            return axios_1.default({
                method: 'get',
                url: '/' + this._resource.endpoint + id + '/',
                baseURL: this._resource.provider.url,
                responseType: 'json',
                params: params,
                headers: this._resource.provider.headers
            }).then(function (result) {
                return result.data;
            }).catch(function (error) {
                return Promise.reject('[tastypieObjects][get] ' + error);
            });
        };
        TastypieObjects.prototype.delete = function (id, params) {
            return axios_1.default({
                method: 'delete',
                url: '/' + this._resource.endpoint + id + '/',
                baseURL: this._resource.provider.url,
                responseType: 'json',
                params: params,
                headers: this._resource.provider.headers
            }).then(function (result) {
                return result.data;
            }).catch(function (error) {
                return Promise.reject('[tastypieObjects][delete] ' + error);
            });
        };
        TastypieObjects.prototype.update = function (id, data) {
            return axios_1.default({
                method: 'patch',
                url: '/' + this._resource.endpoint + id + '/',
                baseURL: this._resource.provider.url,
                responseType: 'json',
                data: data,
                headers: this._resource.provider.headers
            }).then(function (result) {
                return result.data;
            }).catch(function (error) {
                return Promise.reject('[tastypieObjects][update] ' + error);
            });
        };
        TastypieObjects.prototype.create = function (data) {
            return axios_1.default({
                method: 'post',
                url: '/' + this._resource.endpoint,
                baseURL: this._resource.provider.url,
                responseType: 'json',
                data: data,
                headers: this._resource.provider.headers
            }).then(function (result) {
                return result.data;
            }).catch(function (error) {
                return Promise.reject('[tastypieObjects][create] ' + error);
            });
        };
        TastypieObjects.prototype.find = function (filter) {
            var self = this;
            return axios_1.default({
                method: 'get',
                url: '/' + this._resource.endpoint,
                baseURL: this._resource.provider.url,
                responseType: 'json',
                params: Tools.merge_obj(self._resource.defaults, filter),
                headers: this._resource.provider.headers
            }).then(function (result) {
                return new TastypiePaginator(self._resource, result.data, filter);
            }).catch(function (error) {
                return Promise.reject('[tastypieObjects][find] ' + error);
            });
        };
        return TastypieObjects;
    }());
    Tastypie.TastypieObjects = TastypieObjects;
    var TastypiePaginator = (function () {
        function TastypiePaginator(p, obj, filters) {
            this._resource = p;
            this._defaults = filters || {};
            if (obj) {
                this.setPage(obj);
            }
        }
        Object.defineProperty(TastypiePaginator.prototype, "meta", {
            get: function () {
                return this._meta;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TastypiePaginator.prototype, "objects", {
            get: function () {
                return this._objects;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TastypiePaginator.prototype, "index", {
            get: function () {
                return this._index;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TastypiePaginator.prototype, "length", {
            get: function () {
                return this._length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TastypiePaginator.prototype, "range", {
            get: function () {
                return this._range;
            },
            enumerable: true,
            configurable: true
        });
        TastypiePaginator.prototype.setPage = function (result) {
            this._meta = result.meta;
            this._objects = result.objects;
            this._length = Math.ceil(result.meta.total_count / result.meta.limit);
            if (result.meta.offset == 0)
                this._index = 1;
            else
                this._index = (Math.ceil(result.meta.offset / result.meta.limit) + 1);
            var pgs = [];
            for (var i = 1; i <= this.length; i++) {
                pgs.push(i);
            }
            this._range = pgs;
        };
        TastypiePaginator.prototype.getPage = function (url) {
            var self = this;
            return axios_1.default({
                method: 'get',
                url: url,
                responseType: 'json',
                headers: this._resource.provider.headers
            }).then(function (result) {
                self.setPage(result.data);
                return self;
            }).catch(function (error) {
                return Promise.reject('[tastypiePaginator][getPage] ' + error);
            });
        };
        TastypiePaginator.prototype.changePage = function (index, update) {
            if ((index == this.index) && (!update)) {
                return Promise.reject('[tastypiePaginator][changePage] Index ' + index + ' has already been loaded.');
            }
            if ((index > 0) && (index <= this.length)) {
                var filters = Tools.merge_obj(this._resource.defaults, this._defaults);
                filters['offset'] = ((index - 1) * this.meta.limit);
                var self_1 = this;
                return axios_1.default({
                    method: 'get',
                    url: this._resource.endpoint,
                    responseType: 'json',
                    params: filters,
                    headers: this._resource.provider.headers
                }).then(function (result) {
                    if (result.data.meta.offset == result.data.meta.total_count) {
                        if ((index - 1) == 0) {
                            self_1.setPage(result.data);
                            return self_1;
                        }
                        else {
                            return self_1.changePage((index - 1), true);
                        }
                    }
                    else {
                        self_1.setPage(result.data);
                        return self_1;
                    }
                });
            }
            else {
                return Promise.reject('[tastypiePaginator][changePage] Index ' + index + ' not exist.');
            }
        };
        TastypiePaginator.prototype.change = function (index) {
            return this.changePage(index, false);
        };
        TastypiePaginator.prototype.next = function () {
            if (this.meta.next) {
                return this.getPage(this._resource.provider.domain + this.meta.next);
            }
            else {
                return Promise.reject('[tastypiePaginator][next] Not exist next pages.');
            }
        };
        TastypiePaginator.prototype.previous = function () {
            if (this.meta.previous) {
                return this.getPage(this._resource.provider.domain + this.meta.previous);
            }
            else {
                return Promise.reject('[tastypiePaginator][previous] Not exist previous pages.');
            }
        };
        TastypiePaginator.prototype.refresh = function () {
            return this.changePage(this.index, true);
        };
        TastypiePaginator.prototype.first = function () {
            return this.changePage(1, false);
        };
        TastypiePaginator.prototype.last = function () {
            return this.changePage(this.length, false);
        };
        return TastypiePaginator;
    }());
    Tastypie.TastypiePaginator = TastypiePaginator;
})(Tastypie = exports.Tastypie || (exports.Tastypie = {}));
