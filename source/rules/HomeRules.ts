/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Actions} from "../enums/Actions";
import {Board} from "../entities/Board";
import {Move} from "./Move";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Player} from "../entities/Player";
import {AbstractRules} from "./AbstractRules";
import {States} from "../enums/States";
const log = factory.getLogger("model.HomeRules");


export class HomeRules extends AbstractRules {
    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        super(dice, schedule, board);
    }

    public generateMoves(player: Player): Move[] {
        let moves: Move[] = [];
        if (this.rolledDoubleSix()) {
            let uniqueId1 = this.dice.dieOne.uniqueId;
            let uniqueId2 = this.dice.dieTwo.uniqueId;
            if (uniqueId1 === null || uniqueId2 === null) {
                log.debug("No matching uniqueIds for the values supplied!!!");
                return;
            }
            let homePieces: Piece[] = player.getHomePieces(this.board);
            for (let piece of homePieces) {
                let move = this.getNewRule();
                move.action = Actions.PLAY;
                move.diceId = uniqueId1;
                move.pieceId = piece.uniqueId;
                move.state = States.AtHome;
                moves.push(move);
                move = this.getNewRule();
                move.action = Actions.PLAY;
                move.diceId = uniqueId2;
                move.pieceId = piece.uniqueId;
                move.state = States.AtHome;
                moves.push(move);
                // log.debug("HomePiecesId1: " + piece.uniqueId + " PlayerID: " + player.name);
            }
        }else if (this.rolledAtLeastOneSix()) {
            let uniqueId = this.dice.getDieByValue(6);
            if (uniqueId === null) {
                log.debug("No matching uniqueId for the value supplied!!!");
                return;
            }
            let homePieces: Piece[] = player.getHomePieces(this.board);
            for (let piece of homePieces) {
                let move = this.getNewRule();
                move.action = Actions.PLAY;
                move.playBothDice = true;
                move.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                move.pieceId = piece.uniqueId;
                move.state = States.AtHome;
                moves.push(move);
                // log.debug("HomePiecesId: " + piece.uniqueId + " PlayerID: " + player.name);
            }
        }else {
            let move = this.getNewRule();
            move.action = Actions.SKIP;
            move.state = States.AtHome;
            moves.push(move);
        }
        return moves;
    }
}