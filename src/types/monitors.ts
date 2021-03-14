export interface Monitor {
	name: string;

	invoke: (...args: any[]) => Promise<void>;
}
