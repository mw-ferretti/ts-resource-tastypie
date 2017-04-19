export declare namespace Tastypie {
    class Tools {
        static extract_domain(url: string): string;
        static merge_obj(obj1?: any, obj2?: any): any;
    }
    class Provider {
        name: string;
        url: string;
        domain: string;
        username: string;
        apikey: string;
        headers: {};
        private static _providers;
        private static _default_provider;
        constructor(p: {
            name: string;
            url: string;
            username?: string;
            apikey?: string;
            headers?: {};
        });
        static add(...p: Array<Provider>): void;
        static get(name: string): Provider;
        static setDefault(name: string): void;
        static getDefault(): Provider;
    }
    class Resource {
        private _endpoint;
        private _provider;
        private _defaults;
        private _objects;
        constructor(endpoint: string, p?: {
            defaults?: {};
            provider?: string;
        });
        readonly endpoint: string;
        readonly provider: Provider;
        readonly defaults: {};
        readonly objects: Objects;
    }
    class Objects {
        private _resource;
        constructor(p: Resource);
        get(id: number, params?: any): Promise<any>;
        delete(id: number, params?: any): Promise<any>;
        update(id: number, data: any): Promise<any>;
        save(data: any): Promise<any>;
        create(data: {}): Promise<any>;
        find(filter?: {}): Promise<Paginator>;
    }
    class Paginator {
        private _resource;
        private _meta;
        private _objects;
        private _index;
        private _length;
        private _range;
        private _defaults;
        constructor(p: Resource, obj?: any, filters?: any);
        readonly meta: any;
        readonly objects: Array<{}>;
        readonly index: number;
        readonly length: number;
        readonly range: Array<number>;
        private setPage(_self, result);
        private getPage(_self, url);
        private changePage(_self, index, update);
        change(index: number): Promise<Paginator>;
        next(): Promise<Paginator>;
        previous(): Promise<Paginator>;
        refresh(): Promise<Paginator>;
        first(): Promise<Paginator>;
        last(): Promise<Paginator>;
    }
    interface IModel {
        id: number;
        save(): Promise<any>;
    }
    class Model<T> implements IModel {
        private _resource;
        id: number;
        save(obj?: any): Promise<T>;
        constructor(resource: Resource, _obj?: any);
        getData(): any;
        setData(toself: any): void;
    }
}
