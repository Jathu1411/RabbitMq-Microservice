"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as express from "express";
// import * as cors from "cors";
var express = require("express");
var cors = require("cors");
var typeorm = require("typeorm");
var product_1 = require("./entity/product");
var amqp = require("amqplib/callback_api");
var URL = "amqps://jwgcxiig:w32wbvlYVW5onchO0tsG-yfscpUuM2q5@rat.rmq2.cloudamqp.com/jwgcxiig";
typeorm.createConnection().then(function (db) {
    var productRepository = db.getRepository(product_1.Product);
    amqp.connect(URL, function (err, conn) {
        if (err) {
            console.log(err);
        }
        conn.createChannel(function (err, channel) {
            if (err) {
                console.log(err);
            }
            var app = express();
            app.use(cors({
                origin: "*", // frontend url [for multiple urls use array of urls]
            }));
            app.use(express.json());
            app.get("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, productRepository.find()];
                        case 1:
                            products = _a.sent();
                            // channel.sendToQueue("hello", Buffer.from("Hello World!"));
                            res.json(products).status(200);
                            return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var product, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            product = productRepository.create(req.body);
                            return [4 /*yield*/, productRepository.save(product)];
                        case 1:
                            result = _a.sent();
                            channel.sendToQueue("product_created", Buffer.from(JSON.stringify(result)));
                            res.json(result).status(201);
                            return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/product/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var productId, product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            productId = parseInt(req.params.id);
                            return [4 /*yield*/, productRepository.findOne({
                                    where: { id: productId },
                                })];
                        case 1:
                            product = _a.sent();
                            res.json(product).status(200);
                            return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/product/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var productId, product, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            productId = parseInt(req.params.id);
                            return [4 /*yield*/, productRepository.findOne({
                                    where: { id: productId },
                                })];
                        case 1:
                            product = _a.sent();
                            productRepository.merge(product, req.body);
                            return [4 /*yield*/, productRepository.save(product)];
                        case 2:
                            result = _a.sent();
                            channel.sendToQueue("product_updated", Buffer.from(JSON.stringify(result)));
                            res.json(result).status(200);
                            return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/product/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var productId, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            productId = parseInt(req.params.id);
                            return [4 /*yield*/, productRepository.delete(productId)];
                        case 1:
                            result = _a.sent();
                            channel.sendToQueue("product_deleted", Buffer.from(productId.toString()));
                            res.json(result).status(200);
                            return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/product/:id/like", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var productId, product, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            productId = parseInt(req.params.id);
                            return [4 /*yield*/, productRepository.findOne({
                                    where: { id: productId },
                                })];
                        case 1:
                            product = _a.sent();
                            product.likes++;
                            return [4 /*yield*/, productRepository.save(product)];
                        case 2:
                            result = _a.sent();
                            res.json(result).status(200);
                            return [2 /*return*/];
                    }
                });
            }); });
            app.listen(3000, function () {
                console.log("Server started on port 3000");
            });
            process.on("beforeExit", function () {
                console.log("Closing ...........");
                conn.close();
            });
        });
    });
});
