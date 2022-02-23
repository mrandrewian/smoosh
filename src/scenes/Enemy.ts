import Phaser from 'phaser'

export default class Enemy extends Phaser.GameObjects.Arc {
	constructor(scene, x, y) {
		super(scene, x, y)
		this.fillColor = 0x0ff000
		this.isFilled = true
		this.startAngle = 0
		this.endAngle = 360
		this.displayHeight = 40
		this.displayWidth = 40
	}
}
