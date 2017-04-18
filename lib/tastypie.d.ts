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
        objects: TastypieObjects;
        constructor(endpoint: string, p: {
            defaults?: {};
            provider?: string;
        });
        readonly endpoint: string;
        readonly defaults: {};
        readonly provider: Provider;
    }
    class TastypieObjects {
        private _resource;
        constructor(p: Resource);
        get(id: number, params?: {}): Promise<any>;
        delete(id: number, params?: {}): Promise<any>;
        update(id: number, data: {}): Promise<any>;
        create(data: {}): Promise<any>;
        find(filter?: {}): Promise<TastypiePaginator>;
    }
    class TastypiePaginator {
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
        private setPage(result);
        private getPage(url);
        private changePage(index, update);
        change(index: number): Promise<TastypiePaginator>;
        next(): Promise<TastypiePaginator>;
        previous(): Promise<TastypiePaginator>;
        refresh(): Promise<TastypiePaginator>;
        first(): Promise<TastypiePaginator>;
        last(): Promise<TastypiePaginator>;
    }
}
