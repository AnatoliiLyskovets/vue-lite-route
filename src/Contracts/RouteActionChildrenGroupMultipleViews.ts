import { RouteComponent, RouteRecordRedirectOption } from 'vue-router';

export interface RouteActionChildrenGroupMultipleViews {
    component?: never;
    components?: Record<string, RouteComponent | (() => Promise<RouteComponent>) | null | undefined>;
    redirect?: RouteRecordRedirectOption;
}
