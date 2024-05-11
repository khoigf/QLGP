require('dotenv').config();
const mysql = require('mysql2');


var connection = mysql.createConnection({
    host : process.env.HOST_NAME,
    port : 3306,
    database : process.env.Database,
    user : process.env.User,
    password : process.env.Password
});

connection.connect(function(error){
    if(error)
    {
        throw error;
    }
    else
    {
        console.log('MySQL Database is connected Successfully');
    }
})

module.exports= connection; 