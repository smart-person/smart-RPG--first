import { SceneMap } from './Scenes/Map';
import { SceneBattle } from './Scenes/Battle';
import { RpgPlayer } from './Player/Player'
import { Query } from './Query'
import { DAMAGE_SKILL, DAMAGE_PHYSIC, DAMAGE_CRITICAL, COEFFICIENT_ELEMENTS } from './presets'
import { World } from '@rpgjs/sync-server'
import { Utils, RpgPlugin, Scheduler, HookServer } from '@rpgjs/common'

let tick = 0

export class RpgServerEngine {

    app
    public database: any = {}
    public damageFormulas: any = {}
    private playerClass: any
    private scenes: Map<string, any> = new Map()
    protected totalConnected: number = 0
    private scheduler: Scheduler

    constructor(public io, public gameEngine, private inputOptions) { 
        
    }

    private async _init() {
        this.playerClass = this.inputOptions.playerClass || RpgPlayer
        this.damageFormulas = this.inputOptions.damageFormulas || {}
        this.damageFormulas = {
            damageSkill: DAMAGE_SKILL,
            damagePhysic: DAMAGE_PHYSIC,
            damageCritical: DAMAGE_CRITICAL,
            coefficientElements: COEFFICIENT_ELEMENTS,
            ...this.damageFormulas
        }

        if (!this.inputOptions.maps) this.inputOptions.maps = []

        this.inputOptions.maps = [
            ...Utils.arrayFlat(await RpgPlugin.emit(HookServer.AddMap, this.inputOptions.maps)) || [],
            ...this.inputOptions.maps
        ]

        if (!this.inputOptions.database) this.inputOptions.database = {}
       
        const datas = await RpgPlugin.emit(HookServer.AddDatabase, this.inputOptions.database) || []
        
        for (let plug of datas) {
            this.inputOptions.database = {
                ...plug,
                ...this.inputOptions.database
            }
        }

        for (let key in this.inputOptions.database) {
            const data = this.inputOptions.database[key]
            this.database[data.id] = data
        }

        this.loadScenes()
    }

     /**
     * Start the RPG server
     * 
     * @method server.start()
     * @returns {void}
     * @memberof RpgServerEngine
     */
    async start() {
        await this._init()
        let schedulerConfig = {
            tick: this.step.bind(this),
            period: 1000 / this.inputOptions.stepRate,
            delay: 4
        };
        this.scheduler = new Scheduler(schedulerConfig).start();
        this.gameEngine.start({
            getObject(id) {
                return Query.getPlayer(id) 
            },
            getObjectsOfGroup(groupId: string, player: RpgPlayer) {
                return Query.getObjectsOfMap(groupId, player)
            }
        })
        this.io.on('connection', this.onPlayerConnected.bind(this))
        RpgPlugin.emit(HookServer.Start)
    }

    step() {
        tick++
        if (tick % 4 === 0) {
            World.send()
        }
    }

    loadScenes() {
        this.scenes.set(SceneMap.id, new SceneMap(this.inputOptions.maps, this))
    }

    getScene(name: string) {
        return this.scenes.get(name)
    }

    sendToPlayer(currentPlayer, eventName, data) {
        currentPlayer._socket.emit(eventName, data)
    }

    onPlayerConnected(socket) {
        const playerId = Utils.generateUID()
        let player: RpgPlayer = new this.playerClass(this.gameEngine, playerId)

        socket.on('move', (data) => {
            this.gameEngine.processInput(data, playerId)
        })

        socket.on('disconnect', () => {
            this.onPlayerDisconnected(socket.id, playerId)
        })
        
        World.setUser(player, socket) 

        socket.emit('playerJoined', { playerId })

        player.server = this
        player._init()
        player.execMethod('onConnected')
    }

    onPlayerDisconnected(socketId, playerId: string) { 
        const player: RpgPlayer = World.getUser(playerId) as RpgPlayer
        player.execMethod('onDisconnected')
        World.disconnectUser(playerId)
    }
}