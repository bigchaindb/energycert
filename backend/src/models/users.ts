"use strict";
import * as uuidV4 from "uuid/v4"

module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define("users", {
    userwallet: {type:DataTypes.STRING, primaryKey:true},
    publickey: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING
  },{
    timestamps: false,
    paranoid: false,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
  return users;
};
