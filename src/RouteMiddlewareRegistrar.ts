import {
    RouteLocationNamedRaw,
    RouteLocationNormalized,
    RouteLocationPathRaw,
    RouteLocationRaw,
    Router
} from 'vue-router';
import { Middleware } from './Contracts/Middleware/Middleware';
import { MiddlewareFunction } from './Contracts/Middleware/MiddlewareFunction';
import { MiddlewareContext } from './Contracts/Middleware/MiddlewareContext';

async function executeMiddleware(middleware: Middleware | MiddlewareFunction, context: MiddlewareContext) {
    if ('handle' in middleware) {
        return await middleware.handle(context);
    } else {
        return await middleware(context);
    }
}

function nextFactory(context: InitialMiddlewareContext, middleware: Array<Middleware | MiddlewareFunction>, index: number): () => Promise<RouteLocationRaw | boolean | undefined> {
    const subsequentMiddleware = middleware[index];
    if (!subsequentMiddleware)
        return async () => true;

    return async () => {
        const nextMiddleware = nextFactory(context, middleware, index + 1);
        return await executeMiddleware(subsequentMiddleware, { ...context, next: nextMiddleware });
    };
}

interface InitialMiddlewareContext {
    to: RouteLocationNormalized;
    from: RouteLocationNormalized;
    router: Router;
}

export function registerMiddlewareProcessing(router: Router) {
    router.beforeEach(async (to, from) => {
        if (to.meta.middleware) {
            const middleware = Array.isArray(to.meta.middleware)
                ? to.meta.middleware
                : [to.meta.middleware];
            if (middleware.length === 0)
                return void 0;

            const context: InitialMiddlewareContext = {
                to,
                from,
                router
            };
            const nextMiddleware = nextFactory(context, middleware, 1);

            const middlewareResult = await executeMiddleware(middleware[0], { ...context, next: nextMiddleware });

            // Let's check for the possible route location redirect
            // that can be returned from middleware chain.
            if (typeof middlewareResult !== 'boolean' && typeof middlewareResult !== 'undefined') {
                // And now we need to avoid the problem with the infinite redirect to
                // the same location, so we check if the redirect matches initial 'to' location name.
                if (typeof middlewareResult === 'string') {
                    if (middlewareResult !== to.path)
                        return middlewareResult;
                } else if ('path' in middlewareResult) {
                    if ((middlewareResult as RouteLocationPathRaw).path !== to.path)
                        return middlewareResult;
                } else if ('name' in middlewareResult) {
                    if ((middlewareResult as RouteLocationNamedRaw).name !== to.name)
                        return middlewareResult;
                }
                return true;
            }
            return middlewareResult;
        }
        return void 0;
    });
    return router;
}