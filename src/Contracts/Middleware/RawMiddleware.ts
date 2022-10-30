import { Middleware } from './Middleware';
import { MiddlewareFunction } from './MiddlewareFunction';

export type RawMiddleware = Middleware | MiddlewareFunction | Array<Middleware | MiddlewareFunction>;