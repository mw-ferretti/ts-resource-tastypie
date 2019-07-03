// Type definitions for [~Tastypie Lib~] [~1.0.49~]
// Project: [~ts-resource-tastypie~]
// Definitions by: [~MARCOS WILLIAM FERRETTI~] <[~https://github.com/mw-ferretti~]>

import axios from 'axios';

export namespace Tastypie {

    export class Working {
        private _status: number = 0;
        private static _status: number = 0;

        public get status(): boolean {
          return this._status > 0;
        }

        public set status(p: boolean) {
            this._status += p? 1 : this._status? -1 : 0;
            Working.status = p;
        }

        public static get status(): boolean {
            return this._status > 0;
        }

        public static set status(p: boolean) {
            this._status += p? 1 : this._status? -1 : 0;
        }
    }

    export class HttpExceptions {
        public httpCode: number;
        public callback: (response: any) => any;
        private static _httpExceptions: Array<HttpExceptions> = [];

        constructor(httpCode: number, callback: (response: any) => any){
            this.httpCode = httpCode;
            this.callback = callback;
        }

        public static add(...p: Array<HttpExceptions>): void {
            for (let except of p){
                if(typeof(except.callback) === "function"){
                    for(let i=0; i<this._httpExceptions.length;i++){
                        if(this._httpExceptions[i].httpCode == except.httpCode){
                            this._httpExceptions.splice(i, 1);
                        }
                    }
                    this._httpExceptions.push(except);
                }else{
                    throw new TypeError("[HttpExceptions][add] Callback to '" + except.httpCode + "' not is a function.");
                }
            }
        }

        public static get(httpCode: number): HttpExceptions {
            let ret: HttpExceptions;
            for (let except of this._httpExceptions){
                if(except.httpCode == httpCode){
                    ret = except;
                    break;
                }
            }
            return ret;
        }
    }

    export class Tools {
        public static extract_domain(url:string):string {
            if (url.indexOf("://") > -1) {
                return url.split('/')[2].split('/')[0];
            }
            else {
                return ""
            }
        }

        public static extract_protocol(url:string):string {
            return url.split(':')[0];
        }

        public static merge_obj(obj1:any={}, obj2:any={}):any{
            let obj3 = {};
            for (let attrname in obj1) { obj3[attrname] = obj1[attrname]; }
            for (let attrname in obj2) { obj3[attrname] = obj2[attrname]; }
            return obj3;
        }

        public static generate_exception(msg:string): Promise<any> {
            if (typeof(console) == "object") console.log(msg);
            return Promise.reject(msg);
        }

        public static generate_resolve(msg:string): Promise<any> {
            if (typeof(console) == "object") console.log(msg);
            return Promise.resolve(msg);
        }

        public static trigger_http_exception(moduleName: string, error: any): any {
            error = error || {};

            if (typeof(console) == "object") {
                console.log('-----');
                if (error.response) {
                    console.log(moduleName.concat(' HTTP_', error.response.status, ' - ', error.response.statusText || ' No statusText.', ' DATA RESP.:'));
                    console.log(error.response.data);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(moduleName.concat(' ', 'RESQUEST DATA RESP.:'));
                    console.log(error.request);
                } else {
                    console.log(moduleName.concat(' ', 'MESSAGE DATA RESP.:'));
                }
                if(error.message) console.log('Error: ', error.message);
                if(error.config) console.log('Config: ', error.config);
                console.log('-----');
            }

            let fn = null;
            if(error.response){
                try{
                  fn = HttpExceptions.get(+error.response.status);
                }catch (error) {}
            }
            if(fn) fn.callback(error);
            return Promise.reject(error);
        }

        public static getProperties(data: any): Array<string> {
            const properties: Array<string> = [];
            for(let property in data) {
                if (data.hasOwnProperty(property) && property.charAt(0) != '_') {
                  properties.push(property);
                }
            }
            return properties;
        }
    }

    export class Provider {
        private _name: string;
        private _url: string;
        private _protocol: string;
        private _domain: string;
        private _username: string;
        private _apikey: string;
        private _headers: {};
        private static _providers: Array<Provider> = [];
        private static _default_provider: Provider;

