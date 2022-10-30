import { RouteActionSingleView } from './RouteActionSingleView';
import { RouteActionMultipleViews } from './RouteActionMultipleViews';
import { RouteActionRedirect } from './RouteActionRedirect';

export type RouteAction = RouteActionSingleView | RouteActionMultipleViews | RouteActionRedirect
