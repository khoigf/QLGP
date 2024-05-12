const database = require('../config/database');

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
                response.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (data.length > 0 && data[0].password === user_password) {
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
            response.status(500).json({ message: 'Internal Server Error' });
        } else {
            let flag = true;
            const id = data.length + 1;
            for (let i = 0; i < data.length; i++) {
                if (data[i].username === name) {
                    flag = false;
                    break;
                }
            }

            if (!flag) {
                response.status(400).json({ message: 'USERNAME_EXISTED' });
            } else {
                const query2 = `INSERT INTO account (id, username, password) 
                                VALUES("${id}", "${name}", "${pass}")`;

                database.query(query2, function(error, data) {
                    if (error) {
                        response.status(500).json({ message: 'Internal Server Error' });
                    } else {
                        response.status(200).json({ message: 'OK' });
                    }
                });
            }
        }
    });
};

const getUser = (request, response, next) => {
    if (!request.user) {
        return response.status(401).json({ message: 'UNAUTHORIZED' });
    }

    const user_id = request.user.id;
    const query = `
        SELECT id, username FROM account
        WHERE id = "${user_id}"
    `;
    database.query(query, function(error, data) {
        if (error) {
            response.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (data.length > 0) {
                const { id, username } = data[0];
                response.status(200).json({ userId: id, username });
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
