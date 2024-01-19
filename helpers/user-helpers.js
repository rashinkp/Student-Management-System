const { ObjectId } = require('mongodb');
var db = require('../config/connection');
const bcrypt = require('bcrypt');
const collection = require('../config/collection');

module.exports = {
    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            // Hash the password before storing it
            userData.password = await bcrypt.hash(userData.password, 10);

            // Add user to the 'users' collection
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                resolve(response);
            });
        });
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            const user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ email: userData.email });

            if (user) {
                // Compare the entered password with the hashed password in the database
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        response.status = false;
                        resolve(response);
                    }
                });
            } else {
                response.status = false;
                resolve(response);
            }
        });
    },
};
