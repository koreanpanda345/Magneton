import { CommandContext } from "../types/CommandContext";
import { ITimer } from "../types/timer";
import { DraftSystem } from "./DraftSystem";
import Timeout from "smart-timeout";
export class TimerSystem implements ITimer {
	private timer;
	constructor(
		private draft: DraftSystem,
		private ctx: CommandContext
	) {

	}

	start(time: number): void {
	}
	checkTime(): number {
		throw new Error("Method not implemented.");
	}
	stop(): void {
		throw new Error("Method not implemented.");
	}
	restart(time: number): void {
		throw new Error("Method not implemented.");
	}

	
}