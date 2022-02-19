import Phaser from 'phaser'
import StateMachine from '~/statemachine/StateMachine'
import {events} from '../events/EventCenter'

export default class Game extends Phaser.Scene {
	private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys
	private player!: Phaser.GameObjects.Arc
	private playerBody!: Phaser.Physics.Arcade.Body
	private stateMachine: StateMachine
	private sceneWidth!: number
	private sceneHeight!: number
	private panX: number
	private panY: number
	private oneOverWidth!: number

	constructor() {
		super('game')
		this.panX = 1
		this.panY = 1
		this.stateMachine = new StateMachine(this, 'game')
	}

	init() {
		this.cursorKeys = this.input.keyboard.createCursorKeys()
	}

	create() {
		const {width, height} = this.scale

		console.log(this.cameras.main.originX, this.cameras.main.originX)
		this.cameras.main.setOrigin(0)
		console.log(this.cameras.main.originX, this.cameras.main.originX)

		this.sceneWidth = width
		this.sceneHeight = height
		this.oneOverWidth = 1 / width
		this.scene.launch('game-ui')

		const map = this.make.tilemap({key: 'tilemap'})
		const tileset = map.addTilesetImage('tileset', 'tileset')
		const groundLayer = map.createLayer('ground', tileset)
		const wallsLayer = map.createLayer('walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})

		this.player = this.physics.scene.add
			.circle(this.sceneWidth / 2, this.sceneHeight / 2, 10, 0xf0f0f0)
			.setOrigin(0.5, 0.5)
		this.physics.world.enableBody(this.player)
		this.playerBody = this.player.body as Phaser.Physics.Arcade.Body

		this.physics.add.collider(this.player, wallsLayer)

		this.stateMachine
			.addState('idle', {
				onEnter: this.idleOnEnter,
				onUpdate: this.idleOnUpdate,
			})
			.addState('move', {
				onEnter: this.moveOnEnter,
				onUpdate: this.moveOnUpdate,
				onExit: this.moveOnExit,
			})
			.setState('idle')
	}

	private idleOnEnter() {
		this.playerBody.setVelocityX(0)
	}

	private idleOnUpdate() {
		if (
			this.cursorKeys.left.isDown ||
			this.cursorKeys.right.isDown ||
			this.cursorKeys.up.isDown ||
			this.cursorKeys.down.isDown
		) {
			this.stateMachine.setState('move')
		}
	}

	private moveOnEnter() {}

	private moveOnUpdate() {
		const speed = 300

		if (this.cursorKeys.left.isDown) {
			this.playerBody.setVelocityX(-speed)
		} else if (this.cursorKeys.right.isDown) {
			this.playerBody.setVelocityX(speed)
		} else if (this.cursorKeys.up.isDown) {
			this.playerBody.setVelocityY(-speed)
		} else if (this.cursorKeys.down.isDown) {
			this.playerBody.setVelocityY(speed)
		} else {
			this.playerBody.setVelocityX(0)
			this.stateMachine.setState('idle')
		}
	}

	private moveOnExit() {
		this.playerBody.stop()
	}

	private panCameraToZone() {
		this.panX = Math.floor(this.player.x * this.oneOverWidth) + 1
		this.panY = Math.floor(this.player.y * this.oneOverWidth) + 1

		this.time.delayedCall(100, () => {
			this.cameras.main.pan(
				this.sceneWidth * this.panX - this.sceneWidth * 0.5,
				this.sceneWidth * this.panY - this.sceneWidth * 0.5,
				undefined,
				undefined,
				undefined,
				() => {
					//
				}
			)
		})
	}

	update(time: number, delta: number): void {
		events.emit('time-changed', time)
		this.stateMachine.update(delta)
		this.panCameraToZone()
	}
}
