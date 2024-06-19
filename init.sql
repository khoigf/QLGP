
CREATE DATABASE QLGP;

USE QLGP;

CREATE TABLE account (
    userId int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username varchar(12) NOT NULL,
    password varchar(12) NOT NULL
);

CREATE TABLE person (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    ownerUserId int NOT NULL,
    searchString text,
    isStandForUser int,
    FOREIGN KEY (ownerUserId) REFERENCES account (userId)
);

CREATE TABLE fielddefinition (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    code varchar(30),
    name nvarchar(100) NOT NULL,
    description nvarchar(500),
    type varchar(20) NOT NULL,
    isMultivalue int NOT NULL,
    isForAllPeople int NOT NULL,
    isForAllPeopleOfUserId int
);

CREATE TABLE fieldvalue (
    personId int NOT NULL,
    fieldDefinitionId int NOT NULL,
    fieldDefinitionCode varchar(30),
    value mediumtext,
    FOREIGN KEY (personId) REFERENCES person (id),
    FOREIGN KEY (fieldDefinitionId) REFERENCES fielddefinition (id),
    PRIMARY KEY (personId, fieldDefinitionId)
);

CREATE TABLE upcomingeventtargetinfo (
    userId int NOT NULL PRIMARY KEY,
    type varchar(50) NOT NULL,
    numGenerationsAbove int,
    numGenerationsBelow int,
    includeEqualGeneration int,
    specificPersonIds text,
    FOREIGN KEY (userId) REFERENCES account (userId)
);

INSERT INTO fielddefinition (code, name, description, type, isMultivalue, isForAllPeople, isForAllPeopleOfUserId)
VALUES ('callname', N'Tên gọi', N'Đây là tên được hiển thị trong hầu hết tất cả các chức năng của trang web (vẽ biểu đồ gia phả, sự kiện sắp tới,...)', 'STRING', 0, 1, -1),
    ('gender', N'Giới tính', N'Giới tính', 'STRING', 0, 1, -1),
    ('spouse', N'Vợ/Chồng', N'Vợ hoặc là chồng, nói chung đây là ý chung nhân!', 'PERSON', 0, 1, -1),
    ('father', N'Bố', N'Bố ruột', 'PERSON', 0, 1, -1),
    ('mother', N'Mẹ', N'Mẹ ruột', 'PERSON', 0, 1, -1),
    ('birthday', N'Ngày sinh', N'Ngày sinh', 'DATE', 0, 1, -1),
    ('deathday', N'Ngày mất', N'Ngày mất', 'LUNAR_DATE', 0, 1, -1),
    ('avatar', N'Ảnh đại diện', N'Ảnh đại diện trực quan cho đối tượng trong hầu hết các chức năng của trang web', 'IMAGE', 0, 1, -1);

