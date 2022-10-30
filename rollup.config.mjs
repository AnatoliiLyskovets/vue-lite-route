import { createRequire } from 'module';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts'

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json');

const globals = {
    ...packageJson.peerDependencies,
    ...packageJson.devDependencies,
};

export default [
    {
        input: 'src/vue-lite-router.ts',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: false,
            },
            {
                file: packageJson.module,
                format: 'es',
                sourcemap: false,
            },
        ],
        plugins: [
            nodeResolve(),
            commonjs({
                exclude: 'node_modules',
                ignoreGlobal: true,
            }),
            typescript()
        ],
        external: Object.keys(globals),
    },
    {
        input: 'src/vue-lite-router.ts',
        output: {
            file: packageJson.types,
            format: 'es'
        },
        plugins: [dts()],
        external: Object.keys(globals)
    }
];