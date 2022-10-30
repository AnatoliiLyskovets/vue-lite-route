import { RouteComponent } from 'vue-router';

export interface RouteActionSingleView {
    component: RouteComponent | (() => Promise<RouteComponent>);
    components?: never;
    redirect?: never;
}
