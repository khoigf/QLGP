// backup.js
const fs = require('fs');
const database = require('../config/database');
const csvParser = require('csv-parser');

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

async function getAllInfo(uId) {
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
        `INSERT INTO Person (ownerUserId, searchString, isStandForUser) VALUES (?, ?, ?)`,
        [ownerUserId, searchString, isStandForUser]
    );
    return result.insertId;
}

async function insertFieldValue(personId, fieldDefinitionId, fieldDefinitionCode, value ) {
    await executeQuery(
        `INSERT INTO FieldValue (personId, fieldDefinitionId, fieldDefinitionCode, value) VALUES (?, ?, ?, ?)`,
        [personId, fieldDefinitionId, fieldDefinitionCode, value]
    );
}

async function personExists(ownerUserId, searchString) {
    const rows = await executeQuery(
        `SELECT * FROM Person WHERE ownerUserId = ? AND searchString = ?`,
        [ownerUserId, searchString]
    );
    return rows.length > 0 ? rows[0].id : null;
}

async function backupFamilyDataToCSV(userId) {
    try {
        const familyData = await getAllInfo(userId);
        let csvData = 'PersonID,Callname,Avatar,Birthday,Deathday,Gender,isStandForUser,SpouseID,SpouseName,SpouseAvatar,FatherID,FatherName,FatherAvatar,MotherID,MotherName,MotherAvatar\n';
        familyData.forEach(entry => {
            const person = entry.person;
            const fields = entry.fields;
            const relatedPersons = entry.relatedPersons;
            csvData += `${person.id},"${fields.callname}","${fields.avatar}","${fields.birthday}","${fields.deathday}","${fields.gender}","${person.isStandForUser}",`;
            if (relatedPersons.spouse) {
                csvData += `${relatedPersons.spouse.id},"${relatedPersons.spouse.callname}","${relatedPersons.spouse.avatar}",`;
            } else {
                csvData += ',,,';
            }
            if (relatedPersons.father) {
                csvData += `${relatedPersons.father.id},"${relatedPersons.father.callname}","${relatedPersons.father.avatar}",`;
            } else {
                csvData += ',,,';
            }

            if (relatedPersons.mother) {
                csvData += `${relatedPersons.mother.id},"${relatedPersons.mother.callname}","${relatedPersons.mother.avatar}"\n`;
            } else {
                csvData += ',,\n';
            }
        });

        const filePath = `backup_family_${userId}.csv`;
        fs.writeFileSync(filePath, csvData);

        return filePath;
    } catch (error) {
        throw error;
    }
}

async function restoreFamilyDataFromCSV(filePath, newUserId) {
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            // Chuyển đổi dữ liệu từ cấu trúc CSV mới sang cấu trúc dữ liệu phù hợp
            const personId = parseInt(row.PersonID);
            const callname = row.Callname;
            const avatar = row.Avatar;
            const birthday = row.Birthday;
            const deathday = row.Deathday;
            const gender = row.Gender;
            const isStandForUser = row.isStandForUser;
            const spouseId = parseInt(row.SpouseID);
            const spouseName = row.SpouseName;
            const spouseAvatar = row.SpouseAvatar;
            const fatherId = parseInt(row.FatherID);
            const fatherName = row.FatherName;
            const fatherAvatar = row.FatherAvatar;
            const motherId = parseInt(row.MotherID);
            const motherName = row.MotherName;
            const motherAvatar = row.MotherAvatar;
            results.push({
                person: {
                    id: personId,
                    isStandForUser : isStandForUser
                },
                fields: {
                    avatar: avatar,
                    birthday: birthday,
                    callname: callname,
                    deathday: deathday,
                    gender: gender
                },
                relatedPersons: {
                    spouse: spouseId ,
                    father: fatherId ,
                    mother: motherId 
                }
            });
        })
        .on('end', async () => {
            for (const entry of results) {
                const person = entry.person;
                const fields = entry.fields;
                const relatedPersons = entry.relatedPersons;
                const searchString = fields.callname+" "+fields.gender;
                let personId = await personExists(newUserId, searchString);
                if (!personId) {
                    personId = await insertPerson({
                        ownerUserId: newUserId,
                        searchString: searchString,
                        isStandForUser: person.isStandForUser
                    });
                    await insertFieldValue(personId,1,"callname",fields.callname);
                    await insertFieldValue(personId,2,"gender",fields.gender);
                    await insertFieldValue(personId,3,"spouse",relatedPersons.spouse);
                    await insertFieldValue(personId,4,"father",relatedPersons.father);
                    await insertFieldValue(personId,5,"mother",relatedPersons.mother);
                    await insertFieldValue(personId,6,"birthday",fields.birthday);
                    await insertFieldValue(personId,7,"deathday",fields.deathday);
                    await insertFieldValue(personId,8,"avatar",fields.avatar);
                }

            }
            console.log('CSV file successfully processed');
        });
}

module.exports = { backupFamilyDataToCSV, restoreFamilyDataFromCSV };