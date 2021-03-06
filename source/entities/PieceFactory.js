"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Piece_1 = require("../entities/Piece");
var ColorType_1 = require("../enums/ColorType");
var PiecePosition_1 = require("../entities/PiecePosition");
var angular2_uuid_1 = require("angular2-uuid");
var PieceFactory = (function () {
    function PieceFactory(game) {
        this.game = game;
    }
    PieceFactory.prototype.createNewPieces = function (colorType, playerId, signal) {
        var imageId = this.getImageKey(colorType);
        if (imageId === "red_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(49, 287);
            var redPieces = [
                new Piece_1.Piece(this.game, 118, 72, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 72, 118, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 168, 118, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 120, 168, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return redPieces;
        }
        else if (imageId === "blue_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(384, 48);
            var bluePieces = [
                new Piece_1.Piece(this.game, 552, 72, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 503, 118, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 600, 118, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 552, 168, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return bluePieces;
        }
        else if (imageId === "yellow_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(624, 385);
            var yellowPieces = [
                new Piece_1.Piece(this.game, 552, 503, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 503, 552, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 600, 552, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 552, 600, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return yellowPieces;
        }
        else if (imageId === "green_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(287, 622);
            var greenPieces = [
                new Piece_1.Piece(this.game, 118, 503, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 72, 552, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 168, 552, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 118, 600, imageId, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return greenPieces;
        }
        else {
            return [];
        }
    };
    PieceFactory.prototype.createExistingPieces = function (ludoPieces, signal) {
        var pieces = [];
        var collidingPieces = [];
        for (var _i = 0, ludoPieces_1 = ludoPieces; _i < ludoPieces_1.length; _i++) {
            var ludoPiece = ludoPieces_1[_i];
            switch (ludoPiece.color) {
                case ColorType_1.ColorType.Red: {
                    var redPiece = new Piece_1.Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId, ludoPiece.uniqueId, ludoPiece.startPosition, signal);
                    redPiece = this.updateRemainingPieceParameters(ludoPiece, redPiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(redPiece);
                    break;
                }
                case ColorType_1.ColorType.Blue: {
                    var bluePiece = new Piece_1.Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId, ludoPiece.uniqueId, ludoPiece.startPosition, signal);
                    bluePiece = this.updateRemainingPieceParameters(ludoPiece, bluePiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(bluePiece);
                    break;
                }
                case ColorType_1.ColorType.Yellow: {
                    var yellowPiece = new Piece_1.Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId, ludoPiece.uniqueId, ludoPiece.startPosition, signal);
                    yellowPiece = this.updateRemainingPieceParameters(ludoPiece, yellowPiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(yellowPiece);
                    break;
                }
                case ColorType_1.ColorType.Green: {
                    var greenPiece = new Piece_1.Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId, ludoPiece.uniqueId, ludoPiece.startPosition, signal);
                    greenPiece = this.updateRemainingPieceParameters(ludoPiece, greenPiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(greenPiece);
                    break;
                }
            }
        }
        for (var _a = 0, collidingPieces_1 = collidingPieces; _a < collidingPieces_1.length; _a++) {
            var ludoPiece = collidingPieces_1[_a];
            var piece = this.getMatchingPiece(ludoPiece.uniqueId, pieces);
            if (piece !== null) {
                var collidingPiece = this.getMatchingPiece(ludoPiece.collidingPiece, pieces);
                if (collidingPiece !== null) {
                    collidingPiece.setCollisionExited();
                }
            }
        }
        return pieces;
    };
    PieceFactory.prototype.getMatchingPiece = function (uniqueId, pieces) {
        var matchingPiece = null;
        for (var _i = 0, pieces_1 = pieces; _i < pieces_1.length; _i++) {
            var piece = pieces_1[_i];
            if (piece.uniqueId === uniqueId) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    };
    PieceFactory.prototype.updateRemainingPieceParameters = function (ludoPiece, piece) {
        piece.startIndex = ludoPiece.startIndex;
        piece.entryIndex = ludoPiece.entryIndex;
        piece.state = ludoPiece.state;
        piece.index = ludoPiece.index;
        piece.homePosition = ludoPiece.homePosition;
        return piece;
    };
    PieceFactory.prototype.getImageKey = function (colorType) {
        switch (colorType) {
            case ColorType_1.ColorType.Red:
                return "red_piece";
            case ColorType_1.ColorType.Blue:
                return "blue_piece";
            case ColorType_1.ColorType.Green:
                return "green_piece";
            case ColorType_1.ColorType.Yellow:
                return "yellow_piece";
            default:
                return "undefined";
        }
    };
    return PieceFactory;
}());
exports.PieceFactory = PieceFactory;
