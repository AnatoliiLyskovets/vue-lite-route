import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router';

export interface MiddlewareContext {
    to: RouteLocationNormalized;
    from: RouteLocationNormalized;
    router: Router;
    next: () => Promise<RouteLocationRaw | boolean | undefined>;
}
