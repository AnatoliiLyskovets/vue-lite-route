import { RouteComponent, RouteLocationNormalized, RouteMeta, RouteRecordRaw } from 'vue-router';
import { RouteAction } from './Contracts/RouteAction';
import { RouteActionChildrenGroup } from './Contracts/RouteActionChildrenGroup';
import { NormalizedModifier } from './Contracts/NormalizedModifier';
import { Middleware } from './Contracts/Middleware/Middleware';
import { MiddlewareFunction } from './Contracts/Middleware/MiddlewareFunction';
import { RawMiddleware } from './Contracts/Middleware/RawMiddleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _RouteRecordProps = boolean | Record<string, any> | ((to: RouteLocationNormalized) => Record<string, any>);

export class PreparedRouteRecord {
    protected _path: string = '';
    protected _action: RouteAction | RouteActionChildrenGroup;
    protected _middleware: Array<Middleware | MiddlewareFunction> = [];
    protected _name?: string;
    protected _meta?: RouteMeta;
    protected _children: PreparedRouteRecord[] = [];
    protected _attachedModifier?: NormalizedModifier;
    protected _props?: _RouteRecordProps | (Record<string, _RouteRecordProps> | boolean);

    constructor({
        path,
        action,
        attachedModifier
    }: { path: string, action: RouteAction | RouteActionChildrenGroup, attachedModifier?: NormalizedModifier }) {
        this._attachedModifier = attachedModifier;
        if (!action.component && !action.components && !action.redirect)
            throw new Error('At least one action should be registered for route');
        this.path(path);
        this._action = action;
        if (attachedModifier?.middleware) {
            this._middleware = attachedModifier.middleware;
        }
        if (attachedModifier?.name) {
            this._name = attachedModifier.name;
        }
    }

    path(path: string) {
        if (path && path[0] !== '/')
            path = '/' + path;
        if (this._attachedModifier)
            this._path = this._attachedModifier.prefix ? this._attachedModifier.prefix + path : path;
        else
            this._path = path;
        return this;
    }

    middleware(middleware: RawMiddleware) {
        if (!Array.isArray(middleware))
            middleware = [middleware];
        if (this._attachedModifier)
            this._middleware = this._attachedModifier.middleware ? this._attachedModifier.middleware.concat(middleware) : middleware;
        else
            this._middleware = middleware;
        return this;
    }

    name(name: string) {
        if (this._attachedModifier)
            this._name = this._attachedModifier.name ? this._attachedModifier.name + name : name;
        else
            this._name = name;
        return this;
    }

    meta(meta: RouteMeta) {
        this._meta = meta;
        return this;
    }

    addChild(child: PreparedRouteRecord) {
        this._children.push(child);
        return this;
    }

    props(props: _RouteRecordProps | (Record<string, _RouteRecordProps> | boolean)) {
        this._props = props;
        return this;
    }

    toRawRoute(): RouteRecordRaw {
        const rawRoute = {
            path: this._path,
            name: this._name,
            meta: {
                middleware: this._middleware
            },
            children: this._children.map(child => child.toRawRoute()),
            props: this._props
        };
        if (this._action.component) {
            (rawRoute as RouteRecordRaw).component = this._action.component;
        } else if (this._action.components) {
            (rawRoute as RouteRecordRaw).components = this._action.components as Record<string, RouteComponent | (() => Promise<RouteComponent>)>;
            return rawRoute;
        }
        if (this._action.redirect) {
            (rawRoute as RouteRecordRaw).redirect = this._action.redirect;
            return rawRoute;
        }
        return rawRoute;
    }
}