        constructor(p: {
            name: string;
            url: string;
            username?: string;
            apikey?: string;
            headers?: {};
        }){
            this._name = p.name;
            this._url = p.url;
            this._username = p.username || '';
            this._apikey = p.apikey || '';
            this._headers = p.headers || {};
            this._headers['Content-Type'] = 'application/json';
            if(this._username && this._apikey){
                this._headers['Authorization'] = 'ApiKey '.concat(
                    this._username, ':', this._apikey
                );
            }
            this._domain = Tools.extract_domain(this._url);
            this._protocol = Tools.extract_protocol(this._url);
        }

        public get name():string {
            return this._name;
        }

        public get url(): string {
            return this._url;
        }

        public get protocol(): string {
            return this._protocol;
        }

        public get domain(): string {
            return this._domain;
        }

        public get username(): string {
            return this._username;
        }

        public get apikey(): string {
            return this._apikey;
        }

        public get headers(): {} {
            return this._headers;
        }

        public concatDomain(p: string): string {
            return this.protocol + '://' + this.domain + p;
        }

        public concatSubDomain(p: string): string {
            return this.protocol + '://' + p + '.' + this.domain;
        }

        public static add(...p: Array<Provider>): void {
            for (let provider of p){
                for(let i=0; i<this._providers.length;i++){
                    if(this._providers[i].name == provider.name){
                        this._providers.splice(i, 1);
                    }
                }
                this._providers.push(provider);

                if(!this._default_provider){
                    this._default_provider = provider;
                }else{
                    if(this._default_provider.name == provider.name){
                        this._default_provider = provider;
                    }
                }
            }
        }

        public static get(name: string): Provider{
            let ret: Provider;
            for (let provider of this._providers){
                if(name == provider.name){
                    ret = provider;
                    break;
                }
            }

            if(!ret){
                throw new TypeError("[Tastypie][Provider][get] Provider "+name+" not found.");
            }

            return ret;
        }

        public static setDefault(name: string): void {
            for (let provider of this._providers){
                if(name == provider.name){
                    this._default_provider = provider;
                    break;
                }
            }
        }

        public static getDefault(): Provider {

            if(!this._default_provider){
                throw new TypeError("[Tastypie][Provider][getDefault] No registered provider.");
            }
            return this._default_provider;
        }

        public static setAuth(providerName: string, username: string, apikey: string): void {
            let default_provider: Provider = this.getDefault();
            let found: Boolean = false;

            for (let provider of this._providers){
                if(providerName == provider.name){
                    provider.headers['Authorization'] = 'ApiKey '.concat(
                        username, ':', apikey
                    );
                    if(default_provider.name == provider.name){
                        this.setDefault(provider.name);
                    }
                    found = true;
                    break;
                }
            }

            if(!found){
              throw new TypeError("[Tastypie][Provider][setAuth] Provider '" + providerName + "' not found.");
            }
        }

        public static removeAuth(providerName: string): void {
            let default_provider: Provider = this.getDefault();
            let found: Boolean = false;

            for (let provider of this._providers){
                if(providerName == provider.name){

                    if(provider.headers.hasOwnProperty('Authorization')){
                        delete provider.headers['Authorization'];

                        if(default_provider.name == provider.name){
                            this.setDefault(provider.name);
                        }
                    }

                    found = true;
                    break;
                }
            }

            if(!found){
              throw new TypeError("[Tastypie][Provider][setAuth] Provider '" + providerName + "' not found.");
            }
        }
    }

    export class Resource<T> {
        private _endpoint: string;
        private _provider: string;
        private _defaults: any;
        private _model: any;
        private _objects:Objects<T> = new Objects<T>(this);
        private _page:Paginator<T> = new Paginator<T>(this);
        private _working: Working = new Working();

