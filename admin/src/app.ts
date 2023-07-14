// import * as express from "express";
// import * as cors from "cors";
import express = require("express");
import cors = require("cors");
import typeorm = require("typeorm");
import { Product } from "./entity/product";
import { Response, Request } from "express";
import * as amqp from "amqplib/callback_api";

const URL =
  "amqps://jwgcxiig:w32wbvlYVW5onchO0tsG-yfscpUuM2q5@rat.rmq2.cloudamqp.com/jwgcxiig";

typeorm.createConnection().then((db) => {
  const productRepository = db.getRepository(Product);
  amqp.connect(URL, (err, conn) => {
    if (err) {
      console.log(err);
    }
    conn.createChannel((err, channel) => {
      if (err) {
        console.log(err);
      }
      const app = express();
      app.use(
        cors({
          origin: "*", // frontend url [for multiple urls use array of urls]
        })
      );

      app.use(express.json());

      app.get("/api/products", async (req: Request, res: Response) => {
        const products = await productRepository.find();
        // channel.sendToQueue("hello", Buffer.from("Hello World!"));
        res.json(products).status(200);
      });

      app.post("/api/products", async (req: Request, res: Response) => {
        const product = productRepository.create(req.body);
        const result = await productRepository.save(product);
        channel.sendToQueue(
          "product_created",
          Buffer.from(JSON.stringify(result))
        );
        res.json(result).status(201);
      });

      app.get("/api/product/:id", async (req: Request, res: Response) => {
        const productId = parseInt(req.params.id);
        const product = await productRepository.findOne({
          where: { id: productId },
        });
        res.json(product).status(200);
      });

      app.put("/api/product/:id", async (req: Request, res: Response) => {
        const productId = parseInt(req.params.id);
        const product = await productRepository.findOne({
          where: { id: productId },
        });
        productRepository.merge(product, req.body);
        const result = await productRepository.save(product);
        channel.sendToQueue(
          "product_updated",
          Buffer.from(JSON.stringify(result))
        );
        res.json(result).status(200);
      });

      app.delete("/api/product/:id", async (req: Request, res: Response) => {
        const productId = parseInt(req.params.id);
        const result = await productRepository.delete(productId);
        channel.sendToQueue(
          "product_deleted",
          Buffer.from(productId.toString())
        );
        res.json(result).status(200);
      });

      app.post("/api/product/:id/like", async (req: Request, res: Response) => {
        const productId = parseInt(req.params.id);
        const product = await productRepository.findOne({
          where: { id: productId },
        });
        product.likes++;
        const result = await productRepository.save(product);
        res.json(result).status(200);
      });

      app.listen(3000, () => {
        console.log("Server started on port 3000");
      });
      process.on("beforeExit", () => {
        console.log("Closing ...........");
        conn.close();
      });
    });
  });
});
