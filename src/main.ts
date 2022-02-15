import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import GameStart from './scenes/GameStart'
import GameUI from './scenes/GameUI'
import GameOver from './scenes/GameOver'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1200,
	height: 900,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 0},
			debug: true,
		},
	},
	antialias: true,
	scene: [Preloader, Game, GameUI, GameStart, GameOver],
}

export default new Phaser.Game(config)
