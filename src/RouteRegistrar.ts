import { RouteMeta } from 'vue-router';
import { PreparedRouteRecord } from './PreparedRouteRecord';
import { NormalizedModifier } from './Contracts/NormalizedModifier';
import { RouteAction } from './Contracts/RouteAction';
import { Modifier } from './Contracts/Modifier';
import { RouteActionChildrenGroup } from './Contracts/RouteActionChildrenGroup';
import { RawMiddleware } from './Contracts/Middleware/RawMiddleware';

export class RouteRegistrar {
    protected _routes: PreparedRouteRecord[] = [];
    protected _modifiers: NormalizedModifier[] = [];
    protected _resultModifierStates: NormalizedModifier[] = [];
    protected _targets: PreparedRouteRecord[] = [];

    get routes() {
        return this._routes;
    }

    clear() {
        this._routes = [];
        return this;
    }

    addRoute(
        path: string,
        action: RouteAction | RouteActionChildrenGroup,
    ) {
        const lastState: NormalizedModifier | undefined = this._resultModifierStates[this._resultModifierStates.length - 1];

        const newRouteRecord = new PreparedRouteRecord({
            attachedModifier: lastState,
            path: path,
            action: action
        });
        if (this._targets.length !== 0) {
            this._targets[this._targets.length - 1].addChild(newRouteRecord);
        } else {
            this._routes.push(newRouteRecord);
        }
        return newRouteRecord;
    }

    add(
        path: string,
        action: RouteAction | RouteActionChildrenGroup,
    ) {
        return this.addRoute(path, action);
    }

    group(
        modifier: Modifier,
        routesRegistrationClosure: () => void
    ) {
        this.registerModifier(modifier);
        routesRegistrationClosure();
        this.dropLastModifier();
    }

    childrenGroup(
        path: string,
        {
            action,
            middleware,
            name,
            meta
        }: { action: RouteActionChildrenGroup, middleware?: RawMiddleware, name?: string, meta?: RouteMeta },
        routesRegistrationClosure: () => void
    ) {
        const newRoute = this.addRoute(path, action);
        if (middleware)
            newRoute.middleware(middleware);
        if (name)
            newRoute.name(name);
        if (meta)
            newRoute.meta(meta);
        this.registerModifier({ prefix: '' }, ['prefix']);
        this._targets.push(newRoute);
        routesRegistrationClosure();
        this._targets.pop();
        this.dropLastModifier();
    }

    protected registerModifier(
        modifier: Modifier,
        overwriteFields: string[] = []
    ) {
        if (modifier.middleware && !Array.isArray(modifier.middleware))
            modifier.middleware = [modifier.middleware];
        if (this._modifiers.length === 0) {
            if (modifier.prefix === undefined)
                modifier.prefix = '';
            if (modifier.name === undefined)
                modifier.name = '';
            if (modifier.middleware === undefined)
                modifier.middleware = [];
            this._modifiers.push(modifier as Required<NormalizedModifier>);
            this._resultModifierStates.push(modifier as Required<NormalizedModifier>);
            return this;
        }
        const lastState = { ...(this._resultModifierStates[this._resultModifierStates.length - 1]) } as Required<NormalizedModifier>;
        if (modifier.prefix !== undefined) {
            if (overwriteFields.includes('prefix'))
                lastState.prefix = modifier.prefix;
            else
                lastState.prefix += modifier.prefix;
        }
        if (modifier.name !== undefined) {
            if (overwriteFields.includes('name'))
                lastState.name = modifier.name;
            else
                lastState.name += modifier.name;
        }
        if (modifier.middleware) {
            if (overwriteFields.includes('middleware'))
                lastState.middleware = modifier.middleware;
            else
                lastState.middleware = lastState.middleware.concat(modifier.middleware);
        }
        this._modifiers.push(modifier as NormalizedModifier);
        this._resultModifierStates.push(lastState);
        return this;
    }

    protected dropLastModifier() {
        this._modifiers.pop();
        this._resultModifierStates.pop();
        return this;
    }

    buildRoutes() {
        return this.routes.map(route => route.toRawRoute());
    }
}

export const Route = new RouteRegistrar;
