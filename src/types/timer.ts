

export interface ITimer {
	start(time: number): void;
	checkTime(): number;
	stop(): void;
	restart(time: number): void;
}

export type TimerKey = {
	username: string,
	channelId: string
}