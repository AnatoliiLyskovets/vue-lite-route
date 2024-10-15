import { RouteMeta } from 'vue-router';
import { PreparedRouteRecord } from './PreparedRouteRecord';
import { NormalizedModifier } from './Contracts/NormalizedModifier';
import { RouteAction } from './Contracts/RouteAction';
import { Modifier } from './Contracts/Modifier';
import { RouteActionChildrenGroup } from './Contracts/RouteActionChildrenGroup';
import { RawMiddleware } from './Contracts/Middleware/RawMiddleware';

export type OverwriteField = keyof Modifier;

export class RouteRegistrar {
    protected preparedRoutes: PreparedRouteRecord[] = [];
    protected modifiers: NormalizedModifier[] = [];
    protected resultModifierStates: NormalizedModifier[] = [];
    protected targets: PreparedRouteRecord[] = [];

    get routes() {
        return this.preparedRoutes;
    }

    clear() {
        this.preparedRoutes = [];
        return this;
    }

    addRoute(
        path: string,
        action: RouteAction | RouteActionChildrenGroup,
    ) {
        const lastState: NormalizedModifier | undefined = this.resultModifierStates[this.resultModifierStates.length - 1];

        const newRouteRecord = new PreparedRouteRecord({
            attachedModifier: lastState,
            path: path,
            action: action
        });
        if (this.targets.length !== 0) {
            this.targets[this.targets.length - 1].addChild(newRouteRecord);
        } else {
            this.preparedRoutes.push(newRouteRecord);
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
        this.targets.push(newRoute);
        routesRegistrationClosure();
        this.targets.pop();
        this.dropLastModifier();
        return newRoute;
    }

    protected normalizeInitialModifier(modifier: Modifier) {
        if (modifier.prefix === undefined)
            modifier.prefix = '';
        if (modifier.name === undefined)
            modifier.name = '';
        if (modifier.middleware === undefined)
            modifier.middleware = [];
        return modifier as Required<NormalizedModifier>;
    }

    protected registerModifier(
        modifier: Modifier,
        overwriteFields: OverwriteField[] = []
    ) {
        if (modifier.middleware && !Array.isArray(modifier.middleware)) {
            modifier.middleware = [modifier.middleware];
        }
        if (this.modifiers.length === 0) {
            const normalizedModifier = this.normalizeInitialModifier(modifier);
            this.modifiers.push(normalizedModifier);
            this.resultModifierStates.push(normalizedModifier);
            return this;
        }
        const lastState = { ...(this.resultModifierStates[this.resultModifierStates.length - 1]) } as Required<NormalizedModifier>;
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
        this.modifiers.push(modifier as NormalizedModifier);
        this.resultModifierStates.push(lastState);
        return this;
    }

    protected dropLastModifier() {
        this.modifiers.pop();
        this.resultModifierStates.pop();
        return this;
    }

    buildRoutes() {
        return this.preparedRoutes.map(route => route.toRawRoute());
    }
}

export const Route = new RouteRegistrar;
