const database = require('../config/database');

const sessions={}
const postLogin = (request, response, next) => {
    const user_name = request.body.username;
    const user_password = request.body.password;

    if (user_name && user_password) {
        const query = `
            SELECT * FROM account
            WHERE username = "${user_name}"
        `;
        database.query(query, function(error, data) {
            if (error) {
                response.status(500).json({ message: error.message });
            } else {
                if (data.length > 0 && data[0].password === user_password) {
                    const sessionId = Date.now().toString();
                    sessions[sessionId] = {
                        userId: data[0].userId,
                    }
                    response.cookie('sessionId', sessionId, { maxAge: 3600000, httpOnly: true });
                    response.status(200).json({ message: 'OK' });
                } else {
                    response.status(400).json({ message: 'WRONG_USERNAME_OR_PASSWORD' });
                }
            }
        });
    } else {
        response.status(400).json({ message: 'Hãy nhập tên đăng nhập và mật khẩu' });
    }
};

const postRegister = (request, response, next) => {
    const name = request.body.username;
    const pass = request.body.password;

    const query1 = `SELECT * FROM account`;

    database.query(query1, function(error, data) {
        if (error) {
            response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
        } else {
            let flag = true;
            for (let i = 0; i < data.length; i++) {
                if (data[i].username === name) {
                    flag = false;
                    break;
                }
            }
            const id = data.length + 1;
            if (!flag) {
                response.status(400).json({ message: 'USERNAME_EXISTED' });
            } else {
                const query2 = `INSERT INTO account (userId, username, password) VALUES (?, ?, ?)`;
                database.query(query2, [id, name, pass], function(error, data) {
                    if (error) {
                        response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                    } else {
                        // response.status(200).json({ message: 'OK' });
                        const query3 = `INSERT INTO person (ownerUserId) VALUES (?)`;
                        database.query(query3, [id], function(error, data) {
                            if (error) {
                                response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                            } else {
                                const query4 = `
                                    SELECT id FROM person
                                    WHERE ownerUserId = "${id}"
                                `;
                                database.query(query4, function(error, data) {
                                    if (error) {
                                        response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                                    } else{
                                        const pId=data[0].id;
                                        console.log(pId);
                                        const query5 = `INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode,value) 
                                                        VALUES ?`;
                                        const Data=[
                                            [pId,1, 'callname', 'toi'],
                                            [pId,2, 'gender', 'nam'],
                                            [pId,3, 'spouse', ''],
                                            [pId,4, 'father', ''],
                                            [pId,5, 'mother', ''],
                                            [pId,6, 'birthday', ''],
                                            [pId,7, 'deathday', ''],
                                            [pId,8, 'avatar', '']
                                        ];
                                        database.query(query5,[Data], function(error, data) {
                                            if (error) {
                                                response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                                            } else{
                                                response.status(200).json({ message: 'OK' });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};


const getUser = (request, response, next) => {
    const sessionId = request.cookies.sessionId;
    if (sessionId && sessions[sessionId]) {
        const userId = sessions[sessionId].userId;
        const query = `
            SELECT userId, username FROM account
            WHERE userId = "${userId}"
        `;
        database.query(query, function(error, data) {
            if (error) {
                response.status(500).json({ message: error.message });
            } else {
                if (data.length > 0) {
                    const { userId, username } = data[0];
                    response.status(200).json({ userId: userId, username });
                } else {
                    response.status(401).json({ message: 'UNAUTHORIZED' });
                }
            }
        });
    } else {
        response.status(401).json({ message: 'UNAUTHORIZED' });
    }
};

const getLogout = (request, response, next) => {
    delete sessions[request.cookies.sessionId];
    response.cookie('sessionId', '', { maxAge: 0, httpOnly: true });
    response.status(200).json({ message: 'OK' });
};

module.exports = {
    postLogin,
    postRegister,
    getUser,
    getLogout,
};
