# Ts Resource Tastypie
[RESTful](http://www.ibm.com/developerworks/library/ws-restful/) TypeScript client for [Django-Tastypie](https://django-tastypie.readthedocs.org/en/latest/) or equivalent schema.

Features:
> - Pagination
> - Complete CRUD
> - Abstract AJAX(J) providing operations which are similar to the [Django Model API](https://docs.djangoproject.com/en/dev/topics/db/queries/)


## Context
[RESTful](http://www.ibm.com/developerworks/library/ws-restful/) architecture with [TypeScript](https://www.typescriptlang.org/) and [Django](https://www.djangoproject.com/).

IMPORTANT:
> - Backend: Security rules for data persistence and access.
> - Frontend: [Usability](https://en.wikipedia.org/wiki/Usability) rules, only!

BENEFITS:
> - Asynchronous development between frontend and backend developers.
> - Reuse of web developers team to create mobile applications.
> - The frontend is isolated, we can distribute it as an application by using [Apache Cordova](https://cordova.apache.org/).
> - Independent layers between business rules and usability rules of user interface. 
> - Business rules are the same for different types of [UI](https://en.wikipedia.org/wiki/User_interface). We can create different [UIs](https://en.wikipedia.org/wiki/User_interface) with any other programming language, passing through the same business rules on the backend.
> - And more ...


## Requirements for the backend:
> - [Django-Tastypie](https://django-tastypie.readthedocs.org/en/latest/) or equivalent schema.
> - [django-cors-headers](https://github.com/ottoyiu/django-cors-headers)
> - [always_return_data](http://django-tastypie.readthedocs.org/en/latest/resources.html#always-return-data)


## Install
> npm i ts-resource-tastypie


## Basic Usage
```typescript
import * as api from "ts-resource-tastypie";

api.Tastypie.Provider.add(
    new api.Tastypie.Provider({name:'provider1', url:'http://address1/api/v1/', username:'admin', apikey:'123'})
);

let serviceName = new api.Tastypie.Resource('service_name');

serviceName.objects.create(data: any); //return Promise<any> 
serviceName.objects.update(id :number, data: any); //return Promise<any>
serviceName.objects.save(data: any); //return Promise<any>
serviceName.objects.delete(id: number); //return Promise<any>
serviceName.objects.get(id: number); //return Promise<any>
serviceName.objects.find(data: any); //return Promise<page>

serviceName.objects.find(data: any).then(
    function(page){
        //page.objects :Array<any>
        
        //page.meta.total_count :number
        //page.meta.limit : number
        //page.meta.offset : number
        //page.meta.next :string
        //page.meta.previous :string
                
        //page.index :number
        //page.length :number
        //page.range :Array<number>
        
        //page.change(index :number) :Promise<page>
        //page.next() :Promise<page>
        //page.previous() :Promise<page>
        //page.refresh() :Promise<page>
        //page.first() :Promise<page>
        //page.last() :Promise<page>
    }
)

```


## Multiple Provider Usage
```typescript
import * as api from "ts-resource-tastypie";

api.Tastypie.Provider.add(
    new api.Tastypie.Provider({name:'provider1', url:'http://address1/api/v1/', username:'admin', apikey:'123'}),
    new api.Tastypie.Provider({name:'provider2', url:'http://address2/api/v1/'}),
    new api.Tastypie.Provider({name:'provider3', url:'http://address3/api/v1/'})
);

api.Tastypie.Provider.setDefault('provider3');

let serviceName = new api.Tastypie.Resource('service_name'); //using default provider "provider3" 
let serviceName = new api.Tastypie.Resource('service_name', {provider: 'provider1'}); //using selected provider "provider1" 

```


## Class Model Usage :+1:
```typescript
import * as api from "ts-resource-tastypie";

api.Tastypie.Provider.add(
    new api.Tastypie.Provider({name:'provider1', url:'http://address1/api/v1/', username:'admin', apikey:'123'})
);

class myClassModel extends api.Tastypie.Model<myClassModel> {
    public static resource = new api.Tastypie.Resource<myClassModel>('serviceName', {model: myClassModel});
    
    public myAttr1: string;
    public myAttr2: number;
    public myAttr3: string;
    
    constructor(obj?:any){
        super(myClassModel.resource, obj);
    }
}

```

Usage:
```typescript
let myObj = new myClassModel({myAttr1: 'foo', myAttr2: 'bar'})
myObj.save()

let myObj = new myClassModel()
myObj.myAttr1 = 'foo'
myObj.myAttr2 = 'bar'
myObj.save()

//At this moment we no longer work with generic objects. 
//Works with instances of your class that has been defined.
myClassModel.resource.objects.create(data: any); //return Promise<myClassModel> 
myClassModel.resource.objects.update(id :number, data: any); //return Promise<myClassModel>
myClassModel.resource.objects.save(data: any); //return Promise<myClassModel>
myClassModel.resource.objects.delete(id: number); //return Promise<myClassModel>
myClassModel.resource.objects.get(id: number); //return Promise<myClassModel>
myClassModel.resource.objects.find(data: any); //return Promise<page>

myClassModel.resource.objects.find(data: any).then(
    function(page){
        //page.objects :Array<myClassModel>
    }
)

```
Important
> For good practice, attributes that start the name with "_" are considered local. Therefore, these attributes will not be sent to the backend.
If you decide to change this logic, you can override the save method whenever you need it.

Override the save method 
```typescript
class myClassModel extends api.Tastypie.Model<myClassModel> {
    public static resource = new api.Tastypie.Resource<myClassModel>('serviceName', {model: myClassModel});
    
    public myAttr1: string;
    public myAttr2: number;
    public _myAttr3: string; //By default, this attribute will not be sent to the backend.
    private _myAttr4: string; //By default, this attribute will not be sent to the backend.
    
    constructor(obj?:any){
        super(myClassModel.resource, obj);
    }
    
    public save(): Promise<myClassModel> {
        return super.save({
            myAttr1: this.myAttr1,
            myAttr2: this.myAttr2,
            _myAttr3: this._myAttr3,
            _myAttr4: this._myAttr4
        });
    }
}
```

## Making queries
> Documentation in development ...

## Contribute
> If you found it useful, please consider paying me a coffee ;
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RGQ8NSYPA59FL)

## License
> ts-resource-tastypie is released under the [MIT License](https://github.com/mw-ferretti/ts-resource-tastypie/blob/master/LICENSE).
