import { RouteComponent, RouteRecordRedirectOption } from 'vue-router';

export interface RouteActionChildrenGroupSingleView {
    component?: RouteComponent | (() => Promise<RouteComponent>) | null | undefined;
    components?: never;
    redirect?: RouteRecordRedirectOption;
}