        constructor(endpoint: string, p?: {defaults?: any, provider?: string, model?: any}){

            if(endpoint[endpoint.length -1] !== '/'){
                this._endpoint = `${endpoint}/`;
            }

            if(endpoint.startsWith("/")){
                this._endpoint = this._endpoint.substring(1);
            }

            if(p){
                this._defaults = p.defaults || {};
                this._provider = p.provider;
                this._model = p.model;
            }
        }

        public get endpoint(): string {
            return this._endpoint;
        }

        public get provider(): Provider {
            if(!this._provider){
                return Provider.getDefault();
            }else{
                return Provider.get(this._provider);
            }
        }

        public get defaults(): any {
            return this._defaults;
        }

        public set defaults(p: any) {
            this._defaults = p;
        }

        public get model(): any {
            return this._model;
        }

        public get objects(): Objects<T> {
            return this._objects;
        }

        public get page(): Paginator<T> {
            return this._page;
        }

        public set page(p: Paginator<T>){
            this._page = p;
        }

        public get working(): Working {
            return this._working;
        }

        public set working(p: Working) {
            this._working = p;
        }
    }

    export class Objects<T> {
        private _resource: Resource<T>;

        constructor(p:Resource<T>){
            this._resource = p;
        }

        public get(id:number, params?:any): Promise<T> {
            let _self = this;
            _self._resource.working.status = true;
            let endpoint = '/'+_self._resource.endpoint+id+'/';

            if (_self._resource.endpoint.indexOf("<id>") !== -1){
                endpoint = '/'+_self._resource.endpoint.replace("<id>", String(id));
            }

            return axios({
              method:'get',
              url: endpoint,
              baseURL: _self._resource.provider.url,
              responseType:'json',
              params: params,
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    if(_self._resource.model){
                        let _obj = new _self._resource.model(result.data);
                        _self._resource.working.status = false;
                        return _obj;
                    }else{
                        _self._resource.working.status = false;
                        return result.data;
                    }
                }
            ).catch(
                function(error: any){
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Objects][get]", error);
                }
            );
        }

