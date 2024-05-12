var database=require('../config/database')
const jwt = require('jsonwebtoken');
const getHomepage = (req,res)=>{
    //process data 
    //get model
    res.render('homepage.ejs')
}

const postLogin = (request, response, next) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return response.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const query = `
        SELECT * FROM account
        WHERE username = ?
    `;
    database.query(query, [username], function(error, data) {
        if (error) {
            return response.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }

        if (data.length === 0) {
            return response.status(400).json({ message: 'Tên đăng nhập không tồn tại' });
        }

        const user = data[0];
        if (user.password !== password) {
            return response.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign({ username: user.username, userId: user.userId }, 'your_secret_key', { expiresIn: '1h' });
        response.status(200).json({ token });
    });
};

const postRegister = (request, response, next) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return response.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const query = `SELECT * FROM account WHERE username = ?`;
    database.query(query, [username], function(error, data) {
        if (error) {
            return response.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }

        if (data.length > 0) {
            return response.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        const insertQuery = `INSERT INTO account (username, password) VALUES (?, ?)`;
        database.query(insertQuery, [username, password], function(error, result) {
            if (error) {
                return response.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
            }
            response.status(200).json({ message: 'Tạo tài khoản thành công' });
        });
    });
};

const getUserHomepage = (request, response)=>{
    response.render('Userpage.ejs');
}
module.exports = {
    getHomepage,
    postLogin,
    postRegister,
    getUserHomepage
}