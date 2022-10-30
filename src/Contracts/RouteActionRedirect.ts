import { RouteRecordRedirectOption } from 'vue-router';

export interface RouteActionRedirect {
    component?: never;
    components?: never;
    redirect: RouteRecordRedirectOption;
}
