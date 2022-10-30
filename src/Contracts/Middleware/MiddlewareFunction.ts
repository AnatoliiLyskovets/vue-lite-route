import { RouteLocationRaw } from 'vue-router';
import { MiddlewareContext } from './MiddlewareContext';

export interface MiddlewareFunction {
    (context: MiddlewareContext): Promise<boolean | undefined | RouteLocationRaw>
}