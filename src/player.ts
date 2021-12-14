import EventEmitter from "eventemitter3";
import { Move } from "hika";
import { Socket } from "socket.io";
import Room from "./room";
import Sparta from "./sparta";

export default class Player extends EventEmitter {
	private _username: string | undefined;
	private _rooms: Map<string, Room> = new Map<string, Room>();
	public get username(): string | undefined {
		return this._username;
	}
	public get socket(): Socket {
		return this._socket;
	}
	public get rooms(): Map<string, Room> {
		return this._rooms;
	}
	public get sparta(): Sparta {
		return this._sparta;
	}
	constructor(private _socket: Socket, private _sparta: Sparta) {
		super();
		this.socket.onAny((event: string, ...args) => {
			this.emit(event, ...args);
		});
		if (typeof this.socket.handshake.query.username === "string") {
			this._username = this.socket.handshake.query.username as string;
		} else {
			this.disconnect();
		}
		this.on("move", data => {
			if (this.rooms.has(data.room)) {
				this.rooms.get(data.room)!.move(Move.deserialize(data.move));
			} else {
				this.send("error", "Room does not exist");
			}
		});
		this.on("create", data => {
			this.sparta.createRoom(this, data.initialState || undefined);
		});
	}
	join(room: string) {
		if (this.sparta.rooms.has(room)) {
			this.socket.join(room);
			this.send("state", this.sparta.rooms.get(room)!.serializedState);
		}
	}
	leave(room: string) {
		this.socket.leave(room);
	}
	disconnect() {
		this.socket.disconnect();
	}
	private send(event: string, ...args: any[]) {
		this.socket.emit(event, ...args);
	}
}
