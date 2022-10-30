import { Middleware } from './Middleware/Middleware';
import { Modifier } from './Modifier';
import { MiddlewareFunction } from './Middleware/MiddlewareFunction';

export interface NormalizedModifier extends Modifier {
    middleware?: Array<Middleware | MiddlewareFunction>;
}
