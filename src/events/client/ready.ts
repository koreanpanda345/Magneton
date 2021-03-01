
import { IEvent } from './../../types/events';
import { Magneton } from '../../Magneton';

export class Ready implements IEvent {
	constructor(
		private _client: Magneton
	) {

	}
	name = "ready";
	invoke = async () => {
		console.log(`${this._client.user?.username} is ready`);
		this._client.user?.setStatus("dnd");
		this._client.user?.setActivity(`${process.env.PREFIX}help | In ${this._client.guilds.cache.size} servers`);
	};
}