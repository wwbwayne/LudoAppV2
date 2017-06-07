/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";
import {AIPlayer} from "../entities/AIPlayer";
import {Player} from "../entities/Player";
import {RegularPlayer} from "../entities/RegularPlayer";
import {ColorType} from "../enums/ColorType";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {ExitedBoard} from "../entities/ExitedBoard";
import {AllPossibleMoves} from "../rules/AllPossibleMoves";
import {Dice} from "../entities/Dice";
import {Rules} from "../rules/Rules";
import {factory} from "../logging/ConfigLog4j";
import {Scheduler} from "../rules/Scheduler";
import {RuleEnforcer} from "../rules/RuleEnforcer";
import * as Paths from "../entities/Paths";
import {States} from "../enums/States";
import {PlayerMode} from "../enums/PlayerMode";
import {Board} from "../entities/Board";
import {PiecePosition} from "../entities/PiecePosition";
import {Move} from "../rules/Move";
import {LudoGame} from "../game/LudoGame";
import {LudoPlayer} from "../game/LudoPlayer";
import {NewPlayers} from "../entities/NewPlayers";
import {Emit} from "../emit/Emit";
import {LocalGame} from "../game/LocalGame";
import * as $ from "jquery";
import * as cio from "socket.io-client";

const log = factory.getLogger("model.Game");

let emit = Emit.getInstance();
export class Game extends Phaser.State {
    public dice: Dice;
    public signal: Phaser.Signal;
    public enforcer: RuleEnforcer;
    public scheduler: Scheduler;
    private players: Player[] = [];
    private playerMode: PlayerMode;
    private newPlayers: NewPlayers;
    private gameId: string;
    private socket: any = null;
    private isCreator = false;
    private localGame: LocalGame;

    public init(newPlayers: NewPlayers) {
        this.newPlayers = newPlayers;
        this.isCreator = newPlayers.isCreator;
        if (this.newPlayers.hasSavedGame) {
            this.gameId = newPlayers.ludogame.gameId;
        }else {
            this.gameId = this.generateGameId(5);
        }
    }

