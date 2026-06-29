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

CREATE TABLE IF NOT EXISTS promo_code (
    code             VARCHAR(30)    PRIMARY KEY,
    discount_percent INTEGER        NOT NULL DEFAULT 0,
    discount_flat    NUMERIC(8,2)   NOT NULL DEFAULT 0,
    min_order_amount NUMERIC(8,2)   NOT NULL DEFAULT 0,
    active           BOOLEAN        NOT NULL DEFAULT TRUE,
    expires_on       DATE
);

CREATE TABLE IF NOT EXISTS item_stock (
    item_name VARCHAR(200) PRIMARY KEY,
    in_stock  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
    id         BIGSERIAL    PRIMARY KEY,
    username   VARCHAR(45)  NOT NULL,
    items      TEXT         NOT NULL,
    total      NUMERIC(10,2) NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'PLACED',
    delivery_code VARCHAR(4),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Run on existing databases if column is missing:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_code VARCHAR(4);

CREATE TABLE IF NOT EXISTS password_reset_token (
    id         BIGSERIAL    PRIMARY KEY,
    token      VARCHAR(10)  NOT NULL UNIQUE,
    email      VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP    NOT NULL
);
