import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { PreparedRouteRecord } from '../src/PreparedRouteRecord';
import { MiddlewareFunction } from '../src/Contracts/Middleware/MiddlewareFunction';

describe('PreparedRouteRecord utility class', () => {
    it('should throw error on missing action', () => {
        expect(() => new PreparedRouteRecord({ path: '/error', action: {} })).toThrow('action should be registered');
    });
    it('should process the modifier', () => {
        const testMiddleware: MiddlewareFunction = async () => {
            return true;
        };
        const preparedRecord = new PreparedRouteRecord(
            {
                path: '/bar',
                action: { component: defineComponent({}) },
                attachedModifier: { prefix: '/test/prefix', name: 'test.prefix', middleware: [testMiddleware] }
            }
        );
        preparedRecord.name('.bar');
        preparedRecord.middleware(testMiddleware);
        const resultRoute = preparedRecord.toRawRoute();
        expect(resultRoute.path).toBe('/test/prefix/bar');
        expect(resultRoute.name).toBe('test.prefix.bar');
        expect((resultRoute.meta?.middleware as []).length).toBe(2);
    });
});
