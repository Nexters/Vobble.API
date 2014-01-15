'use strict';

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('voices', {
    voice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    file_uri: {
      type: DataTypes.STRING,
      allowNull: false
    },

    image_uri: {
      type: DataTypes.STRING,
      allowNull: false
    },

    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'voices'
  });
};
