const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const COLLECTION = require('../config/collection');

module.exports = {
    getPrincipal: () => {
      return new Promise(async (resolve, reject) => {
        try {
          let principal = await db
            .get()
            .collection(COLLECTION.PRINCIPAL)
            .findOne();
          resolve(principal);
        } catch (error) {
          console.error("Error in getPrincipal:", error);
          reject(error);
        }
      });
    },
};
  