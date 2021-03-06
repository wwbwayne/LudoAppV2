import {LudoPiece} from "./LudoPiece";
import {ColorType} from "../enums/ColorType";
import {Piece} from "../entities/Piece";
import {Player} from "../entities/Player";

export class LudoPlayer {
    public name: string;
    public playerId: string;
    public turn: boolean;
    public pieces: LudoPiece[] = [];
    public currentSelectedPiece: string = null;
    public previousDoubleSix: boolean;
    public colorTypes: ColorType[];
    public isAI: boolean;
    public sequenceNumber: number;

    constructor(player: Player) {
        this.name = player.name;
        this.playerId = player.playerId;
        this.turn = player.turn;
        this.previousDoubleSix = player.previousDoubleSix;
        this.colorTypes = player.colorTypes;
        this.isAI = player.isAI;
        this.sequenceNumber = player.sequenceNumber;
        if (player.currentSelectedPiece !== null) {
            this.currentSelectedPiece = player.currentSelectedPiece.uniqueId;
        }
        this.createPieces(player.pieces);
    }

    public createPieces(pieces: Piece[]): void {
        for (let piece of pieces){
            let ludoPiece = new LudoPiece(piece);
            this.pieces.push(ludoPiece);
        }
    }
}
