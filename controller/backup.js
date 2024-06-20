// backup.js
const database = require('../config/database');

async function executeQuery(query, params) {
    return new Promise((resolve, reject) => {
        database.query(query, params, (error, results) => {
            if (error) {
                reject(error); // Trả về lỗi nếu có lỗi xảy ra
            } else {
                resolve(results); // Trả về kết quả nếu không có lỗi
            }
        });
    });
}

async function getAllBaseInfo(uId) {
    return new Promise((resolve, reject) => {
        if (!uId) {
            reject({ message: 'UNAUTHORIZED' });
        }
        const query = `
            SELECT id FROM person
            WHERE ownerUserId = "${uId}"
        `;
        database.query(query, function (error, result) {
            if (error) {
                reject({ message: error.message });
            } else {
                const info = [];
                const len = result.length;
                let count = 0;
                for (const pid of result) {
                    const id = pid.id;
                    const query1 = `SELECT * FROM person WHERE id = ${id}`;
                    database.query(query1, function (error, result) {
                        if (error) {
                            reject({ message: error.message });
                        } else {
                            const person = result[0];
                            const query2 = `SELECT fieldDefinitionCode,value FROM fieldvalue 
                                    WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?, ?, ?)`;
                            database.query(query2, [id, 'avatar', 'birthday', 'callname', 'deathday', 'gender'], function (error, result) {
                                if (error) {
                                    reject({ message: error.message });
                                } else {
                                    const fields = result.reduce((acc, field) => {
                                        acc[field.fieldDefinitionCode] = field.value;
                                        return acc;
                                    }, {});
                                    const query3 = `SELECT fieldDefinitionCode, value FROM fieldvalue 
                                            WHERE personId = ? AND fieldDefinitionCode IN (?, ?, ?)`;
                                    database.query(query3, [id, 'spouse', 'father', 'mother'], function (error, result) {
                                        if (error) {
                                            reject({ message: error.message });
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
                                                        reject({ message: error.message });
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
                                                            person: person,
                                                            fields: fields,
                                                            relatedPersons: relatedPersons
                                                        };
                                                        info.push(ans);
                                                        count++;
                                                        if (count === len) {
                                                            resolve(info);
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
    });
}

async function insertPerson(person) {
    const { ownerUserId, searchString, isStandForUser } = person;
    const result = await executeQuery(
        `INSERT INTO person (ownerUserId, searchString, isStandForUser) VALUES (?, ?, ?)`,
        [ownerUserId, searchString, isStandForUser]
    );
    return result.insertId;
}

async function insertFieldValue(personId, fieldDefinitionId, fieldDefinitionCode, value ) {
    try {
        // Check if the entry already exists
        const existingEntries = await executeQuery(
            'SELECT * FROM fieldvalue WHERE personId = ? AND fieldDefinitionId = ? AND fieldDefinitionCode = ?',
            [personId, fieldDefinitionId, fieldDefinitionCode]
        );

        if (existingEntries.length > 0) {
            // Update the existing entry if it exists
            await executeQuery(
                'UPDATE fieldvalue SET value = ? WHERE personId = ? AND fieldDefinitionId = ? AND fieldDefinitionCode = ?',
                [value, personId, fieldDefinitionId, fieldDefinitionCode]
            );
            // console.log('Entry updated successfully');
        } else {
            // Insert a new entry if it does not exist
            await executeQuery(
                'INSERT INTO fieldvalue (personId, fieldDefinitionId, fieldDefinitionCode, value) VALUES (?, ?, ?, ?)',
                [personId, fieldDefinitionId, fieldDefinitionCode, value]
            );
            console.log('Entry inserted successfully');
        }
    } catch (error) {
        console.error('Error inserting/updating entry:', error);
    }
}

async function personExists(ownerUserId, searchString) {
    const rows = await executeQuery(
        `SELECT * FROM person WHERE ownerUserId = ? AND searchString = ?`,
        [ownerUserId, searchString]
    );
    return rows.length > 0 ? rows[0].id : null;
}

async function backupFamilyDataToCSV(userId) {
    try {
        const familyData = await getAllBaseInfo(userId);
        return JSON.stringify(familyData);
    } catch (error) {
        throw error;
    }
}

async function restoreFamilyDataFromCSV(data, newUserId) {
    const familyData = JSON.parse(data);
    for (const entry of familyData) {
        const person = entry.person;
        const fields = entry.fields;
        const relatedPersons = entry.relatedPersons;
        const searchString = fields.callname + " " + fields.gender;
        console.log(person,fields,relatedPersons);
        let personId = await personExists(newUserId, searchString);
        console.log("PersonID : ", personId);
        if (personId) {
            const deletePersonQuery = `DELETE FROM person WHERE id = ?`;
            const deleteFieldValuesQuery = `DELETE FROM fieldvalue WHERE personId = ?`;
            const updateFieldValueQuery = `UPDATE fieldvalue SET value = NULL WHERE value = ? AND (fieldDefinitionCode = 'spouse' OR fieldDefinitionCode = 'father' OR fieldDefinitionCode = 'mother')`;
        
            database.query(deletePersonQuery, [personId], function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    database.query(deleteFieldValuesQuery, [personId], function (error, result) {
                        if (error) {
                            console.log(error);
                        } else {
                            database.query(updateFieldValueQuery, [personId], function (error, result) {
                                if (error) {
                                    console.log(error);
                                }
                            });
                        }
                    });
                }
            });
        }
        let isStandForUser = null;
        if(person.isStandForUser == 1){
            isStandForUser = 1;
        }
        personId = await insertPerson({
            ownerUserId: newUserId,
            searchString: searchString,
            isStandForUser: isStandForUser
        });
        await insertFieldValue(personId, 1, "callname", fields.callname);
        await insertFieldValue(personId, 2, "gender", fields.gender);
        if (relatedPersons.spouse) {
            await insertFieldValue(personId, 3, "spouse", relatedPersons.spouse.id);
        }else{
            await insertFieldValue(personId, 3, "spouse", '');
        }
        if (relatedPersons.father) {
            await insertFieldValue(personId, 4, "father", relatedPersons.father.id);
        }else{
            await insertFieldValue(personId, 4, "father", '');
        }
        if (relatedPersons.mother) {
            await insertFieldValue(personId, 5, "mother", relatedPersons.mother.id);
        }else{
            await insertFieldValue(personId, 5, "mother", '');
        }
        if(fields.birthday==='null'){
            await insertFieldValue(personId, 6, "birthday", '');
        }else{
            await insertFieldValue(personId, 6, "birthday", fields.birthday);
        }
        if(fields.deathday==='null'){
            await insertFieldValue(personId, 7, "deathday", '');
        }else{
            await insertFieldValue(personId, 7, "deathday",fields.deathday);
        }
        if(fields.avatar==='null'){
            await insertFieldValue(personId, 8, "avatar", null);
        }else{
            await insertFieldValue(personId, 8, "avatar", fields.avatar);
        }
    }
    for (const entry of familyData) {
        const person = entry.person;
        const fields = entry.fields;
        const relatedPersons = entry.relatedPersons;
        const searchString = fields.callname + " " + fields.gender;
        let personId = await personExists(newUserId, searchString);
        if (relatedPersons.spouse) {
            const rows = await executeQuery(
                `SELECT p.*
                FROM person p
                JOIN fieldvalue fv ON p.id = fv.personId
                WHERE fv.fieldDefinitionId = ? AND fv.value = ? AND ownerUserId = ?`,
                [1,relatedPersons.spouse.callname,newUserId]
            );
            await insertFieldValue(personId, 3, "spouse", rows.length > 0 ? rows[0].id : null);
        }
        if (relatedPersons.father) {
            const rows = await executeQuery(
                `SELECT p.*
                FROM person p
                JOIN fieldvalue fv ON p.id = fv.personId
                WHERE fv.fieldDefinitionId = ? AND fv.value = ? AND ownerUserId = ?`,
                [1,relatedPersons.father.callname,newUserId]
            );
            await insertFieldValue(personId, 4, "father", rows.length > 0 ? rows[0].id : null);
        }
        if (relatedPersons.mother) {
            const rows = await executeQuery(
                `SELECT p.*
                FROM person p
                JOIN fieldvalue fv ON p.id = fv.personId
                WHERE fv.fieldDefinitionId = ? AND fv.value = ? AND ownerUserId = ?`,
                [1,relatedPersons.mother.callname,newUserId]
            );
            await insertFieldValue(personId, 5, "mother", rows.length > 0 ? rows[0].id : null);
        }
    }
    console.log('Backup file successfully processed');
}

module.exports = { backupFamilyDataToCSV, restoreFamilyDataFromCSV ,getAllBaseInfo};