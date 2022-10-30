import { beforeEach, describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { Route } from '../src/RouteRegistrar';
import { MiddlewareFunction } from '../src/Contracts/Middleware/MiddlewareFunction';

describe('RouteRegistrar', () => {
    beforeEach(() => {
        Route.clear();
    });
    it('should register routes with addRoute()', () => {
        Route.addRoute('/test', { component: defineComponent({}) });
        expect(Route.routes.length).toBe(1);
    });
    it('should register routes with add() alias', () => {
        Route.add('/test', { component: defineComponent({}) });
        expect(Route.routes.length).toBe(1);
    });
    it('should register groups', () => {
        Route.group({}, () => {
            Route.add('/bar', { component: defineComponent({}) });
            Route.add('/foo', { component: defineComponent({}) });
        });
        expect(Route.routes.length).toBe(2);
    });
    it('should register groups with group modifier applied', () => {
        const testMiddleware: MiddlewareFunction = async () => {
            return true;
        };
        Route.group({ prefix: 'test/prefix', name: 'test.prefix', middleware: [testMiddleware] }, () => {
            Route.add('/bar', { component: defineComponent({}) }).name('.bar');
            Route.add('/foo/some', { component: defineComponent({}) }).middleware(testMiddleware).name('.foo.some');
        });
        const routes = Route.buildRoutes();
        expect(routes[0].path).toBe('/test/prefix/bar');
        expect(routes[0].name).toBe('test.prefix.bar');
        expect((routes[0].meta?.middleware as []).length).toBe(1);
        expect(routes[1].path).toBe('/test/prefix/foo/some');
        expect(routes[1].name).toBe('test.prefix.foo.some');
        expect((routes[1].meta?.middleware as []).length).toBe(2);
    });
    it('should register groups with children ', () => {
        Route.childrenGroup('/test-children', { action: { component: defineComponent({}) } }, () => {
            Route.add('/foo', { component: defineComponent({}) }).name('child.foo');
        });
        const routes = Route.buildRoutes();
        expect(routes.length).toBe(1);
        expect(routes[0].children?.length).toBe(1);
    });
});