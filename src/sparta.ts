import { Server, ServerOptions, Socket } from "socket.io";
import Player from "./player";
import Room from "./room";

export default class Sparta {
	private _server: Server;
	private _players: Map<string, Player> = new Map<string, Player>();
	private _rooms: Map<string, Room> = new Map<string, Room>();
	public get server(): Server {
		return this._server;
	}
	public get players(): Map<string, Player> {
		return this._players;
	}
	public get rooms(): Map<string, Room> {
		return this._rooms;
	}
	constructor(options: Partial<ServerOptions> = {}) {
		console.log("Sparta is starting...");
		this._server = new Server(options);
		this.server.on("connection", socket => {
			const player = new Player(socket, this);
			console.log(`${player.username} has connected.`);
			this.players.set(player.socket.id, player);
			socket.on("disconnect", () => {
				this.players.delete(player.socket.id);
			});
			this.createRoom(player);
		});
		let port;
		if (
			process.env.SPARTA_PORT &&
			!isNaN(parseInt(process.env.SPARTA_PORT))
		)
			port = parseInt(process.env.PORT!);
		else port = 9024;
		this.server.listen(port);
		console.log(`Listening on port ${port}`);
	}
	createRoom(player: Player, initialState?: string) {
		let newRoom = new Room(this, initialState);
		this.rooms.set(newRoom.id, newRoom);
		player.join(newRoom.id);
	}
}
