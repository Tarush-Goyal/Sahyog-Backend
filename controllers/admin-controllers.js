const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const NGOOwner = require("../models/ngohead");

const getNGOs = async (req, res, next) => {
   let ngos;
   try{
     ngos=await NGOOwner.find();
     console.log(ngos);
     res.json({ items: ngos });
   } catch (err) {
     return next(err);
   }
};

const getNGODetails = async (req, res, next) => {
  let id = req.params.id;
  let ngo;
  try{
    ngo = await NGOOwner.findById(id);
    console.log(ngo);
    res.json({ items: ngo});
  } catch (err) {
    return next(err);
  }
}

const updatePreferredType = async (req,res,next) => {
  let {type,ngo_id} = req.body;
  let ngo;
  console.log("reached");
    try{
    ngo = await NGOOwner.findById(ngo_id);
    console.log(ngo);
    ngo.preferred=type;
    ngo.save();
  } catch (err) {
    return next(err);
  }
}

const sendPreferred = async (req,res,next) =>{
  let ngo;
  try{
    ngo = await NGOOwner.findById("608e8e1e1da09829a8db8583");
    res.json({ items: ngo});

  }catch (err) {
    return next(err);
  }
}





exports.getNGOs = getNGOs;
exports.getNGODetails = getNGODetails;
exports.updatePreferredType = updatePreferredType;
exports.sendPreferred = sendPreferred;
