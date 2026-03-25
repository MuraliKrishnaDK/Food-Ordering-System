-- PostgreSQL DDL for xwiggy food ordering system

DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS food;
DROP TABLE IF EXISTS app_user;

CREATE TABLE app_user (
    username  VARCHAR(45)  NOT NULL,
    password  VARCHAR(45)  NOT NULL,
    firstname VARCHAR(45)  NOT NULL,
    lastname  VARCHAR(45),
    email     VARCHAR(45),
    address   VARCHAR(45)  NOT NULL,
    phone     BIGINT       NOT NULL,
    merchant  BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (username)
);

CREATE TABLE food (
    id       VARCHAR(45)  NOT NULL,
    item     VARCHAR(45)  NOT NULL,
    price    INTEGER      NOT NULL,
    quantity INTEGER,
    url      VARCHAR(120),
    formid   VARCHAR(50)  NOT NULL,
    cartid   VARCHAR(45)  NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE cart (
    quantity1 INTEGER NOT NULL,
    quantity2 INTEGER NOT NULL,
    quantity3 INTEGER NOT NULL,
    quantity4 INTEGER NOT NULL,
    quantity5 INTEGER NOT NULL,
    quantity6 INTEGER NOT NULL,
    PRIMARY KEY (quantity1)
);

CREATE TABLE contact (
    id      SERIAL       PRIMARY KEY,
    name    VARCHAR(100),
    email   VARCHAR(100),
    message TEXT
);
