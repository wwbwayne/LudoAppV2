"use strict";
var express = require("express");
var http = require("http");
var socketIo = require("socket.io");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var ExpressSession = require("express-session");
var sharedSession = require("express-socket.io-session");
var Ludo_1 = require("./Ludo");
var Server = (function () {
    function Server() {
        this.ludo = new Ludo_1.Ludo();
        this.createApp();
        this.createServer();
        this.middleware();
        this.sessionStorage();
        this.sockets();
        this.config();
        this.routes();
        this.listen();
    }
    Server.bootstrap = function () {
        return new Server();
    };
    Server.prototype.createApp = function () {
        this.app = express();
    };
    Server.prototype.createServer = function () {
        this.server = http.createServer(this.app);
    };
    Server.prototype.config = function () {
        this.port = this.normalizePort(process.env.PORT || Server.PORT);
        this.app.use("/phaser", express.static(__dirname + "/node_modules/phaser/build/"));
        this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
        this.app.use("/dist", express.static(path.join(__dirname, "/dist")));
        this.app.use("/images", express.static(path.join(__dirname, "/images")));
        this.app.use("/js", express.static(path.join(__dirname, "/public/js")));
        this.app.use("/css", express.static(path.join(__dirname, "/public/css")));
    };
    Server.prototype.middleware = function () {
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());
    };
    Server.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        router.get("/", function (req, res, next) {
            res.sendFile(path.join(__dirname + "/views/index.html"));
        });
        router.post("/setup", function (req, res, next) {
            if (req.session.gameId) {
                _this.ludo.getExistingGame(req.session.gameId, function (ludogame) {
                    if (req.session.playerTurn === true) {
                        ludogame.playerTurn = true;
                    }
                    res.send(ludogame);
                });
            }
            else {
                console.log("Game id NOT found.....");
                res.send({ message: "This is a mess" });
            }
        });
        router.post("/join", function (req, res, next) {
            var gameId = req.body.gameId;
            if (gameId) {
                _this.ludo.getExistingGame(gameId, function (ludogame) {
                    console.log("Created Game " + ludogame.gameId + " was Found");
                    res.send(ludogame);
                });
            }
            else {
                console.log("Game id NOT found.....");
                res.send({ message: "This is a mess" });
            }
        });
        this.app.use("/", router);
    };
    Server.prototype.sessionStorage = function () {
        this.session = ExpressSession({
            resave: false,
            saveUninitialized: true,
            secret: "i-love-husky"
        });
        this.app.use(this.session);
    };
    Server.prototype.sockets = function () {
        this.io = socketIo(this.server);
        this.io.use(sharedSession(this.session, { autoSave: true }));
    };
    Server.prototype.normalizePort = function (val) {
        var port = parseInt(val, 10);
        if (isNaN(port)) {
            return val;
        }
        if (port >= 0) {
            // port number
            return port;
        }
        return port;
    };
    Server.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log("Running server on port %s", _this.port);
        });
        this.io.on("connection", function (socket) {
            console.log("ON Connection Connected client on port %s.", _this.port);
            _this.ludo.initLudo(_this.io, socket);
        });
    };
    Server.PORT = 3000;
    return Server;
}());
var server = Server.bootstrap();
exports.__esModule = true;
exports["default"] = server.app;
