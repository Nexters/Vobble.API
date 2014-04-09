'use strict';

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vobbles', {
    vobble_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    voice_uri: {
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
    },

    report_cnt: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'vobbles'
  });
};
