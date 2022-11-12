# vue-lite-route

Vue routing reimagined.

## Table of Contents
- [Features](#features)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Route Middleware](#route-middleware)
- [API Documentation](#api-documentation)
- [Resources](#resources)
- [Credits](#credits)
- [License](#license)

## Features
- Simpler routes registration with high-level API
- Route groups with nesting and group modifiers
- Middleware support on a per-route level
- Middleware pipelines (chains) support

## Getting started

Install the package from `npm`:

    $ npm install vue-lite-route

Now you should register the middleware pipelines processing for your router instance.  
`registerMiddlewareProcessing` function will register the `beforeEach` guard which will process the middleware pipelines for each registered route.

```js
import { createRouter } from 'vue-router';
import { registerMiddlewareProcessing } from 'vue-lite-route';

export const router = createRouter({...});
registerMiddlewareProcessing(router);
```

## Usage

Now you can proceed to the route registration.  
Let's take a couple of examples of route registrar usage.

### Registering routes:
```js
//// Routes.ts
import { Route } from 'vue-lite-route';
import ProfilePage from '.../ProfilePage.vue';
import OtherSectionPage from '.../OtherSectionPage.vue';

Route.add('/profile', { component: ProfilePage }).name('profile');
Route.add('/other/section', { component: OtherSectionPage }).name('other.section');

export const routes = Route.buildRoutes();
// After this you should pass the routes to your router instance

//// Router.ts
import { createRouter } from 'vue-router';
import { registerMiddlewareProcessing } from 'vue-lite-route';

export const router = createRouter({
    routes
});
registerMiddlewareProcessing(router);

// The code above will produce the routes equivalent to:
export const routes = [
    {
        path: '/profile',
        component: ProfilePage,
        name: 'profile'
    },
    {
        path: '/other/section',
        component: OtherSectionPage,
        name: 'other.section'
    }
];
```

### Registering routes using group:
```js
//// Routes.ts
import { Route } from 'vue-lite-route';
//... your Vue component imports

Route.group({ prefix: '/path/prefix', name: 'name.prefix' }, () => {
    Route.add('/profile', { component: ProfilePage }).name('.profile');
    Route.add(
        '/other/section',
        { components: {
            default: SomeContent,
            LeftSideBar,
            FooterSection    
        }}
    ).name('.other.section');
    Route.group({ prefix: '/another/prefix', name: '.another.prefix' }, () => {
        Route.add('/deep', { redirect: { name: 'name.prefix.profile' } }).name('.deep');
    })
});

export const routes = Route.buildRoutes();

// The code above will produce the routes equivalent to:
export const routes = [
    {
        path: '/path/prefix/profile',
        component: ProfilePage,
        name: 'name.prefix.profile'
    },
    {
        path: '/path/prefix/other/section',
        components: {
            default: SomeContent,
            LeftSideBar,
            FooterSection
        },
        name: 'name.prefix.other.section'
    },
    {
        path: '/path/prefix/profile',
        redirect: { name: 'name.prefix.profile' },
        name: 'name.prefix.another.prefix.deep'
    }
];
```
With group usage, you can nest the routes without the need to write the same path or name prefixes everywhere.  
This also simplifies the process of the path and name updating for a group of routes because you need to change them only in one place.

### Registering routes using childrenGroup:
```js
//// Routes.ts
import { Route } from 'vue-lite-route';
//... your Vue component imports

Route.childrenGroup('/parent', { action: { component: ParentComponent }, name: 'parent' }, () => {
    Route.add('nested-child', { component: NestedPage }).name('nestedPage');
});

export const routes = Route.buildRoutes();

// The code above will produce the routes equivalent to:
export const routes = [
    {
        path: '/parent',
        component: ParentComponent,
        name: 'parent',
        children: [
            {
                path: 'nested-child',
                component: NestedPage,
                name: 'nestedPage'
            }
        ]
    }
]
```
## Route Middleware

The middleware processing is one of the main features of this package because it provides
an easy way to make complex middleware pipelines with different logic.

There are two ways to create a middleware:
- Create a class that implements a `Middleware` contract.
- Create a function that implements a `MiddlewareFunction` contract.

Let's take an example of each option:

```ts
//// CheckToken.ts
export class CheckToken implements Middleware {
    async handle(context: MiddlewareContext): Promise<boolean | undefined | RouteLocationRaw> {
        const token = 'some_token';
        // ... some logic to check the token

        // Important thing is to return this context.next() 
        // because it calls the next middleware in the pipeline.
        return await context.next();
    }
}

//// CheckOption.ts
export const CheckOption: MiddlewareFunction = async (context) => {
    const option = 'option_here';
    // ... some logic to check the option

    // Important thing is to return this context.next() 
    // because it calls the next middleware in the pipeline.
    return await context.next();
}
```

> There is an option to break the middleware chain execution at some specific middleware by returning `false` value or the route for redirect.

Common situation is the middleware for checking user authentication:

```ts
//// Auth.ts
export const Auth: MiddlewareFunction = async (context) => {
    // ... some logic to retrieve the user

    const user = null; // The user is not authenticated because we can't retrieve it

    if(!user) {
        return { name: 'login' }; // We redirect the user to route 'login'
    }

    return await context.next();
}

// Basic example with this middleware protection in routes registration
Route.group({ middleware: [Auth] }, () => {
    // Routes here are protected by Auth middleware
    Route.add('/profile', { component: ProfilePage }).name('profile');
    Route.add('/payment-info', { component: PaymentInfoPage }).name('paymentInfo');
});
// We can also add this middleware protection for the specific route without group
Route.add('/password-change', { component: PasswordChangePage }).middleware([Auth]).name('passwordChange');
```

## API Documentation

### Interfaces

#### RouteActionSingleView
This is an action that represents one Vue component assigned for the route.

Properties:
- **component**: [RouteComponent](https://router.vuejs.org/api/#routecomponent) | (() => Promise<[RouteComponent](https://router.vuejs.org/api/#routecomponent)>)

#### RouteActionMultipleViews
This is an action that represents multiple Vue components assigned for the route.

Properties:
- **components**: Record<string, [RouteComponent](https://router.vuejs.org/api/#routecomponent) | (() => Promise<[RouteComponent](https://router.vuejs.org/api/#routecomponent)>)>

#### RouteActionRedirect
This is an action that represents a redirect assigned for the route.

Properties:
- **redirect**: `RouteRecordRedirectOption`

#### RouteActionChildrenGroupSingleView
This is an action that represents one Vue component assigned for the route with `children` section.
This action is used only in `childrenGroup()` registration method

Properties:
- **component?**: [RouteComponent](https://router.vuejs.org/api/#routecomponent) | (() => Promise<[RouteComponent](https://router.vuejs.org/api/#routecomponent)>) | null | undefined
- **redirect?**: `RouteRecordRedirectOption`

#### RouteActionChildrenGroupMultipleViews
This is an action that represents multiple Vue components assigned for the route with `children` section.
This action is used only in `childrenGroup()` registration method

Properties:
- **components?**: Record<string, [RouteComponent](https://router.vuejs.org/api/#routecomponent) | (() => Promise<[RouteComponent](https://router.vuejs.org/api/#routecomponent)>) | null | undefined>
- **redirect?**: `RouteRecordRedirectOption`

#### Modifier
This is an object that represents a modifier for a route group registration.

Properties:
- **prefix?**: `string`
- **name?**: `string`
- **middleware?**: [RawMiddleware](#rawmiddleware)

#### NormalizedModifier
The same as `Modifier` but the middleware is always stored as array.

Properties:
- **prefix?**: `string`
- **name?**: `string`
- **middleware?**: Array<[Middleware](#middleware) | [MiddlewareFunction](#middlewarefunction)>

#### Middleware
A contract for the class-based middleware declarations.

Methods:
- **handle(context: [MiddlewareContext](#middlewarecontext))**: Promise<boolean | undefined | [RouteLocationRaw](https://router.vuejs.org/api/#routelocationraw)>

#### MiddlewareFunction
A contract for the function-based middleware declarations.

**(context: [MiddlewareContext](#middlewarecontext))**: Promise<boolean | undefined | [RouteLocationRaw](https://router.vuejs.org/api/#routelocationraw)>

#### MiddlewareContext
This is a contract for the context that is passed in each middleware during the chain execution.

Properties:
- **to**: [RouteLocationNormalized](https://router.vuejs.org/api/interfaces/RouteLocationNormalized.html)
- **from**: [RouteLocationNormalized](https://router.vuejs.org/api/interfaces/RouteLocationNormalized.html)
- **router**: [Router](https://router.vuejs.org/api/interfaces/Router.html)
- **next**: () => Promise<[RouteLocationRaw](https://router.vuejs.org/api/#routelocationraw) | boolean | undefined>

### Type aliases

##### RouteAction
**_RouteAction_** = [RouteActionSingleView](#routeactionsingleview) | [RouteActionMultipleViews](#routeactionmultipleviews) | [RouteActionRedirect](#routeactionredirect)  
An object that represents possible action bindings for routes (`component`, `components`, `redirect`)

##### RouteActionChildrenGroup
**_RouteActionChildrenGroup_** = [RouteActionChildrenGroupSingleView](#routeactionchildrengroupsingleview) | [RouteActionChildrenGroupMultipleViews](#routeactionchildrengroupmultipleviews)  
An object that represents possible action bindings for `childrenGroup()` method.  
Similar to the `RouteAction` but supports only routes that are registered with `children` section.

##### RawMiddleware
**_RawMiddleware_** = [Middleware](#middleware) | [MiddlewareFunction](#middlewarefunction) | Array<[Middleware](#middleware) | [MiddlewareFunction](#middlewarefunction)>
A type that specifies all possible declarations of a middleware registration.

### Classes and functions:

#### RouteRegistrar

##### new RouteRegistrar()
Creates a new `RouteRegistrar` instance with clear routes collection.  
> The `Route` instance that you import for usage is actually an exported instance of this class

##### get routes(): [PreparedRouteRecord](#preparedrouterecord)[]
Getter that retrieves the internal route registrar array of [PreparedRouteRecord](#preparedrouterecord) instances.

##### clear(): this
Clears all registered routes from internal collection.

##### addRoute(path: string, action: [RouteAction](#routeaction) | [RouteActionChildrenGroup](#routeactionchildrengroup)): [PreparedRouteRecord](#preparedrouterecord)
Registers a new route into route registrar collection.

##### add(path: string, action: [RouteAction](#routeaction) | [RouteActionChildrenGroup](#routeactionchildrengroup)): [PreparedRouteRecord](#preparedrouterecord)
An alias of `addRoute()`.

##### group(modifier: [Modifier](#modifier), routesRegistrationClosure: () => void)
Makes a group for the routes registration with provided `modifier` object.  
The modifier is applied only inside scope of closure function that is provided as 2nd parameter.

##### childrenGroup(path: string, { action: [RouteActionChildrenGroup](#routeactionchildrengroup), middleware?: RawMiddleware, name?: string, meta?: [RouteMeta](https://router.vuejs.org/api/interfaces/RouteMeta.html)) }, routesRegistrationClosure: () => void)
Registers a route that will have `children` section inside.  
All routes that are registered inside `routesRegistrationClosure` will be placed inside this `children` section.

##### buildRoutes(): [RouteRecordRaw](https://router.vuejs.org/api/#routerecordraw)[]
Builds the final routes collection for the Vue router from the internal [PreparedRouteRecord](#preparedrouterecord) array.

#### PreparedRouteRecord

##### new PreparedRouteRecord({ path: string, action: [RouteAction](#routeaction) | [RouteActionChildrenGroup](#routeactionchildrengroup), attachedModifier?: [NormalizedModifier](#normalizedmodifier) })
Creates a new `PreparedRouteRecord` with specified `path` and `action`.  
If the `attachedModifier` is passed then it is getting saved into this instance.

##### path(path: string): this
Assignment of the new path for the record.  
If this record has `attachedModifier` and the modifier contains a prefix then it makes a prefix for a new path.

##### middleware(middleware: [RawMiddleware](#rawmiddleware)): this
Assignment of the new middleware for the record.
If this record has `attachedModifier` and the modifier contains a middleware array then it makes a prefix for a new middleware.

##### name(name: string): this
Assignment of the new name for the record.  
If this record has `attachedModifier` and the modifier contains a prefix then it makes a prefix for a new name.

##### meta(meta: [RouteMeta](https://router.vuejs.org/api/interfaces/RouteMeta.html)): this
Assignment of the new route meta for the record.

##### addChild(child: [PreparedRouteRecord](#preparedrouterecord)): this
Add a new child record to the internal state.  
After route build the children records will be located under the `children` section.

##### props(props: _RouteRecordProps | (Record<string, _RouteRecordProps> | boolean)): this
Add route props section.  
Acts the same as in standard vue-router routes.

##### toRawRoute(): [RouteRecordRaw](https://router.vuejs.org/api/#routerecordraw)
Builds the standard vue-router route from this record.  
Result route can be directly consumed by the vue-router instance.

#### Functions

##### registerMiddlewareProcessing(router: [Router](https://router.vuejs.org/api/interfaces/Router.html)): [Router](https://router.vuejs.org/api/interfaces/Router.html)
This function accepts the Vue router instance and registers the middleware processing guard for it.

## Resources
- [Changelog](CHANGELOG.md)

## Credits
The vue-lite-route package is heavily inspired by the [Laravel Router](https://laravel.com/docs/9.x/routing). 
This package is an effort to provide the same easy way for route registration and middleware processing as in Laravel framework.

## License
[MIT](LICENSE)
