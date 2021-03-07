export interface Task {
	name: string;
	interval: number;
	invoke: () => unknown;
}