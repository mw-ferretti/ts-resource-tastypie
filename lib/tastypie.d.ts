export declare namespace Tastypie {
    class Working {
        private _status;
        private static _status;
        status: boolean;
        static status: boolean;
    }
    class HttpExceptions {
        httpCode: number;
        callback: (response: any) => any;
        private static _httpExceptions;
        constructor(httpCode: number, callback: (response: any) => any);
        static add(...p: Array<HttpExceptions>): void;
        static get(httpCode: number): HttpExceptions;
    }
    class Tools {
        static extract_domain(url: string): string;
        static extract_protocol(url: string): string;
        static merge_obj(obj1?: any, obj2?: any): any;
        static generate_exception(msg: string): Promise<any>;
        static generate_resolve(msg: string): Promise<any>;
        static trigger_http_exception(moduleName: string, error: any): any;
        static getProperties(data: any): Array<string>;
    }
    class Provider {
        private _name;
        private _url;
        private _protocol;
        private _domain;
        private _username;
        private _apikey;
        private _headers;
        private static _providers;
        private static _default_provider;
        constructor(p: {
            name: string;
            url: string;
            username?: string;
            apikey?: string;
            headers?: {};
        });
        readonly name: string;
        readonly url: string;
        readonly protocol: string;
        readonly domain: string;
        readonly username: string;
        readonly apikey: string;
        readonly headers: {};
        concatDomain(p: string): string;
        concatSubDomain(p: string): string;
        static add(...p: Array<Provider>): void;
        static get(name: string): Provider;
        static setDefault(name: string): void;
        static getDefault(): Provider;
        static setAuth(providerName: string, username: string, apikey: string): void;
    }
    class Resource<T> {
        private _endpoint;
        private _provider;
        private _defaults;
        private _model;
        private _objects;
        private _page;
        private _working;
        constructor(endpoint: string, p?: {
            defaults?: any;
            provider?: string;
            model?: any;
        });
        readonly endpoint: string;
        readonly provider: Provider;
        readonly defaults: any;
        readonly model: any;
        readonly objects: Objects<T>;
        page: Paginator<T>;
        working: Working;
    }
    class Objects<T> {
        private _resource;
        constructor(p: Resource<T>);
        get(id?: number, params?: any): Promise<T>;
        delete(id: number, params?: any): Promise<T>;
        update(id: number, data: any): Promise<T>;
        create(data: {}): Promise<any>;
        save(data: any): Promise<T>;
        find(filter?: {}): Promise<Paginator<T>>;
    }
    class PageMeta {
        total_count: number;
        limit: number;
        offset: number;
        next: string;
        previous: string;
        kargs?: any;
        constructor(p: {
            total_count: number;
            limit: number;
            offset: number;
            next: string;
            previous: string;
            kargs?: any;
        });
    }
    class Paginator<T> {
        private _resource;
        private _meta;
        private _objects;
        private _index;
        private _length;
        private _range;
        private _defaults;
        private _initialized;
        constructor(p: Resource<T>, obj?: any, filters?: any);
        readonly meta: PageMeta;
        readonly objects: Array<T>;
        readonly index: number;
        readonly length: number;
        readonly range: Array<number>;
        readonly initialized: boolean;
        readonly resource: Resource<T>;
        private setPage(_self, result, infinite?);
        private getPage(_self, url, infinite?);
        private changePage(_self, index, update);
        change(index: number): Promise<Paginator<T>>;
        next(): Promise<Paginator<T>>;
        nextInfinite(): Promise<Paginator<T>>;
        previous(): Promise<Paginator<T>>;
        refresh(): Promise<Paginator<T>>;
        first(): Promise<Paginator<T>>;
        last(): Promise<Paginator<T>>;
    }
    interface IModel {
        id: number;
        save(): Promise<any>;
    }
    class Model<T> implements IModel {
        private _resource;
        id: number;
        constructor(resource: Resource<T>, _obj?: any);
        readonly resource: Resource<T>;
        save(obj?: any): Promise<T>;
        update(obj: any): Promise<T>;
        getProperties(): Array<string>;
        getData(): any;
        setData(data: any): void;
    }
}
