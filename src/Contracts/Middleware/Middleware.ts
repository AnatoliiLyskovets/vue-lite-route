import { RouteLocationRaw } from 'vue-router';
import { MiddlewareContext } from './MiddlewareContext';

export interface Middleware {
    handle(context: MiddlewareContext): Promise<boolean | undefined | RouteLocationRaw>
}
