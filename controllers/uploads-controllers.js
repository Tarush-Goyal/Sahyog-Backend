const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
// const methodOverride = require("method-override");

const mongoURI = `mongodb+srv://SahyogAdmin:${process.env.DB_PASSWORD}@sahyog.upfyh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const conn = mongoose.createConnection(mongoURI);

let gfs;

conn.once("open", () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

const fetchAllImages = async (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }
    return res.json(files);
  });
};

const fetchImage = async (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file

    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }

    // Check if image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      console.log("image found");
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not an image",
      });
    }
  });
};

exports.fetchAllImages = fetchAllImages;
exports.fetchImage = fetchImage;
