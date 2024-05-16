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
                        const query3 = `INSERT INTO person (ownerUserId,isStandForUser) VALUES (?,?)`;
                        database.query(query3, [id,1], function(error, data) {
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
                                            [pId,1, 'callname', 'Tôi'],
                                            [pId,2, 'gender', 'Nam'],
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

const addRelative = (request, response, next) => {
    const { data, target, asRole } = request.body;
    if(!data){
        response.status(400).json({ message: 'No data' });
    }
    const sessionId = request.cookies.sessionId;
    const query1 = `INSERT INTO person (ownerUserId) VALUES (?)`;
    database.query(query1,[sessions[sessionId].userId],function(error,result){
        if(error){
            response.status(500).json({message:error.message});
        }else{
            const pId = result.insertId;
            const kq=data.length;
            var check=0;
            for(var i=0;i<data.length;i++){
                const query2 = `
                            SELECT id FROM fielddefinition 
                            WHERE code = "${data[i].code}"`;
                const codei=data[i].code;
                const valuei=data[i].value;
                database.query(query2,function(error,result){
                    if(error){
                        response.status(500).json({message:error.message});
                    }else{
                        const id = result[0].id;
                        const query3 = `INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode,value) 
                        VALUES (?,?,?,?)`;
                        database.query(query3,[pId,id,codei,valuei],function(error,result){
                            if(error){
                                response.status(500).json({message:error.message});
                            }else{
                                check++;
                                if(check==kq){
                                    response.status(200).json({message:'OK'});
                                }
                            }
                        });
                    }
                });
            }
            if (asRole && target) {
                const query2 = `UPDATE fieldvalue SET value = ${pId} 
                            WHERE fieldDefinitionCode = ${asRole} AND personID = ${target} `;
                database.query(query2,function(error,result){
                    if(error){
                        response.status(500).json({message:error.message});
                    }else{
                        console.log("OK");
                    }
                });
            }
        }
    }); 
}

const getInfo = (request, response, next) => {
    const id = request.body.id;
    if (!id) {
        response.status(400).json({ message: 'ID is required' });
    }
    const query1 = `SELECT * FROM person WHERE id = ${id}`;
    database.query(query1,function(error,result){
        if(error){
            response.status(500).json({message:error.message});
        }else{
            const person = result[0];
            const query2 = `SELECT fieldDefinitionCode,value FROM fieldvalue 
                    WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?, ?, ?)`;
            database.query(query2,[id, 'avatar', 'birthday', 'callname', 'deathday', 'gender'],function(error,result){
                if(error){
                    response.status(500).json({message:error.message});
                }else{
                    const fields = result.reduce((acc, field) => {
                        acc[field.fieldDefinitionCode] = field.value;
                        return acc;
                      }, {});
                    const query3 = `SELECT fieldDefinitionCode, value FROM fieldvalue 
                            WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?)`;
                    database.query(query3,[id, 'spouse', 'father', 'mother'],function(error,result){
                        if(error){
                            response.status(500).json({message:error.message});
                        }else{
                            const relatedPersons = {};
                            var check =0;
                            for (const relation of result) {
                                const relatedId = relation.value;
                                console.log(relatedId);
                                const query4 = `SELECT value FROM fieldvalue 
                                            WHERE personId = ? AND fieldDefinitionCode IN (?, ?)`
                                database.query(query4,[relatedId,'callname','avatar'],function(error,result){
                                    check++;
                                    if(error){
                                        response.status(500).json({message:error.message});
                                    }else{
                                        if (result.length > 0) {
                                            relatedPersons[relation.fieldDefinitionCode] = {
                                                id: relatedId,
                                                callname: result[0].value,
                                                avatar: result[1].value
                                            };
                                        } else {
                                            relatedPersons[relation.fieldDefinitionCode] = null;
                                        }
                                    }
                                    if(check==3){
                                        console.log(relatedPersons);
                                        const ans = {
                                            ...person,
                                            ...fields,
                                            spouse: relatedPersons.spouse,
                                            father: relatedPersons.father,
                                            mother: relatedPersons.mother
                                        };
                                        response.status(200).json(ans);
                                    }
                                });
                                
                            }
                        }
                    });
                }
            });
        }
    })
}

const getAllInfo = (request, response, next) => {
    const uId = sessions[request.cookies.sessionId].userId;
    if (!uId) {
        response.status(400).json({ message: 'UNAUTHORIZED' });
    }
    const query = `
        SELECT id FROM person
        WHERE ownerUserId = "${uId}"
    `;
    database.query(query, function (error, result) {
        if (error) {
            response.status(500).json({ message: error.message });
        }else{
            const info = []
            const len=result.length;
            console.log(len);
            var i=0;
            for(const pid of result){
                const id = pid.id;
                const query1 = `SELECT * FROM person WHERE id = ${id}`;
                database.query(query1,function(error,result){
                    if(error){
                       response.status(500).json({message:error.message});
                    }else{
                        const person = result[0];
                        const query2 = `SELECT fieldDefinitionCode,value FROM fieldvalue 
                                WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?, ?, ?)`;
                        database.query(query2,[id, 'avatar', 'birthday', 'callname', 'deathday', 'gender'],function(error,result){
                            if(error){
                                response.status(500).json({message:error.message});
                            }else{
                                const fields = result.reduce((acc, field) => {
                                    acc[field.fieldDefinitionCode] = field.value;
                                    return acc;
                                }, {});
                                const query3 = `SELECT fieldDefinitionCode, value FROM fieldvalue 
                                        WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?)`;
                                database.query(query3,[id, 'spouse', 'father', 'mother'],function(error,result){
                                    if(error){
                                        response.status(500).json({message:error.message});
                                    }else{
                                        const relatedPersons = {};
                                        var check =0;
                                        for (const relation of result) {
                                            const relatedId = relation.value;
                                            const query4 = `SELECT value FROM fieldvalue 
                                                        WHERE personId = ? AND fieldDefinitionCode IN (?, ?)`
                                            database.query(query4,[relatedId,'callname','avatar'],function(error,result){
                                                check++;
                                                if(error){
                                                    response.status(500).json({message:error.message});
                                                }else{
                                                    if (result.length > 0) {
                                                        relatedPersons[relation.fieldDefinitionCode] = {
                                                            id: relatedId,
                                                            callname: result[0].value,
                                                            avatar: result[1].value
                                                        };  
                                                    } else {    
                                                        relatedPersons[relation.fieldDefinitionCode] = null;
                                                    }
                                                }
                                                if(check==3){
                                                    const ans = {
                                                        ...person,
                                                        ...fields,
                                                        spouse: relatedPersons.spouse,
                                                        father: relatedPersons.father,
                                                        mother: relatedPersons.mother
                                                    };
                                                    info.push(ans);
                                                    i++;
                                                    if(i==len){
                                                        response.status(200).json(info);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }); 
                    }
                });
            }
        }
    });
}

module.exports = {
    postLogin,
    postRegister,
    getUser,
    getLogout,
    addRelative,
    getInfo,
    getAllInfo,
};
