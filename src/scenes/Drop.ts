import Phaser from 'phaser'

export default class Drop extends Phaser.GameObjects.Arc {
	constructor(scene, x, y) {
		super(scene, x, y)
		this.fillColor = 0x0000ff
		this.strokeColor = 0xffffff
		this.isFilled = true
		this.startAngle = 0
		this.endAngle = 360
		this.displayHeight = 30
		this.displayWidth = 30
		this.setStrokeStyle(15, 0xaaaaff)
	}
}
