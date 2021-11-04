import { Game, Move } from "hika";
import { Server } from "socket.io";
import { nanoid } from "nanoid";
import Sparta from "./sparta";

export default class Room {
	private _id: string;
	private _game: Game;
	private _turn: number = 0;
	private _moveHistory: Move[] = [];
	public get game(): Game {
		return this._game;
	}
	public get turn(): number {
		return this._turn;
	}
	public get moveHistory(): Move[] {
		return this._moveHistory;
	}
	public get serializedMoveHistory(): string[] {
		return this._moveHistory.map(move => Move.serialize(move));
	}
	public get sparta(): Sparta {
		return this._sparta;
	}
	public get id(): string {
		return this._id;
	}
	constructor(private _sparta: Sparta, initialState?: string) {
		this._id = nanoid(12);
		this._game = new Game(initialState || undefined);
	}
	move(mov: Move) {
		const result = this.game.moveIfValid(mov);
		this.incrementTurn();
		this.moveHistory.push(mov);
		this.sparta.server.in(this.id).emit("move", Move.serialize(mov));
	}
	incrementTurn() {
		this._turn++;
	}
}
