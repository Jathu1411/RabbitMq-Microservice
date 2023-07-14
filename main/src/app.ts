const cors = require("cors");
const express = require("express");
const typeorm = require("typeorm");
import * as amqp from "amqplib/callback_api";
import { Product } from "./entity/product";
import axios from "axios";
const { ObjectId } = require("mongodb");
const URL =
  "amqps://jwgcxiig:w32wbvlYVW5onchO0tsG-yfscpUuM2q5@rat.rmq2.cloudamqp.com/jwgcxiig";
typeorm.createConnection().then((db) => {
  const productRepository = db.getMongoRepository(Product);
  amqp.connect(URL, (err, conn) => {
    if (err) {
      console.log(err);
    }
    conn.createChannel((err, channel) => {
      if (err) {
        console.log(err);
      }

      // channel.assertQueue("hello", {
      //   durable: false,
      // });
      // channel.consume("hello", (msg) => {
      //   console.log(msg.content.toString());
      // });

      channel.assertQueue("product_created", {
        durable: false,
      });
      channel.assertQueue("product_updated", {
        durable: false,
      });
      channel.assertQueue("product_deleted", {
        durable: false,
      });
      const app = express();
      app.use(
        cors({
          origin: "*",
        })
      );
      app.use(express.json());
      channel.consume(
        "product_created",
        async (msg) => {
          const eventProduct: Product = JSON.parse(msg.content.toString());
          const product = new Product();
          product.admin_id = parseInt(eventProduct.id);
          product.title = eventProduct.title;
          product.image = eventProduct.image;
          product.likes = eventProduct.likes;
          await productRepository.save(product);
          console.log("Product created >>>>>>>>>>>>>>");
        },
        {
          noAck: true,
        }
      );

      channel.consume(
        "product_updated",
        async (msg) => {
          const eventProduct: Product = JSON.parse(msg.content.toString());
          const product = await productRepository.findOne({
            admin_id: parseInt(eventProduct.id),
          });
          productRepository.merge(product, {
            title: eventProduct.title,
            image: eventProduct.image,
            likes: eventProduct.likes,
          });

          await productRepository.save(product);
          console.log("Product updated >>>>>>>>>>>>>>>>>");
        },
        {
          noAck: true,
        }
      );

      channel.consume(
        "product_deleted",
        async (msg) => {
          const adminId = parseInt(msg.content.toString());
          await productRepository.deleteOne({ admin_id: adminId });
          console.log("Product deleted >>>>>>>>>>>>>>>>>");
        },
        {
          noAck: true,
        }
      );

      app.get("/api/products", async (req, res) => {
        const products = await productRepository.find();
        res.json(products).status(200);
      });
      app.post("/api/products/:id/like", async (req, res) => {
        console.log("RR", req.params.id);
        // const product = await productRepository.findOne({
        //   _id: req.params.id,
        // });
        const product = await productRepository.findOne({
          _id: new ObjectId(req.params.id),
        });
        console.log("product", product);
        axios.post(
          `http://localhost:3000/api/product/${product.admin_id}/like`,
          {}
        );
        product.likes++;
        await productRepository.save(product);
        return res.json(product).status(200);
      });
      app.listen(3001, () => {
        console.log("Server running on port 3001");
      });
      process.on("beforeExit", () => {
        console.log("Closing ...........");
        conn.close();
      });
    });
  });
});
