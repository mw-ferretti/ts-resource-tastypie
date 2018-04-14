"use strict";
// Type definitions for [~Tastypie Lib~] [~1.0.36~]
// Project: [~ts-resource-tastypie~]
// Definitions by: [~MARCOS WILLIAM FERRETTI~] <[~https://github.com/mw-ferretti~]>
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Tastypie;
(function (Tastypie) {
    var Working = /** @class */ (function () {
        function Working() {
            this._status = 0;
        }
        Object.defineProperty(Working.prototype, "status", {
            get: function () {
                return this._status > 0;
            },
            set: function (p) {
                this._status += p ? 1 : this._status ? -1 : 0;
                Working.status = p;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Working, "status", {
            get: function () {
                return this._status > 0;
            },
            set: function (p) {
                this._status += p ? 1 : this._status ? -1 : 0;
            },
            enumerable: true,
            configurable: true
        });
        Working._status = 0;
        return Working;
    }());
    Tastypie.Working = Working;
    var HttpExceptions = /** @class */ (function () {
        function HttpExceptions(httpCode, callback) {
            this.httpCode = httpCode;
            this.callback = callback;
        }
        HttpExceptions.add = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            for (var _a = 0, p_1 = p; _a < p_1.length; _a++) {
                var except = p_1[_a];
                if (typeof (except.callback) === "function") {
                    for (var i = 0; i < this._httpExceptions.length; i++) {
                        if (this._httpExceptions[i].httpCode == except.httpCode) {
                            this._httpExceptions.splice(i, 1);
                        }
                    }
                    this._httpExceptions.push(except);
                }
                else {
                    throw new TypeError("[HttpExceptions][add] Callback to '" + except.httpCode + "' not is a function.");
                }
            }
        };
        HttpExceptions.get = function (httpCode) {
            var ret;
            for (var _i = 0, _a = this._httpExceptions; _i < _a.length; _i++) {
                var except = _a[_i];
                if (except.httpCode == httpCode) {
                    ret = except;
                    break;
                }
            }
            return ret;
        };
        HttpExceptions._httpExceptions = [];
        return HttpExceptions;
    }());
    Tastypie.HttpExceptions = HttpExceptions;
    var Tools = /** @class */ (function () {
        function Tools() {
        }
        Tools.extract_domain = function (url) {
            if (url.indexOf("://") > -1) {
                return url.split('/')[2].split('/')[0];
            }
            else {
                return "";
            }
        };
        Tools.extract_protocol = function (url) {
            return url.split(':')[0];
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
        Tools.generate_resolve = function (msg) {
            if (typeof (console) == "object")
                console.log(msg);
            return Promise.resolve(msg);
        };
        Tools.trigger_http_exception = function (moduleName, error) {
            error = error || {};
            error.response = error.response || {};
            error.response.statusText = moduleName.concat(' HTTP_', error.response.status, ' - ', error.response.statusText || ' Server Not Responding.');
            if (typeof (console) == "object") {
                console.log('');
                console.log('-----------------------');
                console.log(error.response.statusText);
                console.log(moduleName.concat(' ', 'DATA RESP.:'));
                console.log(error.response.data);
                console.log('-----------------------');
                console.log('');
            }
            var fn = HttpExceptions.get(+error.response.status);
            if (fn)
                fn.callback(error.response);
            return Promise.reject(error.response);
        };
        Tools.getProperties = function (data) {
            var properties = [];
            for (var property in data) {
                if (data.hasOwnProperty(property) && property.charAt(0) != '_') {
                    properties.push(property);
                }
            }
            return properties;
        };
        return Tools;
    }());
    Tastypie.Tools = Tools;
    var Provider = /** @class */ (function () {
        function Provider(p) {
            this._name = p.name;
            this._url = p.url;
            this._username = p.username || '';
            this._apikey = p.apikey || '';
            this._headers = p.headers || {};
            this._headers['Content-Type'] = 'application/json';
            if (this._username && this._apikey) {
                this._headers['Authorization'] = 'ApiKey '.concat(this._username, ':', this._apikey);
            }
            this._domain = Tools.extract_domain(this._url);
            this._protocol = Tools.extract_protocol(this._url);
        }
        Object.defineProperty(Provider.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Provider.prototype, "url", {
            get: function () {
                return this._url;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Provider.prototype, "protocol", {
            get: function () {
                return this._protocol;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Provider.prototype, "domain", {
            get: function () {
                return this._domain;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Provider.prototype, "username", {
            get: function () {
                return this._username;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Provider.prototype, "apikey", {
            get: function () {
                return this._apikey;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Provider.prototype, "headers", {
            get: function () {
                return this._headers;
            },
            enumerable: true,
            configurable: true
        });
        Provider.prototype.concatDomain = function (p) {
            return this.protocol + '://' + this.domain + p;
        };
        Provider.prototype.concatSubDomain = function (p) {
            return this.protocol + '://' + p + '.' + this.domain;
        };
        Provider.add = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            for (var _a = 0, p_2 = p; _a < p_2.length; _a++) {
                var provider = p_2[_a];
                for (var i = 0; i < this._providers.length; i++) {
                    if (this._providers[i].name == provider.name) {
                        this._providers.splice(i, 1);
                    }
                }
                this._providers.push(provider);
                if (!this._default_provider) {
                    this._default_provider = provider;
                }
                else {
                    if (this._default_provider.name == provider.name) {
                        this._default_provider = provider;
                    }
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
                throw new TypeError("[Tastypie][Provider][get] Provider " + name + " not found.");
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
                throw new TypeError("[Tastypie][Provider][getDefault] No registered provider.");
            }
            return this._default_provider;
        };
        Provider.setAuth = function (providerName, username, apikey) {
            var default_provider = this.getDefault();
            var found = false;
            for (var _i = 0, _a = this._providers; _i < _a.length; _i++) {
                var provider = _a[_i];
                if (providerName == provider.name) {
                    provider.headers['Authorization'] = 'ApiKey '.concat(username, ':', apikey);
                    if (default_provider.name == provider.name) {
                        this.setDefault(provider.name);
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new TypeError("[Tastypie][Provider][setAuth] Provider '" + providerName + "' not found.");
            }
        };
        Provider._providers = [];
        return Provider;
    }());
    Tastypie.Provider = Provider;
    var Resource = /** @class */ (function () {
        function Resource(endpoint, p) {
            this._objects = new Objects(this);
            this._page = new Paginator(this);
            this._working = new Working();
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
        Object.defineProperty(Resource.prototype, "page", {
            get: function () {
                return this._page;
            },
            set: function (p) {
                this._page = p;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "working", {
            get: function () {
                return this._working;
            },
            set: function (p) {
                this._working = p;
            },
            enumerable: true,
            configurable: true
        });
        return Resource;
    }());
    Tastypie.Resource = Resource;
    var Objects = /** @class */ (function () {
        function Objects(p) {
            this._resource = p;
        }
        Objects.prototype.get = function (id, params) {
            var _self = this;
            _self._resource.working.status = true;
            var endpoint = '/' + _self._resource.endpoint + id + '/';
            if (_self._resource.endpoint.indexOf("<id>") !== -1) {
                endpoint = '/' + _self._resource.endpoint.replace("<id>", String(id));
            }
            return axios_1.default({
                method: 'get',
                url: endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                params: params,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model(result.data);
                    _self._resource.working.status = false;
                    return _obj;
                }
                else {
                    _self._resource.working.status = false;
                    return result.data;
                }
            }).catch(function (error) {
                _self._resource.working.status = false;
                return Tools.trigger_http_exception("[Tastypie][Objects][get]", error);
            });
        };
        Objects.prototype.delete = function (id, params) {
            var _self = this;
            _self._resource.working.status = true;
            var endpoint = '/' + _self._resource.endpoint + id + '/';
            if (_self._resource.endpoint.indexOf("<id>") !== -1) {
                endpoint = '/' + _self._resource.endpoint.replace("<id>", String(id));
            }
            return axios_1.default({
                method: 'delete',
                url: endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                params: params,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model(result.data);
                    _self._resource.working.status = false;
                    if (_self._resource.page.initialized)
                        _self._resource.page.refresh();
                    return _obj;
                }
                else {
                    _self._resource.working.status = false;
                    if (_self._resource.page.initialized)
                        _self._resource.page.refresh();
                    return result.data;
                }
            }).catch(function (error) {
                _self._resource.working.status = false;
                return Tools.trigger_http_exception("[Tastypie][Objects][delete]", error);
            });
        };
        Objects.prototype.update = function (id, data) {
            var _self = this;
            _self._resource.working.status = true;
            var endpoint = '/' + _self._resource.endpoint + id + '/';
            if (_self._resource.endpoint.indexOf("<id>") !== -1) {
                endpoint = '/' + _self._resource.endpoint.replace("<id>", String(id));
            }
            return axios_1.default({
                method: 'patch',
                url: endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                data: data,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model(result.data);
                    _self._resource.working.status = false;
                    if (_self._resource.page.initialized)
                        _self._resource.page.refresh();
                    return _obj;
                }
                else {
                    _self._resource.working.status = false;
                    if (_self._resource.page.initialized)
                        _self._resource.page.refresh();
                    return result.data;
                }
            }).catch(function (error) {
                _self._resource.working.status = false;
                return Tools.trigger_http_exception("[Tastypie][Objects][update]", error);
            });
        };
        Objects.prototype.create = function (data) {
            var _self = this;
            _self._resource.working.status = true;
            return axios_1.default({
                method: 'post',
                url: '/' + _self._resource.endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                data: data,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                if (_self._resource.model) {
                    var _obj = new _self._resource.model(result.data);
                    _self._resource.working.status = false;
                    if (_self._resource.page.initialized)
                        _self._resource.page.refresh();
                    return _obj;
                }
                else {
                    _self._resource.working.status = false;
                    if (_self._resource.page.initialized)
                        _self._resource.page.refresh();
                    return result.data;
                }
            }).catch(function (error) {
                _self._resource.working.status = false;
                return Tools.trigger_http_exception("[Tastypie][Objects][create]", error);
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
            _self._resource.working.status = true;
            return axios_1.default({
                method: 'get',
                url: '/' + _self._resource.endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                params: Tools.merge_obj(_self._resource.defaults, filter),
                headers: _self._resource.provider.headers
            }).then(function (result) {
                _self._resource.page = new Paginator(_self._resource, result.data, filter);
                _self._resource.working.status = false;
                return _self._resource.page;
            }).catch(function (error) {
                _self._resource.working.status = false;
                return Tools.trigger_http_exception("[Tastypie][Objects][find]", error);
            });
        };
        Objects.prototype.findOne = function (params) {
            var _self = this;
            _self._resource.working.status = true;
            return axios_1.default({
                method: 'get',
                url: '/' + _self._resource.endpoint,
                baseURL: _self._resource.provider.url,
                responseType: 'json',
                params: params,
                headers: _self._resource.provider.headers
            }).then(function (result) {
                var _obj_data;
                if (result.data.hasOwnProperty('meta') && result.data.hasOwnProperty('objects')) {
                    _obj_data = result.data.objects[0];
                }
                else {
                    _obj_data = result.data;
                }
                if (_self._resource.model) {
                    var _obj = new _self._resource.model(_obj_data);
                    _self._resource.working.status = false;
                    return _obj;
                }
                else {
                    _self._resource.working.status = false;
                    return _obj_data;
                }
            }).catch(function (error) {
                _self._resource.working.status = false;
                return Tools.trigger_http_exception("[Tastypie][Objects][findOne]", error);
            });
        };
        return Objects;
    }());
    Tastypie.Objects = Objects;
    var PageMeta = /** @class */ (function () {
        function PageMeta(p) {
            this.total_count = p.total_count;
            this.limit = p.limit;
            this.offset = p.offset;
            this.next = p.next;
            this.previous = p.previous;
            this.kwargs = p.kwargs || {};
        }
        return PageMeta;
    }());
    Tastypie.PageMeta = PageMeta;
    var Paginator = /** @class */ (function () {
        function Paginator(p, obj, filters) {
            this._resource = p;
            this._defaults = filters || {};
            this._objects = [];
            if (obj) {
                this.setPage(this, obj);
            }
            else {
                this._meta = new PageMeta({ total_count: 0, limit: 0, offset: 0, next: null, previous: null, kwargs: {} });
                this._initialized = false;
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
        Object.defineProperty(Paginator.prototype, "initialized", {
            get: function () {
                return this._initialized;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paginator.prototype, "resource", {
            get: function () {
                return this._resource;
            },
            enumerable: true,
            configurable: true
        });
        Paginator.prototype.setPage = function (_self, result, infinite) {
            _self._meta = new PageMeta(result.meta);
            if (!infinite) {
                _self._objects = [];
            }
            if (_self._resource.model) {
                for (var ix1 = 0; ix1 < result.objects.length; ix1++) {
                    var _obj = new _self._resource.model(result.objects[ix1]);
                    _self._objects.push(_obj);
                }
            }
            else {
                _self._objects = result.objects;
            }
            if (_self._meta.limit)
                _self._length = Math.ceil(_self._meta.total_count / _self._meta.limit) || 1;
            else
                _self._length = 1;
            if (_self._meta.offset && _self._meta.limit)
                _self._index = (Math.ceil(_self._meta.offset / _self._meta.limit) + 1);
            else
                _self._index = 1;
            var pgs = [];
            for (var ix2 = 1; ix2 <= _self.length; ix2++) {
                pgs.push(ix2);
            }
            _self._range = pgs;
            _self._initialized = true;
        };
        Paginator.prototype.getPage = function (_self, url, infinite) {
            _self._resource.working.status = true;
            return axios_1.default({
                method: 'get',
                url: url,
                responseType: 'json',
                headers: _self._resource.provider.headers
            }).then(function (result) {
                _self.setPage(_self, result.data, infinite);
                _self._resource.working.status = false;
                return _self;
            }).catch(function (error) {
                _self._resource.working.status = false;
                return Tools.trigger_http_exception("[Tastypie][Paginator][getPage]", error);
            });
        };
        Paginator.prototype.changePage = function (_self, index, update) {
            if (!_self._initialized) {
                return Tools.generate_exception('[Tastypie][Paginator] Uninitialized page.');
            }
            if ((index == _self.index) && (!update)) {
                return Tools.generate_resolve('[Tastypie][Paginator][changePage] Index ' + index + ' has already been loaded.');
            }
            if ((index > 0) && (index <= _self.length)) {
                _self._resource.working.status = true;
                var filters = Tools.merge_obj(_self._resource.defaults, _self._defaults);
                filters['offset'] = ((index - 1) * _self.meta.limit);
                return axios_1.default({
                    method: 'get',
                    url: '/' + _self._resource.endpoint,
                    baseURL: _self._resource.provider.url,
                    responseType: 'json',
                    params: filters,
                    headers: _self._resource.provider.headers
                }).then(function (result) {
                    if (result.data.meta.offset == result.data.meta.total_count) {
                        if ((index - 1) == 0) {
                            _self.setPage(_self, result.data);
                            _self._resource.working.status = false;
                            return _self;
                        }
                        else {
                            _self._resource.working.status = false;
                            return _self.changePage(_self, (index - 1), true);
                        }
                    }
                    else {
                        _self.setPage(_self, result.data);
                        _self._resource.working.status = false;
                        return _self;
                    }
                }).catch(function (error) {
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Paginator][changePage]", error);
                });
            }
            else {
                return Tools.generate_exception('[Tastypie][Paginator][changePage] Index ' + index + ' not exist.');
            }
        };
        Paginator.prototype.change = function (index) {
            return this.changePage(this, index, false);
        };
        Paginator.prototype.next = function () {
            if (this.meta.next) {
                return this.getPage(this, this._resource.provider.concatDomain(this.meta.next));
            }
            else {
                return Tools.generate_exception('[Tastypie][Paginator][next] Not exist next pages.');
            }
        };
        Paginator.prototype.nextInfinite = function () {
            if (this.meta.next) {
                return this.getPage(this, this._resource.provider.concatDomain(this.meta.next), true);
            }
            else {
                return Tools.generate_exception('[Tastypie][Paginator][nextInfinite] Not exist next pages.');
            }
        };
        Paginator.prototype.previous = function () {
            if (this.meta.previous) {
                return this.getPage(this, this._resource.provider.concatDomain(this.meta.previous));
            }
            else {
                return Tools.generate_exception('[Tastypie][Paginator][previous] Not exist previous pages.');
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
    var Model = /** @class */ (function () {
        function Model(resource, _obj) {
            this._resource = resource;
            if (_obj) {
                this.setData(_obj);
            }
        }
        Object.defineProperty(Model.prototype, "resource", {
            get: function () {
                return this._resource;
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.save = function (obj) {
            var _self = this;
            var to_save = (obj || _self.getData());
            return _self._resource.objects.save(to_save).then(function (r) {
                _self.setData(r);
                return r;
            });
        };
        Model.prototype.update = function (obj) {
            var _self = this;
            if (!_self.id)
                return Tools.generate_exception('[Tastypie][Model][update] This object has not been saved.');
            return _self._resource.objects.update(_self.id, obj).then(function (r) {
                _self.setData(r);
                return r;
            });
        };
        Model.prototype.delete = function () {
            var _self = this;
            if (!_self.id)
                return Tools.generate_exception('[Tastypie][Model][delete] This object has not been deleted.');
            return _self._resource.objects.delete(_self.id).then(function (r) {
                var properties = Tools.getProperties(_self);
                for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                    var propertie = properties_1[_i];
                    _self[propertie] = null;
                }
                return r;
            });
        };
        Model.prototype.changeFile = function (field, event) {
            var _self = this;
            if (!_self.id)
                return Tools.generate_exception('[Tastypie][Model][updateFile] This object has not been saved.');
            var uploading = new Promise(function (resolve, reject) {
                var timeout = setTimeout(function () { reject('timeout'); }, 15000);
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    var paramFile = loadEvent.target.result;
                    var obj_param = {};
                    obj_param[field] = paramFile;
                    _self._resource.objects.update(_self.id, obj_param).then(function (data) {
                        clearTimeout(timeout);
                        _self.setData(data);
                        resolve(data);
                    }).catch(function (error) {
                        clearTimeout(timeout);
                        reject(error);
                    });
                };
                reader.readAsDataURL(event.target.files[0]);
            });
            return uploading;
        };
        Model.prototype.refresh = function () {
            var _self = this;
            if (!_self.id)
                return Tools.generate_exception('[Tastypie][Model][refresh] This object has not been saved.');
            return _self._resource.objects.get(_self.id).then(function (r) {
                _self.setData(r);
                return r;
            });
        };
        Model.prototype.getProperties = function () {
            return Tools.getProperties(this);
        };
        Model.prototype.getData = function () {
            var _self = this;
            var data = {};
            var properties = Tools.getProperties(_self);
            for (var _i = 0, properties_2 = properties; _i < properties_2.length; _i++) {
                var propertie = properties_2[_i];
                if (_self[propertie] instanceof Model) {
                    data[propertie] = _self[propertie].getData();
                }
                else {
                    data[propertie] = _self[propertie];
                }
            }
            return data;
        };
        Model.prototype.setData = function (data) {
            var _self = this;
            var properties = Tools.getProperties(data);
            for (var _i = 0, properties_3 = properties; _i < properties_3.length; _i++) {
                var propertie = properties_3[_i];
                _self[propertie] = data[propertie];
            }
        };
        return Model;
    }());
    Tastypie.Model = Model;
})(Tastypie = exports.Tastypie || (exports.Tastypie = {}));
//# sourceMappingURL=tastypie.js.map