    public create() {

        let board = this.add.sprite(0, 0, "board");
        this.signal = new Phaser.Signal();
        this.localGame = new LocalGame(this.signal);
        let activeboard: ActiveBoard = new ActiveBoard(this.signal);
        let homeboard: HomeBoard = new HomeBoard(this.signal);
        let onWayOutBoard: OnWayOutBoard = new OnWayOutBoard(this.signal);
        let exitedBoard: ExitedBoard = new ExitedBoard(this.signal);
        let currentPossibleMovements: AllPossibleMoves = new AllPossibleMoves();


        let playBtn = this.make.button(763, 540, "play", this.playDice, this, 2, 1, 0);
        let buttonGroup = this.add.group();
        buttonGroup.add(playBtn);
        let diceBtn = this.make.button(770, 440, "diceBtn", this.rollDice, this, 2, 1, 0);
        diceBtn.alpha = 0.5;
        diceBtn.scale.x = 0.2;
        diceBtn.scale.y = 0.2;
        buttonGroup.add(diceBtn);
        let reportBtn = this.make.button(730, 320, "report", this.fullScreen, this, 2, 1, 0);
        reportBtn.alpha = 0.5;
        reportBtn.scale.x = 0.3;
        reportBtn.scale.y = 0.3;
        buttonGroup.add(reportBtn);
        let updateBtn = this.make.button(810, 323, "updateBtn", this.saveGame, this, 2, 1, 0);
        updateBtn.alpha = 0.5;
        updateBtn.scale.x = 0.6;
        updateBtn.scale.y = 0.6;
        buttonGroup.add(updateBtn);
        this.game.stage.disableVisibilityChange = true;

        if (this.newPlayers.hasSavedGame) {
            if (emit.getEnableSocket()) {
                this.socket = cio();
            }
            this.localGame.setLudoGame(this.newPlayers.ludogame);
            let dieOneUUID = this.newPlayers.ludogame.ludoDice.dieOne.uniqueId;
            let dieTwoUUID = this.newPlayers.ludogame.ludoDice.dieTwo.uniqueId;
            this.dice = new Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID, this.socket, this.newPlayers.ludogame.gameId);
            this.dice.dieOne.setDieFrame(this.newPlayers.ludogame.ludoDice.dieOne);
            this.dice.dieTwo.setDieFrame(this.newPlayers.ludogame.ludoDice.dieTwo);
            this.scheduler = new Scheduler(this.dice, this.socket, this.signal, this.newPlayers.ludogame.gameId);
            emit.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard,
            onWayOutBoard, exitedBoard, this.newPlayers.ludogame.gameId, this.socket, currentPossibleMovements);
            for (let ludoPlayer of this.newPlayers.ludogame.ludoPlayers){
                if (ludoPlayer !== null && typeof ludoPlayer !== "undefined") {
                    let player = this.createExistingPlayer(ludoPlayer);
                    this.scheduler.enqueue(player);
                    for (let piece of player.pieces){
                        if (piece.isAtHome()) {
                            homeboard.addPieceToHomeBoard(piece);
                        }
                        if (piece.isActive()) {
                            activeboard.addPieceToActiveBoard(piece);
                        }
                        if (piece.isOnWayOut()) {
                            onWayOutBoard.addPieceToOnWayOutBoard(piece);
                        }
                        if (piece.isExited()) {
                            piece.setExitedWithoutDispatch();
                            exitedBoard.addPieceToActiveBoard(piece);
                        }
                    }
                    this.players.push(player);
                }
            }
            this.gameId = this.newPlayers.ludogame.gameId;
            this.displayGameId(this.newPlayers.ludogame.gameId);
            this.joinExistingGame(this.newPlayers.ludogame.gameId);
            this.waitUntilGameStarts();

        }else {
            if (emit.getEnableSocket()) {
                this.socket = cio();
            }
            let dieOneUUID = UUID.UUID();
            let dieTwoUUID = UUID.UUID();
            this.dice = new Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID, this.socket, this.gameId);
            this.scheduler = new Scheduler(this.dice, this.socket, this.signal, this.gameId);
            emit.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard,
            onWayOutBoard, exitedBoard, this.gameId, this.socket, currentPossibleMovements);
            let players: Player[] = this.createNewPlayers(this.newPlayers);
            for (let player of players) {
                this.scheduler.enqueue(player);
                this.players.push(player);
                for (let piece of player.pieces){
                    homeboard.addPieceToHomeBoard(piece);
                }
            }
            this.createGame();
            this.waitUntilGameStarts();
        }


    }

    public rollDice(): void {
        this.dice.setDicePlayerId(this.enforcer.scheduler.getCurrentPlayer().playerId);
        this.enforcer.scheduler.getCurrentPlayer().roll(this.dice);
        // log.debug(" Emiiter show me: " + emit.getEmit());
    }

    public playDice(): void {
        let dieIds = this.dice.getSelectedDiceUniqueIds();
        let player = this.scheduler.getCurrentPlayer();

        if (player.currentSelectedPiece !== null && (this.dice.dieOne.isSelected() || this.dice.dieTwo.isSelected())) {
            this.enforcer.generatePieceMovement(dieIds, player.currentSelectedPiece);
        }else {
            log.debug("No die selected or no piece selected");
        }
    }

    public update(): void {
        //
    }

    private displayGameId(gameId: string): void {
        let gameIdDisplay = this.game.add.text(0, 0, gameId, {font: "30px Revalia", fill: "#F70C0C", boundsAlignH: "center", boundsAlignV: "middle"});
        gameIdDisplay.setTextBounds(720, 290, 175, 30);
    }

    private setActivePieceParameters(piece: Piece, index: number, state: States, board: Board): void {
        let path = new Paths.ActivePath();
        let position = path.getPiecePostionByIndex(index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    }

    private setOnWayOutPieceParameters(piece: Piece, index: number, state: States, board: Board): void {
        let path = new Paths.OnWayOutPaths();
        let position = path.getPiecePostionByIndex(piece, index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    }

    private waitUntilGameStarts(): void {
        // this.dice.setDicePlayerId(this.scheduler.getCurrentPlayer().playerId);
        log.debug(" Emit is " + emit.getEmit());
        if (this.scheduler.getCurrentPlayer().isAI) {
            if (this.dice.bothDiceConsumed() ) {
                if (emit.getEmit()) {
                    this.signal.dispatch("aiRollDice", this.dice, this.scheduler.getCurrentPlayer().playerId);
                }
            }else {
                this.enforcer.setRollCounter(1);
                this.enforcer.endOfDiceRoll("endOfDieRoll");
            }
        }else if (this.scheduler.getCurrentPlayer().isAI === false && this.dice.bothDiceConsumed() === false) {
            this.enforcer.setRollCounter(1);
            this.enforcer.endOfDiceRoll("endOfDieRoll");
        }
        this.enforcer.rule.checkBoardConsistencies();
    }


    private ireport(): void {
        //
    }

    private saveGame(): void {
        let ludoGame = new LudoGame(this.players, this.dice, this.gameId);
        log.debug(JSON.stringify(ludoGame, null, "\t"));
        log.debug(JSON.stringify(ludoGame));
    }

    private createGame(): void {
        let ludoGame = new LudoGame(this.players, this.dice, this.gameId);
        this.displayGameId(ludoGame.gameId);
        this.localGame.setLudoGame(ludoGame);
        if (emit.getEnableSocket()) {
            this.socket.emit("createGame", ludoGame, (data: any) => {
                if (data.ok) {
                    emit.setEmit(data.emit);
                    log.debug(data.message + " " + emit.getEmit());
                }
            });
        }
    }

    private joinExistingGame(gameId: string): void {
        if (emit.getEnableSocket()) {
            this.socket.emit("joinExistingGame", gameId, (data: any) => {
                if (data.ok) {
                    log.debug(data.message + " " + emit.getEmit());
                }
            });
        }
    }

    private createNewPlayers(newPlayers: NewPlayers): Player[] {
        let players: Player[] = [];
        for (let newPlayer of newPlayers.newPlayers){
            if (newPlayer.isAI) {
                let aiPlayer = new AIPlayer(this.game, newPlayer.playerName, UUID.UUID(), true, newPlayer.color, this.signal,
                 this.socket, this.gameId, null, this.enforcer);
                players.push(aiPlayer);
            }else {
                let regularPlayer = new RegularPlayer(this.game, newPlayer.playerName, UUID.UUID(), true, newPlayer.color, this.signal, this.socket,
                 this.gameId, null, this.enforcer);
                players.push(regularPlayer);
            }
        }
        return players;
    }

    private createExistingPlayer(ludoPlayer: LudoPlayer): Player {
        let player: Player = null;
        if (ludoPlayer.isAI) {
            player = new AIPlayer(this.game, ludoPlayer.name, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes,
            this.signal, this.socket, this.gameId, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
        }else {
            player = new RegularPlayer(this.game, ludoPlayer.name, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes,
            this.signal, this.socket, this.gameId, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
        }
        return player;
    }

    private fullScreen(): void {
        if (this.scale.isFullScreen) {
            this.scale.stopFullScreen();
        }else {
            this.scale.startFullScreen(false);
        }
    }

    private generateGameId(length: number): string {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }
}
