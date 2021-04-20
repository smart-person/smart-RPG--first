import { EventEmitter } from './EventEmitter'
import { isArray } from './Utils'

type PluginFunction = (obj: any, options?: any) => void
type PluginSides = { client: null | PluginFunction, server:  null | PluginFunction }
export type Plugin = PluginSides | [PluginSides, any]

export enum HookServer {
    Start = 'Server.Start',
    PlayerConnected = 'Server.PlayerConnected',
    PlayerDisconnected = 'Server.PlayerDisconnected',
    AddMap = 'Server.AddMap',
    AddDatabase = 'Server.AddDatabase'
}  

export enum HookClient {
    Start = 'Client.Start',
    AddSpriteSheet = 'Client.AddSpriteSheet',
    AddGui = 'Client.AddGui',
    AddSound = 'Client.AddSound'
}

export class PluginSystem extends EventEmitter {
    private loadPlugins(plugins: Plugin[], shared: any, type: string) {
        if (!plugins) return
        for (let plugin of plugins) {
            if (!plugin) continue
            let plug: any = []
            if (!isArray(plugin)) {
                plug = [plugin]
            }
            else {
                plug = plugin
            }
            const [side, options] = plug
            if (!side[type]) continue
            side[type]({
                RpgPlugin,
                ...shared
            }, options)
        }
    }

    loadServerPlugins(plugins, shared) {
        this.loadPlugins(plugins, shared, 'server')
    }

    loadClientPlugins(plugins, shared) {
        this.loadPlugins(plugins, shared, 'client')
    }
}

export const RpgPlugin = new PluginSystem()