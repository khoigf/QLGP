const database = require('../config/database');

var user;
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
                    response.status(200).json({ message: 'OK' , id : data[0].userId});
                    user = data[0];
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
                        response.status(200).json({ message: 'OK' });
                    }
                });
            }
        }
    });
};


const getUser = (request, response, next) => {
    if (!user) {
        return response.status(401).json({ message: 'UNAUTHORIZED' });
    }

    const user_id = user.userId;
    const query = `
        SELECT userId, username FROM account
        WHERE userId = "${user_id}"
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
};

module.exports = {
    postLogin,
    postRegister,
    getUser
};
