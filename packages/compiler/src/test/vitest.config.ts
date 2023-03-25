/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { clientBuildConfig } from '../build/client-config.js'
import path from 'path'

export default defineConfig(async () => {
    let config = await clientBuildConfig(process.cwd(), {
        mode: 'test',
        serveMode: false,
    })
    const packages = ['client', 'server', 'database', 'testing', 'common', 'standalone', 'types']
    let configResolveAlias = {}
    for (const pkg of packages) {
        configResolveAlias[`@rpgjs/${pkg}`] = path.resolve(__dirname, `../../../${pkg}/src/index.ts`)
    }
    config = {
        ...config,
        resolve: {
            ...config.resolve,
            alias: {
                ...config.resolve.alias,
                ...configResolveAlias
            }
        }
    }
    return {
        ...config,
        test: {
            threads: false,
            maxThreads: 1,
            environment: 'jsdom',
            setupFiles: [
                'packages/compiler/src/setupFiles/canvas.ts'
            ]
        }
    }
})