const database = require('../config/database');

const sessions = {}
const getPersonData = async (ids) => {
    if (!Array.isArray(ids)) {
        ids = [ids];
    }
    try {
        const results = [];
        for (const id of ids) {
            // Query to get person basic info
            const personResult = await executeQuery(`SELECT * FROM person WHERE id = ?`, [id]);
            if (personResult.length === 0) {
                throw new Error(`Person with ID ${id} not found`);
            }
            const person = personResult[0];

            // Query to get additional field values
            const fieldsResult = await executeQuery(
                `SELECT fieldDefinitionCode, value FROM fieldvalue WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?, ?, ?)`,
                [id, 'avatar', 'birthday', 'callname', 'deathday', 'gender']
            );
            
            const fields = Array.isArray(fieldsResult) ? fieldsResult.reduce((acc, field) => {
                acc[field.fieldDefinitionCode] = field.value;
                return acc;
            }, {}) : {};

            // Query to get related person IDs (spouse, father, mother)
            const relationsResult = await executeQuery(
                `SELECT fieldDefinitionCode, value FROM fieldvalue WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?)`,
                [id, 'spouse', 'father', 'mother']
            );

            // Function to get basic info for a related person
            const getRelatedPersonInfo = async (relatedId) => {
                const relatedPersonResult = await executeQuery(
                    `SELECT fieldDefinitionCode, value FROM fieldvalue WHERE personId = ? AND fieldDefinitionCode IN (?, ?)`,
                    [relatedId, 'callname', 'avatar']
                );
                if (relatedPersonResult.length > 0) {
                    return {
                        id: relatedId,
                        callname: relatedPersonResult.find(row => row.fieldDefinitionCode === 'callname')?.value || null,
                        avatar: relatedPersonResult.find(row => row.fieldDefinitionCode === 'avatar')?.value || null
                    };
                } else {
                    return null;
                }
            };

            const relatedPersons = {};
            for (const relation of relationsResult) {
                relatedPersons[relation.fieldDefinitionCode] = await getRelatedPersonInfo(relation.value);
            }

            const result = {
                ...person,
                ...fields,
                spouse: relatedPersons.spouse,
                father: relatedPersons.father,
                mother: relatedPersons.mother
            };

            results.push(result);
        }

        return ids.length === 1 ? results[0] : results;
    } catch (error) {
        console.error("Error fetching person data:", error);
        throw error;
    }
};
const executeQuery = async (query, params) => {
    return new Promise((resolve, reject) => {
        database.query(query, params, (error, results) => {
            if (error) {
                reject(error); // Trả về lỗi nếu có lỗi xảy ra
            } else {
                resolve(results); // Trả về kết quả nếu không có lỗi
            }
        });
    });
};
const postLogin = (request, response, next) => {
    const user_name = request.body.username;
    const user_password = request.body.password;

    if (user_name && user_password) {
        const query = `
            SELECT * FROM account
            WHERE username = "${user_name}"
        `;
        database.query(query, function (error, data) {
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

    database.query(query1, function (error, data) {
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
                database.query(query2, [id, name, pass], function (error, data) {
                    if (error) {
                        response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                    } else {
                        // response.status(200).json({ message: 'OK' });
                        const query3 = `INSERT INTO person (ownerUserId,isStandForUser) VALUES (?,?)`;
                        database.query(query3, [id, 1], function (error, data) {
                            if (error) {
                                response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                            } else {
                                const query4 = `
                                    SELECT id FROM person
                                    WHERE ownerUserId = "${id}"
                                `;
                                database.query(query4, function (error, data) {
                                    if (error) {
                                        response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                                    } else {
                                        const pId = data[0].id;
                                        console.log(pId);
                                        const query5 = `INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode,value) 
                                                        VALUES ?`;
                                        const Data = [
                                            [pId, 1, 'callname', 'Tôi'],
                                            [pId, 2, 'gender', 'Nam'],
                                            [pId, 3, 'spouse', ''],
                                            [pId, 4, 'father', ''],
                                            [pId, 5, 'mother', ''],
                                            [pId, 6, 'birthday', ''],
                                            [pId, 7, 'deathday', ''],
                                            [pId, 8, 'avatar', '']
                                        ];
                                        database.query(query5, [Data], function (error, data) {
                                            if (error) {
                                                response.status(500).json({ message: error.message }); // Trả về thông báo lỗi cụ thể
                                            } else {
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
        database.query(query, function (error, data) {
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
    if (!data) {
        response.status(400).json({ message: 'No data' });
    }
    const sessionId = request.cookies.sessionId;
    const query1 = `INSERT INTO person (ownerUserId) VALUES (?)`;
    database.query(query1, [sessions[sessionId].userId], function (error, result) {
        if (error) {
            response.status(500).json({ message: error.message });
        } else {
            const pId = result.insertId;
            const kq = data.length;
            var check = 0;
            for (var i = 0; i < data.length; i++) {
                const query2 = `
                            SELECT id FROM fielddefinition 
                            WHERE code = "${data[i].code}"`;
                const codei = data[i].code;
                const valuei = data[i].value;
                database.query(query2, function (error, result) {
                    if (error) {
                        response.status(500).json({ message: error.message });
                    } else {
                        const id = result[0].id;
                        const query3 = `INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode,value) 
                        VALUES (?,?,?,?)`;
                        database.query(query3, [pId, id, codei, valuei], function (error, result) {
                            if (error) {
                                response.status(500).json({ message: error.message });
                            } else {
                                check++;
                                if (check == kq) {
                                    response.status(200).json({ message: 'OK' });
                                }
                            }
                        });
                    }
                });
            }
            if (asRole && target) {
                const query2 = `UPDATE fieldvalue SET value = ${pId} 
                            WHERE fieldDefinitionCode = ${asRole} AND personID = ${target} `;
                database.query(query2, function (error, result) {
                    if (error) {
                        response.status(500).json({ message: error.message });
                    } else {
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
    database.query(query1, function (error, result) {
        if (error) {
            response.status(500).json({ message: error.message });
        } else {
            const person = result[0];
            const query2 = `SELECT fieldDefinitionCode,value FROM fieldvalue 
                    WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?, ?, ?)`;
            database.query(query2, [id, 'avatar', 'birthday', 'callname', 'deathday', 'gender'], function (error, result) {
                if (error) {
                    response.status(500).json({ message: error.message });
                } else {
                    const fields = result.reduce((acc, field) => {
                        acc[field.fieldDefinitionCode] = field.value;
                        return acc;
                    }, {});
                    const query3 = `SELECT fieldDefinitionCode, value FROM fieldvalue 
                            WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?)`;
                    database.query(query3, [id, 'spouse', 'father', 'mother'], function (error, result) {
                        if (error) {
                            response.status(500).json({ message: error.message });
                        } else {
                            const relatedPersons = {};
                            var check = 0;
                            for (const relation of result) {
                                const relatedId = relation.value;
                                console.log(relatedId);
                                const query4 = `SELECT value FROM fieldvalue 
                                            WHERE personId = ? AND fieldDefinitionCode IN (?, ?)`
                                database.query(query4, [relatedId, 'callname', 'avatar'], function (error, result) {
                                    check++;
                                    if (error) {
                                        response.status(500).json({ message: error.message });
                                    } else {
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
                                    if (check == 3) {
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
        } else {
            const info = []
            const len = result.length;
            console.log(len);
            var i = 0;
            for (const pid of result) {
                const id = pid.id;
                const query1 = `SELECT * FROM person WHERE id = ${id}`;
                database.query(query1, function (error, result) {
                    if (error) {
                        response.status(500).json({ message: error.message });
                    } else {
                        const person = result[0];
                        const query2 = `SELECT fieldDefinitionCode,value FROM fieldvalue 
                                WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?, ?, ?)`;
                        database.query(query2, [id, 'avatar', 'birthday', 'callname', 'deathday', 'gender'], function (error, result) {
                            if (error) {
                                response.status(500).json({ message: error.message });
                            } else {
                                const fields = result.reduce((acc, field) => {
                                    acc[field.fieldDefinitionCode] = field.value;
                                    return acc;
                                }, {});
                                const query3 = `SELECT fieldDefinitionCode, value FROM fieldvalue 
                                        WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?)`;
                                database.query(query3, [id, 'spouse', 'father', 'mother'], function (error, result) {
                                    if (error) {
                                        response.status(500).json({ message: error.message });
                                    } else {
                                        const relatedPersons = {};
                                        var check = 0;
                                        for (const relation of result) {
                                            const relatedId = relation.value;
                                            const query4 = `SELECT value FROM fieldvalue 
                                                        WHERE personId = ? AND fieldDefinitionCode IN (?, ?)`
                                            database.query(query4, [relatedId, 'callname', 'avatar'], function (error, result) {
                                                check++;
                                                if (error) {
                                                    response.status(500).json({ message: error.message });
                                                } else {
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
                                                if (check == 3) {
                                                    const ans = {
                                                        ...person,
                                                        ...fields,
                                                        spouse: relatedPersons.spouse,
                                                        father: relatedPersons.father,
                                                        mother: relatedPersons.mother
                                                    };
                                                    info.push(ans);
                                                    i++;
                                                    if (i == len) {
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

const getDetailInfo = (request, response, next) => {
    const id = request.body.id;
    if (!id) {
        response.status(400).json({ message: 'ID not found' });
    }
    const query1 = `SELECT * FROM person WHERE id = ${id}`;
    database.query(query1, function (error, result) {
        if (error) {
            response.status(500).json({ message: error.message });
        } else {
            const person = result[0];
            const query2 = ` SELECT 
                fv.fieldDefinitionId,
                fd.code,
                fd.name,
                fd.description,
                fd.type,
                fd.isMultivalue,
                fd.isForAllPeople,
                fv.value
            FROM fieldvalue fv
            JOIN fielddefinition fd ON fv.fieldDefinitionCode = fd.code
            WHERE fv.personId = ?`
            database.query(query2, [id], async function (error, result2) {
                if (error) {
                    response.status(500).json({ message: error.message });
                } else {
                    person.fieldValues = result2;
                    const getFamilyMemberId = async (id, relation) => {
                        try {
                            const [rows] = await executeQuery(`
                                SELECT value
                                FROM fieldvalue
                                WHERE personId = ? AND fieldDefinitionCode = ?
                            `, [id, relation]);
                            if (rows.value) {
                                return parseInt(rows.value); // Trả về giá trị nếu có dữ liệu
                            } else {
                                return null; // Trả về null nếu không có dữ liệu
                            }
                        } catch (error) {
                            throw error; // Ném lỗi nếu có lỗi xảy ra trong quá trình truy vấn
                        }
                    };
                    const spouseId = await getFamilyMemberId(id, 'spouse');
                    const fatherId = await getFamilyMemberId(id, 'father');
                    const motherId = await getFamilyMemberId(id, 'mother');
                    console.log("spouseId:",spouseId);
                    console.log("fatherId:",fatherId);
                    console.log("motherId:",motherId);
                    person.spouse = spouseId ? await getPersonData(spouseId) : null;
                    person.father = fatherId ? await getPersonData(fatherId) : null;
                    person.mother = motherId ? await getPersonData(motherId) : null;
                    const childrenRows = await executeQuery(`
                        SELECT id
                        FROM person
                        WHERE id IN (
                            SELECT personId
                            FROM fieldvalue
                            WHERE fieldDefinitionCode IN (?, ?) AND value = ?
                        )
                    `, ['father', 'mother', id]);
                    const childrenIds = Array.isArray(childrenRows) ? childrenRows.map(row => row.id) : childrenRows.id;
                    console.log("childrenId:",childrenIds);
                    person.children = childrenIds ? await getPersonData(childrenIds) : null;
                    const sameFatherIds = fatherId ? (
                        await executeQuery(`
                            SELECT id
                            FROM person
                            WHERE id IN (
                                SELECT personId
                                FROM fieldvalue
                                WHERE fieldDefinitionCode = 'father' AND value = ?
                            ) AND id <> ?
                        `, [fatherId, id])
                    ).map(row => row.id) : [];
                    console.log("sameFatherId:",sameFatherIds);
                    const sameMotherIds = motherId ? (
                        await executeQuery(`
                            SELECT id
                            FROM person
                            WHERE id IN (
                                SELECT personId
                                FROM fieldvalue
                                WHERE fieldDefinitionCode = 'mother' AND value = ?
                            ) AND id <> ?
                        `, [motherId, id])
                    ).map(row => row.id) : [];
                    console.log("sameMotherId:",sameMotherIds);
                    person.siblings = {
                        sameFather: sameFatherIds ? await getPersonData(sameFatherIds) : null,
                        sameMother: sameMotherIds ? await getPersonData(sameMotherIds) : null
                    };
                    response.status(200).json(person)
                }
            });
        }
    });
};

const updateFieldValues = (request, response, next) => {
    const data = request.body.data;
    if (!data || !Array.isArray(data)) {
        return response.status(400).json({ message: 'Invalid data format' });
    }
    // Hàm cập nhật giá trị trường thông tin
    const updateFieldValue = (entry, callback) => {
        const { value, fieldDefinitionId, personId, fieldDefinitionCode } = entry;
        if (fieldDefinitionId) {
            const sql = `
                UPDATE fieldvalue
                SET value = ?
                WHERE personId = ? AND fieldDefinitionId = ?
            `;
            database.query(sql, [value, personId, fieldDefinitionId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        } else if (fieldDefinitionCode) {
            const sql = `
                UPDATE fieldvalue
                SET value = ?
                WHERE personId = ? AND fieldDefinitionCode = ?
            `;
            database.query(sql, [value, personId, fieldDefinitionCode], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        } else {
            callback(new Error('No valid fieldDefinitionId or fieldDefinitionCode provided'));
        }
    };
    const updateAllFieldValues = (data, callback) => {
        let errorOccurred = false;
        let completed = 0;

        data.forEach((entry, index) => {
            updateFieldValue(entry, (err) => {
                if (err) {
                    errorOccurred = true;
                    return callback(err);
                }
                completed++;
                if (completed === data.length && !errorOccurred) {
                    callback(null);
                }
            });
        });
    };
    updateAllFieldValues(data, (err) => {
        if (err) {
            console.error(err);
            return response.status(500).json({ message: 'Internal Server Error' });
        } else {
            return response.json({ message: 'OK' });
        }
    });
};

const addField = (request, response, next)=>{
    const { name, description, type, isMultivalue, isForAllPeople, personId } = request.body;

    if (!name || !description || !type || typeof isMultivalue === 'undefined' || typeof isForAllPeople === 'undefined') {
        return response.status(400).json({ message: 'Invalid input data' });
    }

    // Thêm trường thông tin vào bảng FieldDefinition
    const sqlInsertFieldDefinition = `
        INSERT INTO fielddefinition (code, name, description, type, isMultivalue, isForAllPeople)
        VALUES (NULL, ?, ?, ?, ?, ?)
    `;

    database.query(sqlInsertFieldDefinition, [name, description, type, isMultivalue, isForAllPeople], (err, results) => {
        if (err) {
            console.error(err);
            return response.status(500).json({ message: 'Internal Server Error' });
        }

        const fieldDefinitionId = results.insertId;

        if (isForAllPeople) {
            // Tạo các bản ghi FieldValue cho tất cả người thân của người dùng
            const sessionId = request.cookies.sessionId;
            const userId = sessions[sessionId].userId;
            const sqlSelectPersons = `SELECT id FROM person WHERE ownerUserId = ${userId}`;
            database.query(sqlSelectPersons, (err, persons) => {
                if (err) {
                    console.error(err);
                    return response.status(500).json({ message: 'Internal Server Error' });
                }

                const sqlInsertFieldValue = `
                    INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode, value)
                    VALUES (?, ?, NULL, NULL)
                `;

                persons.forEach(person => {
                    database.query(sqlInsertFieldValue, [person.id, fieldDefinitionId], (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                });

                return response.json({ message: 'OK' });
            });
        } else {
            if (!personId) {
                return response.status(400).json({ message: 'personId is required when isForAllPeople is false' });
            }

            const sqlInsertFieldValue = `
                INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode, value)
                VALUES (?, ?, NULL, NULL)
            `;

            database.query(sqlInsertFieldValue, [personId, fieldDefinitionId], (err) => {
                if (err) {
                    console.error(err);
                    return response.status(500).json({ message: 'Internal Server Error' });
                }

                return response.json({ message: 'OK' });
            });
        }
    });
};

module.exports = {
    postLogin,
    postRegister,
    getUser,
    getLogout,
    addRelative,
    getInfo,
    getAllInfo,
    getDetailInfo,
    updateFieldValues,
    addField,
};
