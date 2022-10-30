import { RouteComponent } from 'vue-router';

export interface RouteActionMultipleViews {
    component?: never;
    components: Record<string, RouteComponent | (() => Promise<RouteComponent>)>;
    redirect?: never;
}
