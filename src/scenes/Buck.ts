import Phaser from 'phaser'

export default class Buck extends Phaser.GameObjects.Rectangle {
	// private enemy = Phaser.GameObjects.Arc
	// private destination = Phaser.Math.Vector2

	constructor(scene, x, y) {
		super(scene, x, y)
		this.fillColor = 0x007700
		this.isFilled = true
		this.displayHeight = 25
		this.displayWidth = 50
		this.setStrokeStyle(5, 0xffffff)

		const rand = Phaser.Math.Between(0, 1)
		if (rand === 0) {
			this.rotation = Phaser.Math.Between(1, 360)
		}

		// this.scene.add
		// 	.text(this.x, this.y, '$ 10 $', {
		// 		color: '#000',
		// 		fontSize: '16px',
		// 	})
		// 	.setRotation(this.rotation)
		// 	.setOrigin(0.5)
		// 	.setDepth(this.depth + 1)

		// const dropLoc = new Phaser.Math.Vector2()
		// const padX = Phaser.Math.Between(-10, 10)
		// const padY = Phaser.Math.Between(-10, 10)
		// dropLoc.x = this.enemy.x + padX
		// dropLoc.y = this.enemy.y + padY
		// this.scene.physics.moveToObject(this.enemy, dropLoc, 200, 10)
	}
}
