import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
	constructor() {
		super('game')
	}

	create() {
		this.scene.launch('game-ui')

		const {width, height} = this.scale
		const circle = this.add
			.circle(width * 0.5, height * 0.5, 50, 0xff0000)
			.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
				this.scene.start('game-over')
			})
		this.add.text(circle.x, circle.y, 'die').setOrigin(0.5)
	}

	update(time: number, delta: number): void {}
}
