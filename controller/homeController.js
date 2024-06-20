const database = require('../config/database');
const { backupFamilyDataToCSV, restoreFamilyDataFromCSV, getAllBaseInfo } = require('./backup');
const sessions = {};

const getPersonData = async (ids) => {
    var isMultivalue = Array.isArray(ids);
    if (!isMultivalue) {
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

        return isMultivalue ? results : results[0];
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
                        const query3 = `INSERT INTO person (ownerUserId,searchString,isStandForUser) VALUES (?,?,?)`;
                        database.query(query3, [id, 'Tôi Nam', 1], function (error, data) {
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
                                        // console.log(pId);
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
                                                const query6 = `INSERT INTO upcomingeventtargetinfo (userId, type, numGenerationsAbove, 
                                                    numGenerationsBelow, includeEqualGeneration, specificPersonIds) VALUES (?, ?, ?, ?, ?, ?)`;
                                                database.query(query6, [id, '0', null, null, null, null], function (error, data) {
                                                    if (error) {
                                                        response.status(500).json({ message: error.message });
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
        return;
    }
    //console.log(data);
    const sessionId = request.cookies.sessionId;
    const userId = sessions[sessionId].userId;

    const query1 = `INSERT INTO person (ownerUserId) VALUES (?)`;
    database.query(query1, [userId], function (error, result) {
        if (error) {
            response.status(500).json({ message: error.message });
        } else {
            const pId = result.insertId;
            const kq = data.length;
            let check = 0;
            let callname = '';
            let gender = '';

            // Function to insert fieldvalue
            const insertFieldValue = (personId, fieldDefinitionId, fieldDefinitionCode, value, callback) => {
                const query = `INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode, value) VALUES (?,?,?,?)`;
                database.query(query, [personId, fieldDefinitionId, fieldDefinitionCode, value], callback);
            };

            // Insert provided field values
            data.forEach((entry, index) => {
                const query2 = `SELECT id FROM fielddefinition WHERE code = ?`;
                const codei = entry.code;
                const valuei = entry.value;
                if (codei === 'callname') {
                    callname = valuei;
                } else if (codei === 'gender') {
                    gender = valuei;
                }
                if (codei === 'spouse'){

                    const updateSql = `UPDATE fieldvalue SET value = ? WHERE personId = ? AND fieldDefinitionId = ?`;
                    const deleteSql = `UPDATE fieldvalue SET value = NULL WHERE value IN (?,?) AND fieldDefinitionId = ? AND personId <> ?`;
                    database.query(deleteSql, [pId, valuei, 3,valuei], (err, results) => {
                        if (err) {
                            response.status(500).json({ message: error.message });
                        }
                        database.query(updateSql, [pId, valuei, 3], (err, results) => {
                            if (err) {
                                response.status(500).json({ message: error.message });
                            }else{
                                console.log("Update spouse");
                            }
                        });
                    });
                }
                database.query(query2, [codei], function (error, result) {
                    if (error) {
                        response.status(500).json({ message: error.message });
                    } else {
                        const fieldDefinitionId = result[0].id;
                        insertFieldValue(pId, fieldDefinitionId, codei, valuei, (error) => {
                            if (error) {
                                response.status(500).json({ message: error.message });
                            } else {
                                check++;
                                if (check === kq) {
                                    // Fetch additional fielddefinitions for this user
                                    const query3 = `SELECT id, code FROM fielddefinition WHERE isForAllPeopleOfUserId = ?`;
                                    database.query(query3, [userId], function (error, results) {
                                        if (error) {
                                            response.status(500).json({ message: error.message });
                                        } else {
                                            let additionalCheck = 0;
                                            const totalInserts = results.length;
                                            if (totalInserts === 0) {
                                                finalizeResponse();
                                            } else {
                                                results.forEach(fieldDef => {
                                                    insertFieldValue(pId, fieldDef.id, fieldDef.code, "", (error) => {
                                                        if (error) {
                                                            response.status(500).json({ message: error.message });
                                                        } else {
                                                            additionalCheck++;
                                                            if (additionalCheck === totalInserts) {
                                                                finalizeResponse();
                                                            }
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });

            // Finalize the response after all insertions are done
            const finalizeResponse = () => {
                const searchString = callname+" " + gender;
                const query4 = `UPDATE person SET searchString = ? WHERE id = ?`;
                database.query(query4, [searchString, pId], function (error) {
                    if (error) {
                        response.status(500).json({ message: error.message });
                    } else {
                        if (asRole && target) {
                            const query5 = `UPDATE fieldvalue SET value = ? WHERE fieldDefinitionCode = ? AND personID = ?`;
                            database.query(query5, [pId, asRole, target], function (error) {
                                if (error) {
                                    response.status(500).json({ message: error.message });
                                } else {
                                    if(asRole==='spouse'){
                                        const updateSql1 = `UPDATE fieldvalue SET value = ? WHERE personId = ? AND fieldDefinitionId = ?`;
                                        const deleteSql1 = `UPDATE fieldvalue SET value = NULL WHERE value IN (?,?) AND fieldDefinitionId = ? AND personId <> ?`;
                                        database.query(deleteSql1, [pId, target, 3,target], (err, results) => {
                                            if (err) {
                                                response.status(500).json({ message: error.message });
                                            }
                                            database.query(updateSql1, [target, pId, 3], (err, results) => {
                                                if (err) {
                                                    response.status(500).json({ message: error.message });
                                                }else{
                                                    response.status(200).json({ message: 'OK' });
                                                }
                                            });
                                        });  
                                    }else{
                                        response.status(200).json({ message: 'OK' });
                                    }
                                }
                            });
                        } else {
                            response.status(200).json({ message: 'OK' });
                        }
                    }
                });
            };
        }
    });
};

const getInfo = (request, response, next) => {
    const id = request.query.id;
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
                                // console.log(relatedId);
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
                                        // console.log(relatedPersons);
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
};

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
            // console.log(len);
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
};

const getDetailInfo = (request, response, next) => {
    const id = request.query.id;
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
                fd.id,
                fv.fieldDefinitionCode,
                fd.code,
                fd.name,
                fd.description,
                fd.type,
                fd.isMultivalue,
                fd.isForAllPeople,
                fv.value
            FROM fieldvalue fv
            JOIN fielddefinition fd ON fv.fieldDefinitionId = fd.id
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
                    // console.log("spouseId:",spouseId);
                    // console.log("fatherId:",fatherId);
                    // console.log("motherId:",motherId);
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
                    // console.log("childrenId:",childrenIds);
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
                    // console.log("sameFatherId:",sameFatherIds);
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
                    // console.log("sameMotherId:",sameMotherIds);
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

    const updateFieldValue = (entry, callback) => {
        const { value, fieldDefinitionId, personId, fieldDefinitionCode } = entry;
        let sql;

        if (fieldDefinitionId) {
            sql = `UPDATE fieldvalue SET value = ? WHERE personId = ? AND fieldDefinitionId = ?`;
            database.query(sql, [value, personId, fieldDefinitionId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                if (fieldDefinitionId == 1 || fieldDefinitionId == 2) {
                    updateSearchString(personId, callback);
                    if (fieldDefinitionId == 2) { // If fieldDefinitionId == 2 means it's gender
                        updateParentFields(personId, callback);
                    }
                } else if (fieldDefinitionId == 3) {
                    updateSpouseField(personId, value, callback);
                } else {
                    callback(null);
                }
            });
        } else if (fieldDefinitionCode) {
            sql = `UPDATE fieldvalue SET value = ? WHERE personId = ? AND fieldDefinitionCode = ?`;
            database.query(sql, [value, personId, fieldDefinitionCode], (err, results) => {
                if (err) {
                    return callback(err);
                }
                if (fieldDefinitionCode === 'callname' || fieldDefinitionCode === 'gender') {
                    updateSearchString(personId, callback);
                    if (fieldDefinitionCode === 'gender') {
                        updateParentFields(personId, callback);
                    }
                } else if (fieldDefinitionCode === 'spouse') {
                    updateSpouseField(personId, value, callback);
                } else {
                    callback(null);
                }
            });
        } else {
            callback(new Error('No valid fieldDefinitionId or fieldDefinitionCode provided'));
        }
    };

    const updateSearchString = (personId, callback) => {
        const sql = `SELECT value, fieldDefinitionCode FROM fieldvalue WHERE personId = ? AND fieldDefinitionCode IN ('callname', 'gender')`;
        database.query(sql, [personId], (err, results) => {
            if (err) {
                return callback(err);
            }
            let callname = '';
            let gender = '';
            results.forEach(row => {
                if (row.fieldDefinitionCode === 'callname') {
                    callname = row.value;
                } else if (row.fieldDefinitionCode === 'gender') {
                    gender = row.value;
                }
            });
            const searchString = callname+" " + gender;
            const updateSql = `UPDATE person SET searchString = ? WHERE id = ?`;
            database.query(updateSql, [searchString, personId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    };

    const updateParentFields = (personId, callback) => {
        const parentFieldDefQuery = `SELECT id, code FROM fielddefinition WHERE code IN ('father', 'mother')`;
        database.query(parentFieldDefQuery, (err, results) => {
            if (err) {
                return callback(err);
            }
            const fatherFieldDefId = results.find(row => row.code === 'father').id;
            const motherFieldDefId = results.find(row => row.code === 'mother').id;

            const updateChildrenQuery = `UPDATE fieldvalue SET value = '' WHERE fieldDefinitionId IN (?, ?) AND value = ?`;
            database.query(updateChildrenQuery, [fatherFieldDefId, motherFieldDefId, personId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    };

    const updateSpouseField = (personId, spouseId, callback) => {
        if (!spouseId) {
            return callback(null);
        }

        // Update the spouse's spouse field to point back to the original person
        const sql = `SELECT id FROM fielddefinition WHERE code = 'spouse'`;
        database.query(sql, (err, results) => {
            if (err) {
                return callback(err);
            }
            const spouseFieldDefId = results[0].id;
            const updateSql = `UPDATE fieldvalue SET value = ? WHERE personId = ? AND fieldDefinitionId = ?`;
            const deleteSql = `UPDATE fieldvalue SET value = NULL WHERE value IN (?,?) AND fieldDefinitionId = ? AND personId <> ?`;
            // First, update the spouse's spouse field
            database.query(deleteSql, [personId,spouseId, spouseFieldDefId,spouseId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                database.query(updateSql, [personId, spouseId, spouseFieldDefId], (err, results) => {
                    if (err) {
                        return callback(err);
                    }
    
                    // Then update the original person's spouse field if needed (ensure bidirectional update)
                    const checkSql = `SELECT value FROM fieldvalue WHERE personId = ? AND fieldDefinitionId = ?`;
                    database.query(checkSql, [personId, spouseFieldDefId], (err, results) => {
                        if (err) {
                            return callback(err);
                        }
                        if (results.length > 0 && results[0].value != spouseId) {
                            database.query(updateSql, [spouseId, personId, spouseFieldDefId], callback);
                        } else {
                            callback(null);
                        }
                    });
                });
            });
        });
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
            response.status(500).json({ message: err.message });
        } else {
            response.status(200).json({ message: 'OK' });
        }
    });
};

const addField = (request, response, next)=>{
    const { name, description, type, isMultiValue, isForAllPeople, personId } = request.body.data;

    if ( typeof name === 'undefined' || typeof description === 'undefined' || typeof type === 'undefined' 
            || typeof isMultiValue === 'undefined' || typeof isForAllPeople === 'undefined') {
        return response.status(400).json({ message: 'Invalid input data' });
    }
    const sessionId = request.cookies.sessionId;
    const userId = sessions[sessionId].userId;
    var isFAPOUI;
    if(isForAllPeople){
        isFAPOUI=userId;
    }else{
        isFAPOUI=0;
    }
    // Thêm trường thông tin vào bảng FieldDefinition
    const sqlInsertFieldDefinition = `
        INSERT INTO fielddefinition (code, name, description, type, isMultivalue, isForAllPeople, isForAllPeopleOfUserId)
        VALUES (NULL, ?, ?, ?, ?, ?, ?)
    `;

    database.query(sqlInsertFieldDefinition, [name, description, type, isMultiValue, isForAllPeople, isFAPOUI], (err, results) => {
        if (err) {
            response.status(500).json({ message: err.message });
        }

        const fieldDefinitionId = results.insertId;

        if (isForAllPeople) {
            // Tạo các bản ghi FieldValue cho tất cả người thân của người dùng
            const sqlSelectPersons = `SELECT id FROM person WHERE ownerUserId = ${userId}`;
            database.query(sqlSelectPersons, (err, persons) => {
                if (err) {
                    response.status(500).json({ message: err.message });
                }

                const sqlInsertFieldValue = `
                    INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode, value)
                    VALUES (?, ?, NULL, NULL)
                `;

                persons.forEach(person => {
                    database.query(sqlInsertFieldValue, [person.id, fieldDefinitionId], (err) => {
                        if (err) {
                            response.status(500).json({ message: error.message });
                        }
                    });
                });
                const sqlreturn = `SELECT * FROM fielddefinition WHERE id = ${fieldDefinitionId}`;
                database.query(sqlreturn, (err, results) => {
                    if (err) {
                        response.status(500).json({ message: err.message });
                    }else{
                        response.status(200).json({newFieldDef:results[0]});
                    }
                });
            });
        } else {
            if (!personId) {
                response.status(400).json({ message: 'personId is required when isForAllPeople is false' });
            }

            const sqlInsertFieldValue = `
                INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode, value)
                VALUES (?, ?, NULL, NULL)
            `;

            database.query(sqlInsertFieldValue, [personId, fieldDefinitionId], (err) => {
                if (err) {
                    response.status(500).json({ message: err.message });
                }else{
                    const sqlreturn = `SELECT * FROM fielddefinition WHERE id = ${fieldDefinitionId}`;
                    database.query(sqlreturn, (err, results) => {
                        if (err) {
                            response.status(500).json({ message: err.message });
                        }else{
                            response.status(200).json({newFieldDef:results[0]});
                        }
                    });
                }
            });
        }
    });
};

const updateField = (request, response, next)=>{
    const { id, name, description } = request.body.data;
    if (typeof id === 'undefined' || typeof name === 'undefined' || typeof description === 'undefined') {
        response.status(400).json({ message: 'Missing required fields' });
    }

    const query = `
        UPDATE fielddefinition
        SET name = ?, description = ?
        WHERE id = ?
    `;
    database.query(query, [name, description, id], (error, results) => {
        if (error) {
            response.status(500).json({ message: error.message })
        }

        if (results.affectedRows === 0) {
            response.status(404).json({ message: 'Field definition not found' });
        }

        response.status(200).json({ message: 'OK' });
    });
};

const deleteField = (request, response, next)=>{
    const id = request.body.id;
    if (!id ) {
        response.status(400).json({ message: 'Missing required fields' });
    }

    const query1 = `DELETE FROM fieldvalue WHERE fieldDefinitionId = ?`;
    database.query(query1, [id], (error, results) => {
        if (error) {
            response.status(500).json({ message: error.message })
        }else{
            const query2 = `DELETE FROM fielddefinition WHERE id = ?`;
            database.query(query2, [id], (error, results) => {
                if (error) {
                    response.status(500).json({ message: error.message })
                }else{
                    response.status(200).json({ message: 'OK' });
                }
            });
        }
    });
};

function getPersonBaseInfo(id) {
    return new Promise((resolve, reject) => {
        const query1 = `SELECT * FROM person WHERE id = ${id}`;
        database.query(query1, function (error, result) {
            if (error) {
                reject(error.message)
            } else {
                const person = result[0];
                const query2 = `SELECT fieldDefinitionCode,value FROM fieldvalue 
                        WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?, ?, ?)`;
                database.query(query2, [id, 'avatar', 'birthday', 'callname', 'deathday', 'gender'], function (error, result) {
                    if (error) {
                        reject(error.message)
                    } else {
                        const fields = result.reduce((acc, field) => {
                            acc[field.fieldDefinitionCode] = field.value;
                            return acc;
                        }, {});
                        const query3 = `SELECT fieldDefinitionCode, value FROM fieldvalue 
                                WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?)`;
                        database.query(query3, [id, 'spouse', 'father', 'mother'], function (error, result) {
                            if (error) {
                                reject(error.message)
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
                                            reject(error.message)
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
                                            resolve(ans)
                                        }
                                    });

                                }
                            }
                        });
                    }
                });
            }
        })
    })
};

const drawFTree = async (request, response, next)=>{
    let {targetPersonId, level} = request.body;
    if (!level) {
        response.status(400).json({ message: 'Missing required fields' });
        return
    }
    try {
        const sessionId = request.cookies.sessionId;
        const userId = sessions[sessionId].userId;

        if (!targetPersonId) {
            targetPersonId = (await executeQuery(`select id from person where ownerUserId = ${userId} and isStandForUser = 1`))[0].id
        }

        const query = `
            SELECT id FROM person
            WHERE ownerUserId = "${userId}"
        `;

        let ids = (await executeQuery(query)).map(r => r.id)
        let people = await Promise.all(ids.map(id => getPersonBaseInfo(id)))

        let idToPer = {}
        let childrenOf = {}
        people.forEach(person => {
            idToPer[person.id] = person
            childrenOf[person.id] = []
        })
        people.forEach(person => {
            if (person.mother) {
                childrenOf[person.mother.id].push(person.id)
            }
            if (person.father) {
                childrenOf[person.father.id].push(person.id)
            }

            
            if (person.spouse) {
                let spouse = idToPer[person.spouse.id]
                person.spouse = {
                    id: spouse.id, callname: spouse.callname, father: spouse.father, mother: spouse.mother, spouse: spouse.spouse,
                    gender: spouse.gender, birthday: spouse.birthday, deathday: spouse.deathday, avatar: spouse.avatar
                }
            }
            person.children = []
        })
        
        let existedId = new Set()
        function addPerson(person, parent = null) {
            if (existedId.has(person.id)) return false
            existedId.add(person.id)

            if (parent) {
                let partner = parent.gender == 'Nam' ? (person.mother?.id && idToPer[person.mother.id]) : (person.father?.id && idToPer[person.father.id])
                parent.children.push({
                    child: person,
                    partner: partner ? {
                        id: partner.id, callname: partner.callname, father: partner.father, mother: partner.mother, spouse: partner.spouse,
                        gender: partner.gender, birthday: partner.birthday, deathday: partner.deathday, avatar: partner.avatar
                    } : null
                })
            }
            return true
        }

        let ancestor = idToPer[targetPersonId]
        let csdAncentIds = new Set([ancestor.id])
        let fmIdsGetChr = new Set()
        while (true) {
            if (ancestor.father && (!csdAncentIds.has(ancestor.father.id))) {
                ancestor = idToPer[ancestor.father.id]
            } else if (level > 2 && ancestor.mother && (!csdAncentIds.has(ancestor.mother.id))) {
                ancestor = idToPer[ancestor.mother.id]
                fmIdsGetChr.add(ancestor.id)
            } else {
                break
            }
            csdAncentIds.add(ancestor.id)
        }
        addPerson(ancestor)

        let result = {targetPersonId, ancestor}

        let list = [ancestor]
        while (list.length != 0) {
            let person = list.pop()
            
            if (person.gender == 'Nam' || level > 2) {
                if (childrenOf[person.id]) {
                    childrenOf[person.id].map(childId => idToPer[childId]).forEach(child => {
                        if (addPerson(child, person)) {
                            list.push(child)
                        }
                    })
                }
            }
        }

        response.status(200).json(result)
    }
    catch (err) {
        console.log(err)
        response.status(500).json({ message: 'Lỗi server!' })
    }
};

const getBaseInfPPUcomingEvts = async (request, response, next) => {
    try {
        const sessionId = request.cookies.sessionId;
        const userId = sessions[sessionId].userId;
        let {type, numGenerationsAbove, numGenerationsBelow, includeEqualGeneration, specificPersonIds} = (await executeQuery('select * from upcomingeventtargetinfo where userId = ?', [userId]))[0]
        
        let peronIds
        let personInfos
        type = Number(type);
        if (type == 0) {
            const query = `
                SELECT id FROM person
                WHERE ownerUserId = "${userId}"
            `;

            peronIds = (await executeQuery(query)).map(r => r.id)
        } else if (type == 1) {
            peronIds = (specificPersonIds && specificPersonIds != '') ? specificPersonIds.split('###') : []
        } else {
            const query = `
                SELECT id FROM person
                WHERE ownerUserId = "${userId}"
            `;

            peronIds = (await executeQuery(query)).map(r => r.id)
            let peopleBaseInf = await Promise.all(peronIds.map(id => getPersonBaseInfo(id)))
            let idPStandForUser = null
            let mIdToBsInf = {}
            let mIdToSId = {}, idToFId = {}, idToMId = {}, idToCId = {}
            peopleBaseInf.forEach(({id}) => idToCId[id] = [])
            peopleBaseInf.forEach(person => {
                let {id, mother, father, spouse, isStandForUser} = person
                mIdToBsInf[id] = person
                mIdToSId[id] = spouse?.id
                idToFId[id] = father?.id
                idToMId[id] = mother?.id
                if (mother) idToCId[mother.id].push(id)
                if (father) idToCId[father.id].push(id)
                if (isStandForUser) idPStandForUser = id
            })

            let isMale = id => mIdToBsInf[id].gender == 'Nam'
            peronIds = []

            
            
            let visited = new Set()
            function travelsal(id, n, goUp) {
                if (n < -numGenerationsAbove || n > numGenerationsBelow || (n == 0 && !includeEqualGeneration)) {
                    return
                }
                if (!id || visited.has(id)) {
                    return
                }
                visited.add(id)
                peronIds.push(id)

                if (isMale(id)) {
                    idToCId[id].forEach(cid => travelsal(cid, n + 1, false))
                    travelsal(mIdToSId[id], n, false)
                    if (goUp) {
                        travelsal(idToFId[id], n - 1, true)
                    }
                } else {
                    if (type == 3) {
                        idToCId[id].forEach(cid => travelsal(cid, n + 1, false))
                        travelsal(mIdToSId[id], n, false)
                    }
                    if (goUp) {
                        travelsal(idToFId[id], n - 1, true)
                    }
                }
            }
            travelsal(idPStandForUser, 0, true)

            personInfos = peronIds.map(id => mIdToBsInf[id])
        }

        if (!personInfos) {
            let peopleBaseInf = await Promise.all(peronIds.map(id => getPersonBaseInfo(id)))
            let mIdToBsInf = {}
            peopleBaseInf.forEach(person => mIdToBsInf[person.id] = person)
            personInfos = peronIds.map(id => mIdToBsInf[id])
        }
        
        return response.status(200).json(personInfos)
    }
    catch (err) {
        console.log(err)
        response.status(500).json({ message: 'Lỗi server!' })
    }
};

const getUpcomingEvents = async (request, response, next)=>{
    const getUpcomingEvents = async (userId) => {
        try {
          // Query để lấy thông tin các sự kiện sắp tới
          const upcomingEventsResult = await executeQuery(
            `SELECT * FROM upcomingeventtargetinfo WHERE userId = ${userId}`
          );
      
          return upcomingEventsResult;
        } catch (error) {
          console.error("Error fetching upcoming events:", error);
          throw error;
        }
    };
    const sessionId = request.cookies.sessionId;
    // const userId=1;
    const userId = sessions[sessionId].userId;
    const upcomingEvents = await getUpcomingEvents(userId);
    if (!userId) {
        return res.status(400).json({ message: 'Invalid session' });
    }
    response.status(200).json(upcomingEvents[0]);
};

const updateUpcomingEvent = (request, response, next)=>{
    const sessionId = request.cookies.sessionId;
    const userId = sessions[sessionId].userId;
    if (!userId) {
        return res.status(400).json({ message: 'Invalid session' });
    }
    console.log(request.body.upcomingEventTargetInfo);
    const { type, numGenerationsAbove, numGenerationsBelow, 
        includeEqualGeneration, specificPersonIds } = request.body.upcomingEventTargetInfo;
    const query = `UPDATE upcomingeventtargetinfo
    SET type = ?, numGenerationsAbove = ?, numGenerationsBelow = ?
    , includeEqualGeneration = ?, specificPersonIds = ?
    WHERE userId = ?`
    database.query(query, [type, numGenerationsAbove, numGenerationsBelow, 
    includeEqualGeneration, specificPersonIds, userId], (error,result)=>{
        if(error){
            console.log(error);
            response.status(500).json({ message: error.message });
        }else{
            response.status(200).json({ message: 'OK' });
        }
    });
};

const getBackup = async (request, response, next)=>{
    try {
        const sessionId = request.cookies.sessionId;
        const userId = sessions[sessionId].userId;
        //const userId=1;
        const data = await backupFamilyDataToCSV(userId);

        // response.download(filePath, (err) => {
        //     if (err) {
        //         console.error(err);
        //         response.status(500).send('File download error');
        //     } else {
        //         fs.unlinkSync(filePath);
        //     }
        // });
        response.status(200).json({data:data});
    } catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
};

const postRestore = async (request, response, next)=>{
    try {
        const sessionId = request.cookies.sessionId;
        const newUserId = sessions[sessionId].userId;
        const data = request.body.data;
        console.log(data);
        await restoreFamilyDataFromCSV(data, newUserId);
        response.status(200).json({ message: 'OK' });
    } catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
};

const deleteRelative = (request, response, next)=>{
    const id = request.body.id;
    if (!id ) {
        response.status(400).json({ message: 'Missing required fields' });
    }
    const deletePersonQuery = `DELETE FROM person WHERE id = ?`;
    const deleteFieldValuesQuery = `DELETE FROM fieldvalue WHERE personId = ?`;
    database.query(deletePersonQuery, [id], function (error, result) {
        if (error) {
            response.status(500).json({ message: error.message });
        } else {
            database.query(deleteFieldValuesQuery, [id], function (error, result) {
                if (error) {
                    response.status(500).json({ message: error.message });
                } else {
                    const updateFieldValueQuery = `SELECT * FROM fielddefinition WHERE type = 'PERSON'`
                    database.query(updateFieldValueQuery, [id], function (error, result) {
                        if (error) {
                            response.status(500).json({ message: error.message });
                        } else {
                            let dem=0;
                            result.forEach(data => {
                                const updateFieldValues = `UPDATE fieldvalue SET value = NULL WHERE value = ? AND fieldDefinitionId = ?`;
                                database.query(updateFieldValues, [id, data.id], function (error, result1) {
                                    if (error) {
                                        response.status(500).json({ message: error.message });
                                    } else {
                                        dem++
                                        if (dem == result.length) {
                                            response.status(200).json({ message: 'OK' });
                                        }
                                    }
                                });
                            })
                        }
                    });
                }
            });
        }
    });
};

const getStatistic = async (request, response, next)=>{
    try {
        const sessionId = request.cookies.sessionId;
        const userId = sessions[sessionId].userId;
        //const userId=1;
        const allPeople = await getAllBaseInfo(userId);
        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('/');
            return new Date(year, month - 1, day);
        };
        let numMales = 0;
        let numFemales = 0;
        let ages = [];
        const currentDate = new Date();

        allPeople.forEach(entry => {
            const person = entry.fields;
            if (person.gender === 'Nam') {
                numMales++;
            } else if (person.gender === 'Nữ') {
                numFemales++;
            }

            // Calculate age
            const birthday = parseDate(person.birthday);
            const deathday = person.deathday ? parseDate(person.deathday) : currentDate;
            const age = deathday.getFullYear() - birthday.getFullYear();
            const monthDiff = deathday.getMonth() - birthday.getMonth();
            const dayDiff = deathday.getDate() - birthday.getDate();
            console.log(birthday,deathday);
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                ages.push(age - 1);
            } else {
                ages.push(age);
            }
        });
        response.status(200).json({
            numMales: numMales,
            numFemales: numFemales,
            ages: ages
        });
    } catch (error) {
        console.error('Error in getStatistic:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
}

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
    updateField,
    deleteField,
    drawFTree,
    getBaseInfPPUcomingEvts,
    getUpcomingEvents,
    updateUpcomingEvent,
    deleteRelative,
    getStatistic,
    getBackup,
    postRestore,
};
