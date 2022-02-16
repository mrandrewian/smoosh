import Phaser from 'phaser'
import {events} from '../events/EventCenter'

export default class GameUI extends Phaser.Scene {
	private _time!: number

	constructor() {
		super('game-ui')
	}

	create() {
		this._time = 0

		const timeLabel = this.add.text(30, 30, 'High Score:', {
			fontFamily: 'Hoefler Text',
			fontSize: '32px',
		})

		const timeVal = this.add.text(195, 30, '0', {
			fontFamily: 'Hoefler Text',
			fontSize: '32px',
		})

		events.on('time-changed', (time: number) => {
			this._time += time
			timeVal.text = this._time.toLocaleString()
		})

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			events.off('time-changed')
		})
	}
}
