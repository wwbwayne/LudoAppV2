/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Board} from "../entities/Board";
import {Actions} from "../enums/Actions";
import {Move} from "./Move";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Player} from "../entities/Player";
import {AbstractRules} from "./AbstractRules";
import {States} from "../enums/States";
const log = factory.getLogger("model.ActiveRules");


export class ActiveRules extends AbstractRules {
    protected state: States = States.Active;
    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        super(dice, schedule, board);
    }

    public generateMoves(player: Player): Move[] {
        let moves: Move[] = [];
        let activePieces: Piece[] = player.getActivePieces(this.board);
        for (let piece of activePieces) {
            let dieUniqueIds = this.willCrossEntryPoint(piece);
            if (dieUniqueIds.length > 0) {
                // Established that both dice values cannot be played on piece
                // ids of die values that could take piece on the way out
                let ids = this.willCrossExitPoint(piece);
                if (ids.length > 0) {
                    for (let id of ids){
                        let move = this.getNewRule();
                        move.action = Actions.PLAY;
                        move.diceId = id;
                        move.pieceId = piece.uniqueId;
                        move.state = this.state;
                        moves.push(move);
                        // log.debug("Exit crossing alert!!! Dice id " + id + " will take piece on way out piece " + piece.uniqueId);
                    }
                }

            }else {
                    if (!this.dice.dieOne.isConsumed()) {
                        let move = this.getNewRule();
                        move.action = Actions.PLAY;
                        move.diceId = this.dice.dieOne.uniqueId;
                        move.pieceId = piece.uniqueId;
                        move.state = this.state;
                        moves.push(move);
                        // log.debug("Playing " + this.dice.dieOne.uniqueId + " on " + piece.uniqueId + " is fine");
                    }

                    if (!this.dice.dieTwo.isConsumed()) {
                        let move = this.getNewRule();
                        move.action = Actions.PLAY;
                        move.diceId = this.dice.dieTwo.uniqueId;
                        move.pieceId = piece.uniqueId;
                        move.state = this.state;
                        moves.push(move);
                        // log.debug("Playing " + this.dice.dieTwo.uniqueId + " on " + piece.uniqueId + " is fine");
                    }

                    if (!this.dice.dieOne.isConsumed() && !this.dice.dieTwo.isConsumed()) {
                        let move = this.getNewRule();
                        move.action = Actions.PLAY;
                        move.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                        move.pieceId = piece.uniqueId;
                        move.state = this.state;
                        moves.push(move);
                        // log.debug("Playing both dice " + piece.uniqueId + " is fine");
                    }
            }
        }
        return moves;
    }

    public generateActivePieceMovement(dieUniqueIds: string[], piece: Piece): Move {
        return this.generatePieceMovement(dieUniqueIds, piece, this.state);
    }
}
