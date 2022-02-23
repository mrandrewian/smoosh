import Phaser from 'phaser'
import {events} from '../events/EventCenter'

export default class GameUI extends Phaser.Scene {
	private _score!: number

	constructor() {
		super('game-ui')
	}

	create() {
		this._score = 0

		const timeLabel = this.add.text(30, 30, 'Score:', {
			fontFamily: 'Hoefler Text',
			fontSize: '32px',
		})

		const timeVal = this.add.text(195, 30, '0', {
			fontFamily: 'Hoefler Text',
			fontSize: '32px',
		})

		events.on('score-changed', (score: number) => {
			this._score += score
			timeVal.text = this._score.toLocaleString()
		})

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			events.off('score-changed')
		})
	}
}
