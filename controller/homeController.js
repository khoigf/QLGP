var database=require('../config/database')

const postLogin = (request, response, next)=>{

    var user_name = request.body.username;
    var user_password = request.body.password;

    if(user_name && user_password) {
        query = `
        SELECT * FROM account
        WHERE username = "${user_name}"
        `;
        database.query(query, function(error, data) {
            if(data.length > 0) {
                if(data[0].password == user_password) {

                    response.status(200).json({redirectUrl: `/user/${data[0].userId}`});
                } else {
                    response.status(400).json({message: 'Mật khẩu không đúng'});
                }
            } else {
                response.status(400).json({message: 'Tên đăng nhập không đúng'});
            }
        });
    } else {
        response.status(400).json({message: 'Hãy nhập tên đăng nhập và mật khẩu'});
    }
}
const postRegister = (request, response, next) => {
    var name = request.body.username1;
    var pass = request.body.password1; 

    var query1 = `SELECT * FROM account`;

    database.query(query1, function(error, data) {
        if(error) {
            response.status(500).json({ error: 'Internal Server Error' });
        } else {
            var flag = true;
            var id = data.length + 1;
            for(var ctr = 0; ctr < data.length; ctr++) {
                if(data[ctr].username == name) {
                    flag = false;
                    break;
                }
            }

            if(!flag) {
                response.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
            } else {
                var query2 = `INSERT INTO account 
                              VALUES("${id}", "${name}", "${pass}")`;

                database.query(query2, function(error, data) {
                    if(error) {
                        response.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        response.status(200).json({ message: 'Tạo tài khoản thành công'});
                    }
                });
            }
        }
    });
}

module.exports = {
    postLogin,
    postRegister,
}