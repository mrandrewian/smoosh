import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
	constructor() {
		super('preloader')
	}

	preload() {
		this.load.image('tileset', '/assets/tileset.png')
		this.load.tilemapTiledJSON('tilemap', '/assets/tilemap.json')
	}

	create() {
		this.scene.start('game-start')
	}
}
