export declare namespace Tastypie {
    class Working {
        private _status;
        private static _status;
        get status(): boolean;
        set status(p: boolean);
        static get status(): boolean;
        static set status(p: boolean);
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
        get name(): string;
        get url(): string;
        get protocol(): string;
        get domain(): string;
        get username(): string;
        get apikey(): string;
        get headers(): {};
        concatDomain(p: string): string;
        concatSubDomain(p: string): string;
        static add(...p: Array<Provider>): void;
        static get(name: string): Provider;
        static setDefault(name: string): void;
        static getDefault(): Provider;
        static setAuth(providerName: string, username: string, apikey: string): void;
        static removeAuth(providerName: string): void;
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
        get endpoint(): string;
        get provider(): Provider;
        get defaults(): any;
        set defaults(p: any);
        get model(): any;
        get objects(): Objects<T>;
        get page(): Paginator<T>;
        set page(p: Paginator<T>);
        get working(): Working;
        set working(p: Working);
    }
    class Objects<T> {
        private _resource;
        constructor(p: Resource<T>);
        get(id: number, params?: any): Promise<T>;
        delete(id: number, params?: any): Promise<T>;
        update(id: number, data: any): Promise<T>;
        create(data: {}): Promise<T>;
        save(data: any): Promise<T>;
        find(filter?: {}): Promise<Paginator<T>>;
        findOne(params?: any, no_slash?: boolean): Promise<T>;
    }
    class PageMeta {
        total_count: number;
        limit: number;
        offset: number;
        next: string;
        previous: string;
        kwargs?: any;
        constructor(p: {
            total_count: number;
            limit: number;
            offset: number;
            next: string;
            previous: string;
            kwargs?: any;
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
        get meta(): PageMeta;
        get objects(): Array<T>;
        get index(): number;
        get length(): number;
        get range(): Array<number>;
        get initialized(): boolean;
        get resource(): Resource<T>;
        private setPage;
        private getPage;
        private changePage;
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
        save(obj?: any): Promise<any>;
        update(obj: any): Promise<any>;
        delete(): Promise<any>;
        changeFile(field: string, event: any): Promise<any>;
        refresh(): Promise<any>;
        getProperties(): Array<string>;
        getData(): any;
        setData(data: any): void;
    }
    class Model<T> implements IModel {
        private _resource;
        id: number;
        constructor(resource: Resource<T>, _obj?: any);
        get resource(): Resource<T>;
        save(obj?: any): Promise<T>;
        update(obj: any): Promise<T>;
        delete(): Promise<T>;
        setLocalFile(field: string, event: any): void;
        changeFile(field: string, event: any): Promise<T>;
        changeFileBase64(field: string, fileBase64: any): Promise<T>;
        refresh(): Promise<T>;
        getProperties(): Array<string>;
        getData(): any;
        setData(data: any): void;
    }
}
