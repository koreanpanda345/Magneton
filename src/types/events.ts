export interface Events {
	name: string;
	invoke: (...args: any[]) => Promise<void>;
}