        public delete(id:number, params?:any): Promise<T> {
            let _self = this;
            _self._resource.working.status = true;

            let endpoint = '/'+_self._resource.endpoint+id+'/';

            if (_self._resource.endpoint.indexOf("<id>") !== -1){
                endpoint = '/'+_self._resource.endpoint.replace("<id>", String(id));
            }

            return axios({
              method:'delete',
              url: endpoint,
              baseURL: _self._resource.provider.url,
              responseType:'json',
              params: params,
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    if(_self._resource.model){
                        let _obj = new _self._resource.model(result.data);
                        _self._resource.working.status = false;
                        if(_self._resource.page.initialized) _self._resource.page.refresh();
                        return _obj;
                    }else{
                        _self._resource.working.status = false;
                        if(_self._resource.page.initialized) _self._resource.page.refresh();
                        return result.data;
                    }
                }
            ).catch(
                function(error: any){
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Objects][delete]", error);
                }
            );
        }

        public update(id:number, data:any): Promise<T> {
            let _self = this;
            _self._resource.working.status = true;

            let endpoint = '/'+_self._resource.endpoint+id+'/';

            if (_self._resource.endpoint.indexOf("<id>") !== -1){
                endpoint = '/'+_self._resource.endpoint.replace("<id>", String(id));
            }

            return axios({
              method:'patch',
              url: endpoint,
              baseURL: _self._resource.provider.url,
              responseType:'json',
              data: data,
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    if(_self._resource.model){
                        let _obj = new _self._resource.model(result.data);
                        _self._resource.working.status = false;
                        if(_self._resource.page.initialized) _self._resource.page.refresh();
                        return _obj;
                    }else{
                        _self._resource.working.status = false;
                        if(_self._resource.page.initialized) _self._resource.page.refresh();
                        return result.data;
                    }
                }
            ).catch(
                function(error: any){
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Objects][update]", error);
                }
            );
        }

        public create(data: {}): Promise<T> {
            let _self = this;
            _self._resource.working.status = true;
            return axios({
              method:'post',
              url: '/'+_self._resource.endpoint,
              baseURL: _self._resource.provider.url,
              responseType:'json',
              data: data,
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    if(_self._resource.model){
                        let _obj = new _self._resource.model(result.data);
                        _self._resource.working.status = false;
                        if(_self._resource.page.initialized) _self._resource.page.refresh();
                        return _obj;
                    }else{
                        _self._resource.working.status = false;
                        if(_self._resource.page.initialized) _self._resource.page.refresh();
                        return result.data;
                    }
                }
            ).catch(
                function(error: any){
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Objects][create]", error);
                }
            );
        }

        public save(data:any): Promise<T> {
            if(data.id){
                return this.update(data.id, data);
            }else{
                return this.create(data);
            }
        }

        public find(filter?: {}): Promise<Paginator<T>> {
            let _self = this;
            _self._resource.working.status = true;
            return axios({
              method:'get',
              url: '/'+_self._resource.endpoint,
              baseURL: _self._resource.provider.url,
              responseType:'json',
              params: Tools.merge_obj(_self._resource.defaults, filter),
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    _self._resource.page = new Paginator<T>(_self._resource, result.data, filter);
                    _self._resource.working.status = false;
                    return _self._resource.page;
                }
            ).catch(
                function(error: any){
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Objects][find]", error);
                }
            );
        }

        public findOne(params?:any, no_slash?: boolean): Promise<T> {
            let _self = this;
            _self._resource.working.status = true;

            let url = '/'+_self._resource.endpoint;

            if(no_slash){
                url = url.slice(0, -1);
            }

            return axios({
              method:'get',
              url: url,
              baseURL: _self._resource.provider.url,
              responseType:'json',
              params: Tools.merge_obj(_self._resource.defaults, params),
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    let _obj_data: any;

                    if(result.data.hasOwnProperty('meta') && result.data.hasOwnProperty('objects')){
                        if(result.data.objects.length >= 1){
                            _obj_data = result.data.objects[0];
                        }else{
                            _obj_data = null;
                        }
                    }else{
                        _obj_data = result.data;
                    }

                    if(_self._resource.model){
                        let _obj = new _self._resource.model(_obj_data);
                        _self._resource.working.status = false;
                        return _obj;
                    }else{
                        _self._resource.working.status = false;
                        return _obj_data;
                    }
                }
            ).catch(
                function(error: any){
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Objects][findOne]", error);
                }
            );
        }
    }

    export class PageMeta {
        public total_count: number;
        public limit: number;
        public offset: number;
        public next: string;
        public previous: string;
        public kwargs?: any;

        constructor(p: {
            total_count: number,
            limit: number,
            offset: number,
            next: string,
            previous: string,
            kwargs?: any
        }) {
              this.total_count = p.total_count;
              this.limit = p.limit;
              this.offset = p.offset;
              this.next = p.next;
              this.previous = p.previous;
              this.kwargs = p.kwargs || {};
        }
    }

    export class Paginator<T> {
        private _resource: Resource<T>;
        private _meta: PageMeta;
        private _objects: Array<T>;
        private _index: number;
        private _length: number;
        private _range: Array<number>;
        private _defaults: any;
        private _initialized: boolean;

        constructor(p:Resource<T>, obj?:any, filters?:any) {
            this._resource = p;
            this._defaults = filters || {};
            this._objects = [];

            if(obj){
                this.setPage(this, obj);
            }else{
                this._meta = new PageMeta({total_count: 0, limit: 0, offset: 0, next: null, previous: null, kwargs: {}});
                this._initialized = false;
            }
        }

        public get meta(): PageMeta {
            return this._meta;
        }

        public get objects(): Array<T> {
            return this._objects;
        }

        public get index(): number {
            return this._index;
        }

        public get length(): number {
            return this._length;
        }

        public get range(): Array<number> {
            return this._range;
        }

        public get initialized(): boolean {
            return this._initialized;
        }

        public get resource(): Resource<T> {
            return this._resource;
        }

        private setPage(_self:Paginator<T>, result:{meta:any; objects:Array<any>}, infinite?: boolean): void {
            _self._meta = new PageMeta(result.meta);

            if(!infinite){
              _self._objects = [];
            }

            if(_self._resource.model){
                for (let ix1=0; ix1<result.objects.length; ix1++) {
                    let _obj = new _self._resource.model(result.objects[ix1]);
                    _self._objects.push(_obj);
                }
            }else{
                _self._objects = result.objects;
            }

            if(_self._meta.limit) _self._length =  Math.ceil(_self._meta.total_count / _self._meta.limit) || 1;
            else _self._length = 1;

            if(_self._meta.offset && _self._meta.limit) _self._index  = (Math.ceil(_self._meta.offset / _self._meta.limit)+1);
            else _self._index = 1;

            var pgs = [];
            for (let ix2=1;ix2<=_self.length;ix2++) {pgs.push(ix2);}
            _self._range = pgs;

            _self._initialized = true;
        }

        private getPage(_self:Paginator<T>, url: string, infinite?: boolean): Promise<Paginator<T>> {
            _self._resource.working.status = true;
            return axios({
              method:'get',
              url: url,
              responseType:'json',
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    _self.setPage(_self, result.data, infinite);
                    _self._resource.working.status = false;
                    return _self;
                }
            ).catch(
                function(error: any){
                    _self._resource.working.status = false;
                    return Tools.trigger_http_exception("[Tastypie][Paginator][getPage]", error);
                }
            );
        }

        private changePage(_self:Paginator<T>, index:number, update:boolean): Promise<Paginator<T>> {
            if(!_self._initialized){
                return Tools.generate_exception('[Tastypie][Paginator] Uninitialized page.');
            }

            if((index == _self.index) && (!update)){
                return Tools.generate_resolve('[Tastypie][Paginator][changePage] Index '+index+' has already been loaded.');
            }

            if ((index > 0) && (index <= _self.length)) {
                _self._resource.working.status = true;

                let filters = Tools.merge_obj(_self._resource.defaults, _self._defaults);
                filters['offset'] = ((index-1)*_self.meta.limit);

                return axios({
                  method:'get',
                  url: '/'+_self._resource.endpoint,
                  baseURL: _self._resource.provider.url,
                  responseType:'json',
                  params:filters,
                  headers: _self._resource.provider.headers
                }).then(
                    function(result: any){
                        if(result.data.meta.offset == result.data.meta.total_count) {
                            if((index - 1) == 0){
                                _self.setPage(_self, result.data);
                                _self._resource.working.status = false;
                                return _self;
                            }else{
                                _self._resource.working.status = false;
                                return _self.changePage(_self, (index - 1), true);
                            }
                        }else{
                            _self.setPage(_self, result.data);
                            _self._resource.working.status = false;
                            return _self;
                        }
                    }
                ).catch(
                    function(error: any){
                        _self._resource.working.status = false;
                        return Tools.trigger_http_exception("[Tastypie][Paginator][changePage]", error);
                    }
                );
            }else{
                return Tools.generate_exception('[Tastypie][Paginator][changePage] Index '+index+' not exist.');
            }
        }

        public change(index: number): Promise<Paginator<T>> {
            return this.changePage(this, index, false);
        }

        public next(): Promise<Paginator<T>> {
            if(this.meta.next){
                return this.getPage(this, this._resource.provider.concatDomain(this.meta.next));
            }else{
                return Tools.generate_exception('[Tastypie][Paginator][next] Not exist next pages.');
            }
        }

        public nextInfinite(): Promise<Paginator<T>> {
            if(this.meta.next){
                return this.getPage(this, this._resource.provider.concatDomain(this.meta.next), true);
            }else{
                return Tools.generate_exception('[Tastypie][Paginator][nextInfinite] Not exist next pages.');
            }
        }

        public previous(): Promise<Paginator<T>> {
            if(this.meta.previous){
                return this.getPage(this, this._resource.provider.concatDomain(this.meta.previous));
            }else{
                return Tools.generate_exception('[Tastypie][Paginator][previous] Not exist previous pages.');
            }
        }

        public refresh(): Promise<Paginator<T>> {
            return this.changePage(this, this.index, true);
        }

        public first(): Promise<Paginator<T>> {
            return this.changePage(this, 1, false);
        }

        public last(): Promise<Paginator<T>> {
            return this.changePage(this, this.length, false);
        }
    }

    export interface IModel {
        id:number;
        save(obj?:any):Promise<any>;
        update(obj: any):Promise<any>;
        delete():Promise<any>;
        changeFile(field: string, event: any):Promise<any>;
        refresh():Promise<any>;
        getProperties():Array<string>;
        getData():any;
        setData(data: any):void;
    }

    export class Model<T> implements IModel{
        private _resource: Resource<T>;
        public id:number;

        constructor(resource:Resource<T>, _obj?:any){
            this._resource = resource;

            if(_obj){
                this.setData(_obj);
            }
        }

        public get resource(): Resource<T> {
            return this._resource;
        }

        public save(obj?:any): Promise<T> {
            let _self = this;
            let to_save = (obj || _self.getData());
            return _self._resource.objects.save(to_save).then(
                function(r: any){
                    _self.setData(r);
                    return r;
                }
            );
        }

        public update(obj:any): Promise<T> {
            let _self = this;

            if (!_self.id) return Tools.generate_exception('[Tastypie][Model][update] This object has not been saved.');

            return _self._resource.objects.update(_self.id, obj).then(
                function(r: any){
                    _self.setData(r);
                    return r;
                }
            );
        }

        public delete(): Promise<T> {
            let _self = this;

            if (!_self.id) return Tools.generate_exception('[Tastypie][Model][delete] This object has not been deleted.');

            return _self._resource.objects.delete(_self.id).then(
                function(r: any){
                    let properties: Array<string> = Tools.getProperties(_self);
                    for(let propertie of properties){
                        _self[propertie] = null;
                    }
                    return r;
                }
            );
        }

        public changeFile(field: string, event: any): Promise<T> {
            let _self = this;

            if (!_self.id) return Tools.generate_exception('[Tastypie][Model][updateFile] This object has not been saved.');

            let uploading = new Promise<T>(function(resolve, reject) {
                let timeout = setTimeout(function(){ reject('timeout'); }, 15000);
                let reader = new FileReader();
                reader.onload = function(loadEvent: any){
                    let paramFile = loadEvent.target.result;
                    let obj_param = {};
                    obj_param[field] = paramFile
                    _self._resource.objects.update(_self.id, obj_param).then(function(data){
                        clearTimeout(timeout);
                        _self.setData(data);
                        resolve(data);
                    }).catch(function(error){
                        clearTimeout(timeout);
                        reject(error);
                    });
                }
                reader.readAsDataURL(event.target.files[0]);
            });
            return uploading;
        }

        public changeFileBase64(field: string, fileBase64: any): Promise<T> {
            let _self = this;
            if (!_self.id) return Tools.generate_exception('[Tastypie][Model][updateFile] This object has not been saved.');
            let obj_param = {};
            obj_param[field] = fileBase64
            return _self._resource.objects.update(_self.id, obj_param).then(function(data){
                _self.setData(data);
                return data;
            });
        }

        public refresh(): Promise<T> {
            let _self = this;

            if (!_self.id) return Tools.generate_exception('[Tastypie][Model][refresh] This object has not been saved.');

            return _self._resource.objects.get(_self.id).then(
                function(r: any){
                    _self.setData(r);
                    return r;
                }
            );
        }

        public getProperties(): Array<string> {
            return Tools.getProperties(this);
        }

        public getData(): any{
            let _self:Model<T> = this;
            let data: any = {};
            let properties: Array<string> = Tools.getProperties(_self);
            for(let propertie of properties){
                try {
                    if(_self[propertie] instanceof Model){
                        data[propertie] = _self[propertie].getData();
                    }else{
                        data[propertie] = _self[propertie];
                    }
                }
                catch (e) {}
            }
            return data;
        }

        public setData(data: any): void{
            let _self:Model<T> = this;
            let properties: Array<string> = Tools.getProperties(data);
            for(let propertie of properties){
                try {
                    _self[propertie] = data[propertie];
                }
                catch (e) {}
            }
        }
    }
}
