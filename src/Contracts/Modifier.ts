import { RawMiddleware } from './Middleware/RawMiddleware';

export interface Modifier {
    prefix?: string;
    name?: string;
    middleware?: RawMiddleware;
}
