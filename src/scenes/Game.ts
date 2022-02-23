import Phaser, {Physics} from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import {events} from '../events/EventCenter'
import Enemy from './Enemy'
import Buck from './Buck'
import Drop from './Drop'

export default class Game extends Phaser.Scene {
	private wasd
	private pointer!: Phaser.Input.Pointer
	private camera!: Phaser.Cameras.Scene2D.Camera
	private player!: Phaser.GameObjects.Arc
	private playerBody!: Phaser.Physics.Arcade.Body
	private playerProj?: Phaser.Physics.Arcade.Group
	private enemies?: Phaser.Physics.Arcade.Group
	private cash?: Phaser.Physics.Arcade.Group
	private cashDepth: number
	private drops?: Phaser.Physics.Arcade.Group
	private dropDepth: number
	private maxEnemies: number
	private stateMachine: StateMachine
	private sceneWidth!: number
	private sceneHeight!: number
	private zoneX: number
	private zoneY: number
	private visibleLeft!: number
	private visibleRight!: number
	private visibleTop!: number
	private visibleBottom!: number
	private oneOverWidth!: number
	private spreadShotActive: boolean

	constructor() {
		super('game')
		this.zoneX = 1
		this.zoneY = 1
		this.maxEnemies = 10
		this.stateMachine = new StateMachine(this, 'game')
		this.cashDepth = 0
		this.dropDepth = 1000
		this.spreadShotActive = false
	}

	init() {
		this.wasd = this.input.keyboard.addKeys('W,A,S,D')
		this.pointer = this.input.activePointer
	}

