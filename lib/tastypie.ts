// Type definitions for [~Tastypie Lib~] [~1.0.0~]
// Project: [~ts-resource-tastypie~]
// Definitions by: [~MARCOS WILLIAM FERRETTI~] <[~https://github.com/mw-ferretti~]>

import axios from 'axios';

export namespace Tastypie {
    
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
                throw new TypeError("Provider "+name+" not found.");
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
                throw new TypeError("No registered provider.");
            }
            return this._default_provider;
        }
    }

    export class Resource {
        private _endpoint: string;        
        private _provider: string;
        private _defaults: {};
        private _objects:Objects = new Objects(this);

        constructor(endpoint: string, p?: {defaults?: {}, provider?: string}){
            this._endpoint = endpoint;
            
            if(p){
                this._defaults = p.defaults || {};
                this._provider = p.provider;
            }
        }
        
        get endpoint(): string {
            return this._endpoint+'/';
        }
            
        get provider(): Provider {
            if(!this._provider){
                return Provider.getDefault();
            }else{
                return Provider.get(this._provider);
            }
        }
        
        get defaults(): {} {
            return this._defaults;
        }
        
        get objects(): Objects {
            return this._objects;
        }
    }
    
    export class Objects {
        private _resource: Resource;
                
        constructor(p:Resource){
            this._resource = p;
        }
        
        public get(id:number, params?:any): Promise<any> {
            return axios({
              method:'get',
              url: '/'+this._resource.endpoint+id+'/',
              baseURL: this._resource.provider.url,
              responseType:'json',
              params: params,
              headers: this._resource.provider.headers
            }).then(
                function(result: any){
                    return result.data;
                }
            ).catch(
                function(error: any){
                    return Promise.reject('[TastypieObjects][get] '+error);
                }
            );
        }
        
        public delete(id:number, params?:any): Promise<any> {
            return axios({
              method:'delete',
              url: '/'+this._resource.endpoint+id+'/',
              baseURL: this._resource.provider.url,
              responseType:'json',
              params: params,
              headers: this._resource.provider.headers
            }).then(
                function(result: any){
                    return result.data;
                }
            ).catch(
                function(error: any){
                    return Promise.reject('[TastypieObjects][delete] '+error);
                }
            );
        }
        
        public update(id:number, data:any): Promise<any> {
            return axios({
              method:'patch',
              url: '/'+this._resource.endpoint+id+'/',
              baseURL: this._resource.provider.url,
              responseType:'json',
              data: data,
              headers: this._resource.provider.headers
            }).then(
                function(result: any){
                    return result.data;
                }
            ).catch(
                function(error: any){
                    return Promise.reject('[TastypieObjects][update] '+error);
                }
            );
        }
        
        public save(data:any): Promise<any> {
            if(data.id){
                return this.update(data.id, data); 
            }else{
                return this.create(data);
            }
        }
        
        public create(data: {}): Promise<any> {
            return axios({
              method:'post',
              url: '/'+this._resource.endpoint,
              baseURL: this._resource.provider.url,
              responseType:'json',
              data: data,
              headers: this._resource.provider.headers
            }).then(
                function(result){
                    return result.data;
                }
            ).catch(
                function(error){
                    return Promise.reject('[TastypieObjects][create] '+error);
                }
            );
        }
        
        public find(filter?: {}): Promise<Paginator> {
            let _self = this;                    
            return axios({
              method:'get',
              url: '/'+_self._resource.endpoint,
              baseURL: _self._resource.provider.url,
              responseType:'json',
              params: Tools.merge_obj(_self._resource.defaults, filter),
              headers: _self._resource.provider.headers
            }).then(
                function(result){
                    return new Paginator(_self._resource, result.data, filter);
                }
            ).catch(
                function(error){
                    return Promise.reject('[TastypieObjects][find] '+error);
                }
            );
        }
    }
    
    export class Paginator {
        private _resource: Resource;
        private _meta: any;
        private _objects: Array<any>;
        private _index: number;
        private _length: number;
        private _range: Array<number>;
        private _defaults: any;
                
        constructor(p:Resource, obj?:any, filters?:any) {
            this._resource = p;
            this._defaults = filters || {};

            if(obj){
                this.setPage(this, obj);
            }
        }
        
        get meta(): any {
            return this._meta;
        }
        
        get objects(): Array<{}> {
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
        
        private setPage(_self:Paginator, result:{meta:any; objects:Array<any>}): void {
            _self._meta = result.meta;

            _self._objects = result.objects;
            _self._length = Math.ceil(result.meta.total_count / result.meta.limit);

            if (result.meta.offset == 0) _self._index = 1;
            else _self._index  = (Math.ceil(result.meta.offset / result.meta.limit)+1);

            var pgs = [];
            for (var i=1;i<=_self.length;i++) {pgs.push(i);}
            _self._range = pgs;
        }
        
        private getPage(_self:Paginator, url: string): Promise<Paginator> {
            return axios({
              method:'get',
              url: url,
              responseType:'json',
              headers: _self._resource.provider.headers
            }).then(
                function(result){
                    _self.setPage(_self, result.data);
                    return _self;
                }
            ).catch(
                function(error){
                    return Promise.reject('[TastypiePaginator][getPage] '+error);
                }
            );
        }
        
        private changePage(_self:Paginator, index:number, update:boolean): Promise<Paginator> {
            if((index == _self.index) && (!update)){
                return Promise.reject('[TastypiePaginator][changePage] Index '+index+' has already been loaded.');
            }
            
            if ((index > 0) && (index <= _self.length)) {            

                let filters = Tools.merge_obj(_self._resource.defaults, _self._defaults);
                filters['offset'] = ((index-1)*_self.meta.limit);
    
                return axios({
                  method:'get',
                  url: _self._resource.endpoint,
                  responseType:'json',
                  params:filters,
                  headers: _self._resource.provider.headers
                }).then(
                    function(result){
                        if(result.data.meta.offset == result.data.meta.total_count) {                        
                            if((index - 1) == 0){
                                _self.setPage(_self, result.data);
                                return _self;
                            }else{
                                return _self.changePage(_self, (index - 1), true);
                            }
                        }else{
                            _self.setPage(_self, result.data);
                            return _self;
                        }
                    }
                );
            }else{           
                return Promise.reject('[TastypiePaginator][changePage] Index '+index+' not exist.');
            }
        }    
        
        public change(index: number): Promise<Paginator> {
            return this.changePage(this, index, false);
        }
        
        public next(): Promise<Paginator> {
            if(this.meta.next){
                return this.getPage(this, this._resource.provider.domain + this.meta.next);
            }else{
                return Promise.reject('[TastypiePaginator][next] Not exist next pages.');
            }
        }
        
        public previous(): Promise<Paginator> {
            if(this.meta.previous){
                return this.getPage(this, this._resource.provider.domain + this.meta.previous);
            }else{
                return Promise.reject('[TastypiePaginator][previous] Not exist previous pages.');
            }
        }
        
        public refresh(): Promise<Paginator> {
            return this.changePage(this, this.index, true);
        }
        
        public first(): Promise<Paginator> {
            return this.changePage(this, 1, false);
        }
        
        public last(): Promise<Paginator> {
            return this.changePage(this, this.length, false);
        }        
    }
    
    export interface IModel {
        id:number;
        save():Promise<any>;
    }

    export class Model<T> implements IModel{
        private _resource: Resource;
        public id:number;

        public save(obj?:any): Promise<T> {  
            let _self = this;
            let to_save = (obj || _self.getData());
            return _self._resource.objects.save(to_save).then(
                function(r: any){
                    _self.setData(r);
                    return _self;
                }
            );
        }

        constructor(resource:Resource, _obj?:any){
            this._resource = resource;
            
            if(_obj){
                this.setData(_obj);
            }
        }
                
        public getData(): any{            
            let _self: any = <{}> this; 
            let selflist: any = {};            
            for(let attrname in _self){                
                if(typeof _self[attrname] !== 'function'){
                    if(String(attrname).charAt(0) != '_'){
                        selflist[attrname] = _self[attrname];
                    }
                } 
            }            
            return selflist;
        }
        
        public setData(toself: any): void{
            let _self = this;
            for(let attrname in toself){
                _self[attrname] = toself[attrname];

            }
        }
    }
    
}
