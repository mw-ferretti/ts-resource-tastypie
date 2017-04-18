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
        public objects:TastypieObjects = new TastypieObjects(this);

        constructor(endpoint: string, p: {defaults?: {}, provider?: string}){
            this._endpoint = endpoint;
            this._defaults = p.defaults || {};
            this._provider = p.provider;
        }
        
        get endpoint(): string {
            return this._endpoint+'/';
        }
        
        get defaults(): {} {
            return this._defaults;
        }
        
        get provider(): Provider {
            if(!this._provider){
                return Provider.getDefault();
            }else{
                return Provider.get(this._provider);
            }
        }
    }
    
    export class TastypieObjects {
        private _resource: Resource;
                
        constructor(p:Resource){
            this._resource = p;
        }
        
        public get(id:number, params?:{}): Promise<any> {
            return axios({
              method:'get',
              url: '/'+this._resource.endpoint+id+'/',
              baseURL: this._resource.provider.url,
              responseType:'json',
              params: params,
              headers: this._resource.provider.headers
            }).then(
                function(result){
                    return result.data;
                }
            ).catch(
                function(error){
                    return Promise.reject('[tastypieObjects][get] '+error);
                }
            );
        }
        
        public delete(id:number, params?:{}): Promise<any> {
            return axios({
              method:'delete',
              url: '/'+this._resource.endpoint+id+'/',
              baseURL: this._resource.provider.url,
              responseType:'json',
              params: params,
              headers: this._resource.provider.headers
            }).then(
                function(result){
                    return result.data;
                }
            ).catch(
                function(error){
                    return Promise.reject('[tastypieObjects][delete] '+error);
                }
            );
        }
        
        public update(id:number, data:{}): Promise<any> {
            return axios({
              method:'patch',
              url: '/'+this._resource.endpoint+id+'/',
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
                    return Promise.reject('[tastypieObjects][update] '+error);
                }
            );
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
                    return Promise.reject('[tastypieObjects][create] '+error);
                }
            );
        }
        
        public find(filter?: {}): Promise<TastypiePaginator> {
            var self = this;                    
            return axios({
              method:'get',
              url: '/'+this._resource.endpoint,
              baseURL: this._resource.provider.url,
              responseType:'json',
              params: Tools.merge_obj(self._resource.defaults, filter),
              headers: this._resource.provider.headers
            }).then(
                function(result){
                    return new TastypiePaginator(self._resource, result.data, filter);
                }
            ).catch(
                function(error){
                    return Promise.reject('[tastypieObjects][find] '+error);
                }
            );
        }
    }
    
    export class TastypiePaginator {
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
                this.setPage(obj);
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
        
        private setPage(result:{meta:any; objects:Array<any>}): void {
            this._meta = result.meta;

            this._objects = result.objects;
            this._length = Math.ceil(result.meta.total_count / result.meta.limit);

            if (result.meta.offset == 0) this._index = 1;
            else this._index  = (Math.ceil(result.meta.offset / result.meta.limit)+1);

            var pgs = [];
            for (var i=1;i<=this.length;i++) {pgs.push(i);}
            this._range = pgs;
        }
        
        private getPage(url: string): Promise<TastypiePaginator> {
            let self = this;
            return axios({
              method:'get',
              url: url,
              responseType:'json',
              headers: this._resource.provider.headers
            }).then(
                function(result){
                    self.setPage(result.data);
                    return self;
                }
            ).catch(
                function(error){
                    return Promise.reject('[tastypiePaginator][getPage] '+error);
                }
            );
        }
        
        private changePage(index:number, update:boolean): Promise<TastypiePaginator> {
            if((index == this.index) && (!update)){
                return Promise.reject('[tastypiePaginator][changePage] Index '+index+' has already been loaded.');
            }
            
            if ((index > 0) && (index <= this.length)) {            

                let filters = Tools.merge_obj(this._resource.defaults, this._defaults);
                filters['offset'] = ((index-1)*this.meta.limit);
                
                let self = this;
                return axios({
                  method:'get',
                  url: this._resource.endpoint,
                  responseType:'json',
                  params:filters,
                  headers: this._resource.provider.headers
                }).then(
                    function(result){
                        if(result.data.meta.offset == result.data.meta.total_count) {                        
                            if((index - 1) == 0){
                                self.setPage(result.data);
                                return self;
                            }else{
                                return self.changePage((index - 1), true);
                            }
                        }else{
                            self.setPage(result.data);
                            return self;
                        }
                    }
                );
            }else{           
                return Promise.reject('[tastypiePaginator][changePage] Index '+index+' not exist.');
            }
        }    
        
        public change(index: number): Promise<TastypiePaginator> {
            return this.changePage(index, false);
        }
        
        public next(): Promise<TastypiePaginator> {
            if(this.meta.next){
                return this.getPage(this._resource.provider.domain + this.meta.next);
            }else{
                return Promise.reject('[tastypiePaginator][next] Not exist next pages.');
            }
        }
        
        public previous(): Promise<TastypiePaginator> {
            if(this.meta.previous){
                return this.getPage(this._resource.provider.domain + this.meta.previous);
            }else{
                return Promise.reject('[tastypiePaginator][previous] Not exist previous pages.');
            }
        }
        
        public refresh(): Promise<TastypiePaginator> {
            return this.changePage(this.index, true);
        }
        
        public first(): Promise<TastypiePaginator> {
            return this.changePage(1, false);
        }
        
        public last(): Promise<TastypiePaginator> {
            return this.changePage(this.length, false);
        }        
    }
}
