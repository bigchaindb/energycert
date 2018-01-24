"use strict";
import * as uuidV4 from "uuid/v4"

module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define("users", {
    userid: {type:DataTypes.STRING, primaryKey:true},
    publickey: DataTypes.STRING
  },{
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
  return users;
};
