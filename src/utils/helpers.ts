import { Command } from "../types/commands";
import { client } from "..";
import { Events } from "../types/events";
import { Monitor } from "../types/monitors";

export async function createCommand(command: Command) {
	client.cache.commands.set(command.name, command);
}

export async function createEvent(event: Events) {
	client.cache.events.set(event.name, event);
}
export async function createMonitors(monitor: Monitor) {
	client.cache.monitors.set(monitor.name, monitor);
}
