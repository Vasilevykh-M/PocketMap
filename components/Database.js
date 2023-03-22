import React from 'react'

import * as SQLite from "expo-sqlite"

const db = SQLite.openDatabase('PointsMap.db')

const getPoints = (poitFunc, imFunc) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'select * from point',
          [],
          (_, { rows: { _array } }) => {
            poitFunc(_array)
            imFunc(_array)
          }
        );
      },
      (t, error) => { console.log("db error load points"); console.log(error) },
      (_t, _success) => { console.log("loaded points")}
    );
  }

const insertPoint = (point) => {
    db.transaction( tx => {
        tx.executeSql('insert into point (id, latitude, longitude) values(?, ?, ?)', [point.id, point.latitude, point.longitude]);
    },
    (t, error) => { console.log("db error insert point"); console.log(error);},
    (t, success) => {console.log("insert point") }
    )
}

const setupDatabaseAsync = async () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
            'create table if not exists point (id INTEGER PRIMARY KEY NOT NULL UNIQUE, latitude REAL NOT NULL, longitude REAL NOT NULL);'
          );
        },
        (_, error) => { console.log("db error creating tables"); console.log(error); reject(error) },
        (_, success) => { console.log("table creating"); resolve(success)}
      )
    })
}

const getImages = (idPoint, imageFunc) => {
    db.transaction(
        tx => {
            tx.executeSql(
                'SELECT * FROM image where id = ?',
                [idPoint],
                (_, {rows: {_array}}) => {
                    imageFunc(_array, idPoint)
                }
            );
        },
        (t, error) => { console.log("db error load images"); console.log(error) },
        (_t, _success) => { console.log("loaded images")}
    );
}

const insertImage = (image) => {
    db.transaction( tx => {
        tx.executeSql('insert into image (id, image) values(?, ?)', [image["id"], image["image"]]);
    },
    (t, error) => { console.log("db error insert image"); console.log(error);},
    (t, success) => {console.log("insert image")}
    )
}

const setupDatabaseAsyncI = async () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
            'create table if not exists image (id INTEGER NOT NULL, image TEXT);'
          );
        },
        (_, error) => { console.log("db error creating tables"); console.log(error); reject(error) },
        (_, success) => { console.log("table creating"); resolve(success)}
      )
    })
}

export const Database = {
    getPoints,
    insertPoint,
    setupDatabaseAsync,
    getImages, 
    insertImage,
    setupDatabaseAsyncI,
  }