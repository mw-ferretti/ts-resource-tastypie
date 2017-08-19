// Type definitions for [~Tastypie Lib~] [~1.1.0~]
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
                return url.split('/')[0] + '//' + url.split('/')[2].split('/')[0];
            }
            else {
                return url.split('/')[0];
            }
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
            error.response = error.response || {};
            error.response.statusText = moduleName.concat(' HTTP_', error.response.status, ' - ', error.response.statusText || ' Server Not Responding.');
            if (typeof(console) == "object") {
                console.log('');
                console.log('-----------------------');
                console.log(error.response.statusText);
                console.log(moduleName.concat(' ', 'DATA RESP.: \"', error.response.data, '\"'));
                console.log('-----------------------');
                console.log('');
            }

            let fn = HttpExceptions.get(+error.response.status);
            if(fn) fn.callback(error.response);
            return Promise.reject(error.response);
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
        public name: string;
        public url: string;
        public domain: string;
        public username: string;
        public apikey: string;
        public headers: {};
        private static _providers: Array<Provider> = [];
        private static _default_provider: Provider;

        constructor(p: {
            name: string;
            url: string;
            username?: string;
            apikey?: string;
            headers?: {};
        }){
            this.name = p.name;
            this.url = p.url;
            this.username = p.username || '';
            this.apikey = p.apikey || '';
            this.headers = p.headers || {};
            this.headers['Content-Type'] = 'application/json';
            if(this.username && this.apikey){
                this.headers['Authorization'] = 'ApiKey '.concat(
                    this.username, ':', this.apikey
                );
            }
            this.domain = Tools.extract_domain(this.url);
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
            this._endpoint = endpoint;

            if(p){
                this._defaults = p.defaults || {};
                this._provider = p.provider;
                this._model = p.model;
            }
        }

        public get endpoint(): string {
            return this._endpoint+'/';
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
            return axios({
              method:'get',
              url: '/'+_self._resource.endpoint+id+'/',
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
            return axios({
              method:'delete',
              url: '/'+_self._resource.endpoint+id+'/',
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
            return axios({
              method:'patch',
              url: '/'+_self._resource.endpoint+id+'/',
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

        public create(data: {}): Promise<any> {
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
    }

    export class PageMeta {
        public total_count: number;
        public limit: number;
        public offset: number;
        public next: string;
        public previous: string;
        public kargs?: {};

        constructor(p: {
            total_count: number,
            limit: number,
            offset: number,
            next: string,
            previous: string,
            kargs?: {}
        }) {
              this.total_count = p.total_count;
              this.limit = p.limit;
              this.offset = p.offset;
              this.next = p.next;
              this.previous = p.previous;
              this.kargs = p.kargs;
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
                this._meta = new PageMeta({total_count: 0, limit: 0, offset: 0, next: null, previous: null, kargs: {}});
                this._initialized = false;
            }
        }

        get meta(): PageMeta {
            return this._meta;
        }

        get objects(): Array<T> {
            return this._objects;
        }

        get index(): number {
            return this._index;
        }

        get length(): number {
            return this._length;
        }

        get range(): Array<number> {
            return this._range;
        }

        get initialized(): boolean {
            return this._initialized;
        }

        private setPage(_self:Paginator<T>, result:{meta:any; objects:Array<any>}): void {
            _self._meta = new PageMeta(result.meta);

            if(_self._resource.model){
                for (let ix1=0; ix1<result.objects.length; ix1++) {
                    let _obj = new _self._resource.model(result.objects[ix1]);
                    _self._objects.push(_obj);
                }
            }else{
                _self._objects = result.objects;
            }

            if(_self._meta.limit) _self._length =  Math.ceil(_self._meta.total_count / _self._meta.limit);
            else _self._length = 1;

            if(_self._meta.offset && _self._meta.limit) _self._index  = (Math.ceil(_self._meta.offset / _self._meta.limit)+1);
            else _self._index = 1;

            var pgs = [];
            for (let ix2=1;ix2<=_self.length;ix2++) {pgs.push(ix2);}
            _self._range = pgs;

            _self._initialized = true;
        }

        private getPage(_self:Paginator<T>, url: string): Promise<Paginator<T>> {
            _self._resource.working.status = true;
            return axios({
              method:'get',
              url: url,
              responseType:'json',
              headers: _self._resource.provider.headers
            }).then(
                function(result: any){
                    _self.setPage(_self, result.data);
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
                  url: _self._resource.endpoint,
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
                return this.getPage(this, this._resource.provider.domain + this.meta.next);
            }else{
                return Tools.generate_exception('[Tastypie][Paginator][next] Not exist next pages.');
            }
        }

        public previous(): Promise<Paginator<T>> {
            if(this.meta.previous){
                return this.getPage(this, this._resource.provider.domain + this.meta.previous);
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
        save():Promise<any>;
    }

    export class Model<T> implements IModel{
        private _resource: Resource<T>;
        public id:number;

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

        constructor(resource:Resource<T>, _obj?:any){
            this._resource = resource;

            if(_obj){
                this.setData(_obj);
            }
        }

        public getProperties(): Array<string> {
            return Tools.getProperties(this);
        }

        public getData(): any{
            let self:Model<T> = this;
            let data: any = {};
            let properties: Array<string> = Tools.getProperties(this);
            for(let propertie of properties){
                data[propertie] = self[propertie];
            }
            return data;
        }

        public setData(data: any): void{
            let self:Model<T> = this;
            let properties: Array<string> = Tools.getProperties(data);
            for(let propertie of properties){
                self[propertie] = data[propertie];
            }
        }

        public concatDomain(p:string): string {
            return this._resource.provider.domain + p;
        }
    }

}