	create() {
		this.sceneWidth = this.scale.width
		this.sceneHeight = this.scale.height
		this.oneOverWidth = 1 / this.sceneWidth
		this.scene.launch('game-ui')
		this.camera = this.cameras.main
		this.updateVisibleDimensions()

		const map = this.make.tilemap({key: 'tilemap'})
		const tileset = map.addTilesetImage('tileset', 'tileset')
		const groundLayer = map.createLayer('ground', tileset)
		const wallsLayer = map.createLayer('walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})

		this.player = this.physics.scene.add
			.circle(this.sceneWidth * 0.5, this.sceneHeight * 0.5, 10, 0xf0f0f0)
			.setOrigin(0.5, 0.5)
		this.physics.world.enableBody(this.player)
		this.playerBody = this.player.body as Phaser.Physics.Arcade.Body

		this.playerProj = this.physics.add.group({
			classType: Phaser.GameObjects.Arc,
		})

		this.enemies = this.physics.add.group({
			classType: Enemy,
		})

		this.cash = this.physics.add.group({
			classType: Buck,
		})

		this.drops = this.physics.add.group({
			classType: Drop,
		})

		this.spawnEnemies(this.maxEnemies)

		this.physics.add.collider(this.player, wallsLayer)
		this.physics.add.collider(
			this.playerProj,
			wallsLayer,
			this.handlePProjWallCollision,
			undefined,
			this
		)
		this.physics.add.collider(
			this.playerProj,
			this.enemies,
			this.handlePProjEnemyCollision,
			undefined,
			this
		)
		this.physics.add.collider(
			this.player,
			this.cash,
			this.handlePlayerCashCollision,
			undefined,
			this
		)
		this.physics.add.collider(
			this.player,
			this.drops,
			this.handlePlayerDropCollision,
			undefined,
			this
		)

		this.physics.add.collider(this.enemies, wallsLayer)
		this.physics.add.collider(
			this.enemies,
			this.player,
			this.handleEnemyPlayerCollision,
			undefined,
			this
		)
		this.physics.add.collider(this.enemies, this.enemies)

		this.camera.on('camerapancomplete', (camera, pan) => {
			// console.log('here!!!', camera, pan)
			this.updateVisibleDimensions()
			this.spawnEnemies(this.maxEnemies)
			this.input.activePointer.updateWorldPoint(this.cameras.main)
		})

		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			//TODO: Update this to pass the current weapon type
			this.fireWeapon(pointer)
		})

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
			this.wasd.W.isDown ||
			this.wasd.A.isDown ||
			this.wasd.S.isDown ||
			this.wasd.D.isDown
		) {
			this.stateMachine.setState('move')
		}
	}

	private moveOnEnter() {}

	private moveOnUpdate() {
		const speed = 300

		if (this.wasd.A.isDown) {
			this.playerBody.setVelocityX(-speed)
		} else if (this.wasd.D.isDown) {
			this.playerBody.setVelocityX(speed)
		} else {
			this.playerBody.setVelocityX(0)
		}

		if (this.wasd.W.isDown) {
			this.playerBody.setVelocityY(-speed)
		} else if (this.wasd.S.isDown) {
			this.playerBody.setVelocityY(speed)
		} else {
			this.playerBody.setVelocityY(0)
		}
	}

	private moveOnExit() {
		this.playerBody.stop()
	}

	private panCameraToZone() {
		const newZoneX = Math.floor(this.player.x * this.oneOverWidth) + 1
		const newZoneY = Math.floor(this.player.y * this.oneOverWidth) + 1
		if (this.zoneX !== newZoneX || this.zoneY !== newZoneY) {
			this.zoneX = Math.floor(this.player.x * this.oneOverWidth) + 1
			this.zoneY = Math.floor(this.player.y * this.oneOverWidth) + 1

			this.enemies?.clear(true, true)

			this.time.delayedCall(100, () => {
				this.camera = this.cameras.main.pan(
					this.sceneWidth * this.zoneX - this.sceneWidth * 0.5,
					this.sceneWidth * this.zoneY - this.sceneWidth * 0.5
				)
			})
		}
	}

	private updateVisibleDimensions() {
		this.visibleLeft = this.sceneWidth * this.zoneX - this.sceneWidth
		this.visibleRight = this.sceneWidth * this.zoneX
		this.visibleTop = this.sceneHeight * this.zoneY - this.sceneHeight
		this.visibleBottom = this.sceneHeight * this.zoneY
	}

	private randInSpawnArea() {
		let x = 0
		let y = 0
		const xOffset = 75
		const yOffset = 100
		const buffer = 300
		const flipFlopX = Phaser.Math.Between(0, 1)
		const flipFlopY = Phaser.Math.Between(0, 1)
		if (flipFlopX === 0) {
			// console.log('visibleLeft', this.visibleLeft)
			x = Phaser.Math.Between(
				this.visibleLeft + xOffset,
				this.visibleLeft + xOffset + buffer
			)
		} else {
			// console.log('visibleRight', this.visibleRight)
			x = Phaser.Math.Between(
				this.visibleRight - xOffset - buffer,
				this.visibleRight - xOffset
			)
		}
		if (flipFlopY === 0) {
			// console.log('visibleBottom', this.visibleBottom)
			y = Phaser.Math.Between(
				this.visibleTop + yOffset,
				this.visibleTop + yOffset + buffer
			)
		} else {
			// console.log('visibleTop', this.visibleTop)
			y = Phaser.Math.Between(
				this.visibleBottom - yOffset - buffer,
				this.visibleBottom - yOffset
			)
		}
		return {x, y}
	}

	private spawnEnemies(max: number) {
		for (let i = 0; i < max; i++) {
			const randXY = this.randInSpawnArea()
			const enemy = this.enemies?.get(randXY.x, randXY.y)
			this.physics.world.enableBody(enemy)
		}
	}

	private fireWeapon(pointer: Phaser.Input.Pointer) {
		if (this.spreadShotActive) {
			this.spawnProj(pointer, 3)
		} else {
			this.spawnProj(pointer, 1)
		}
	}

	private spawnProj(pointer: Phaser.Input.Pointer, max: number) {
		let i = 0
		if (max != 1) {
			i = (max - 1) * 0.5 * -1
			max = max + i
		}
		for (i; i < max; i++) {
			console.log(this.pointer.worldX, this.pointer.worldY)
			const proj: Phaser.GameObjects.Arc = this.playerProj?.get(
				this.player.x,
				this.player.y
			)
			const angle = Phaser.Math.Angle.Between(
				this.player.x,
				this.player.y,
				pointer.worldX,
				pointer.worldY
			)
			const deg = Phaser.Math.RadToDeg(angle)
			proj.setRadius(this.player.width * 0.7)
				.setStartAngle(deg - 90)
				.setEndAngle(deg + 90)
				.setStrokeStyle(3, 0x00ff00)
				.setClosePath(false)
			const projBody = proj.body as Phaser.Physics.Arcade.Body
			projBody.setSize(proj.width, proj.width, true)
			this.physics.world.enableBody(proj)
			this.physics.moveTo(
				proj,
				this.pointer.worldX + 100 * i,
				this.pointer.worldY + 100 * i,
				500
			)
			//TODO: Something is wrong with the spread when you get close to the player
		}
	}

	private spawnCash(enemy: Phaser.GameObjects.Arc, max: number) {
		for (let i = 0; i < max; i++) {
			const padX = Phaser.Math.Between(-20, 20)
			const padY = Phaser.Math.Between(-20, 20)
			const buck = this.cash
				?.get(enemy.x + padX, enemy.y + padY)
				.setDepth(this.cashDepth)
			this.cashDepth++
		}
	}

	private spawnDrop(enemy) {
		this.drops?.get(enemy.x, enemy.y).setDepth(this.dropDepth)
		this.dropDepth++
	}

	private rollForDrop(enemy) {
		const rolls: number = 1
		const maxOdds: number = 3
		if (Phaser.Math.Between(1, maxOdds) == 3) {
			this.spawnDrop(enemy)
		}
	}

	private handleEnemyPlayerCollision() {
		this.scene.start('game-start')
	}

	private handlePProjWallCollision(proj) {
		proj.destroy()
	}

	private handlePProjEnemyCollision(proj, enemy) {
		this.spawnCash(enemy, Phaser.Math.Between(1, 3))
		this.rollForDrop(enemy)
		proj.destroy()
		enemy.destroy()
	}

	private handlePlayerCashCollision(player, cash) {
		events.emit('score-changed', 10)
		cash.destroy()
	}

	private handlePlayerDropCollision(player, drop) {
		this.spreadShotActive = true
		this.time.delayedCall(10000, () => {
			this.spreadShotActive = false
		})
		drop.destroy()
	}

	update(time: number, delta: number): void {
		this.stateMachine.update(delta)
		this.panCameraToZone()
		this.enemies?.children.each((enemy) => {
			this.physics.moveTo(enemy, this.player.x, this.player.y, 150)
		})
	}
}
