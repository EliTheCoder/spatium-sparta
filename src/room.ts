import { Game, Move } from "hika";
import { Server } from "socket.io";
import { nanoid } from "nanoid";
import Sparta from "./sparta";

type GameState = {
	id: string;
	game: Game;
	turn: number;
	moveHistory: Move[];
	initialState: string;
};
type SerializedGameState = {
	id: string;
	turn: number;
	moveHistory: string[];
	initialState: string;
};

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
	public get initialState(): string {
		return this._initialState;
	}
	public get state(): GameState {
		return {
			id: this.id,
			game: this.game,
			turn: this.turn,
			moveHistory: this.moveHistory,
			initialState: this.initialState
		};
	}
	public get serializedState(): SerializedGameState {
		return {
			id: this.id,
			turn: this.turn,
			moveHistory: this.serializedMoveHistory,
			initialState: this.initialState
		};
	}
	constructor(
		private _sparta: Sparta,
		private _initialState: string = "4,4,2,2 RNBQ,PPPP/KBNR,PPPP|,,pppp,rnbq/,,pppp,kbnr"
	) {
		this._id = nanoid(12);
		this._game = new Game(this.initialState || undefined);
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
