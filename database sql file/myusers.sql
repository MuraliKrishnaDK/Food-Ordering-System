-- PostgreSQL dump for xwiggy food ordering system
-- Database: myusers

DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS food;
DROP TABLE IF EXISTS app_user;

-- Users table (renamed from 'user' to avoid PostgreSQL reserved keyword)
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

INSERT INTO app_user (username, password, firstname, lastname, email, address, phone, merchant) VALUES
('merchant', 'merchant', 'Merchant', 'Merchant', 'merchant@merchant.com', 'Merchant LTD', 1234567890, TRUE),
('user',     'user',     'Aman',     'Kumar',    'aman@gmail.com',        'Bangalore, India', 9585418, FALSE);

-- Food items table
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

INSERT INTO food (id, item, price, quantity, url, formid, cartid) VALUES
('abc', 'Coffee', 50, 20, 'https://images.pexels.com/photos/414720/pexels-photo-414720.jpeg',                                                              'modalCart.quantity1', 'quantity1'),
('bcd', 'Cookie', 20, 16, 'https://images-gmi-pmc.edge-generalmills.com/087d17eb-500e-4b26-abd1-4f9ffa96a2c6.jpg',                                         'modalCart.quantity2', 'quantity2'),
('def', 'Cake',   80, 18, 'https://livforcake.com/wp-content/uploads/2017/07/black-forest-cake-thumb-500x500.jpg',                                         'modalCart.quantity3', 'quantity3'),
('dos', 'Dosa',  100, 12, 'https://www.madhuseverydayindian.com/wp-content/uploads/2020/07/instant-wheat-flour-dosa-500x500.jpg',                          '', ''),
('idl', 'Idli',   30, 52, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUH0Y7rPn4A4J9Cv4roiAZn5eaNLbCr-7X7T_KXltM5g&s',                        '', '');

-- Cart table
CREATE TABLE cart (
    quantity1 INTEGER NOT NULL,
    quantity2 INTEGER NOT NULL,
    quantity3 INTEGER NOT NULL,
    quantity4 INTEGER NOT NULL,
    quantity5 INTEGER NOT NULL,
    quantity6 INTEGER NOT NULL,
    PRIMARY KEY (quantity1)
);

INSERT INTO cart (quantity1, quantity2, quantity3, quantity4, quantity5, quantity6) VALUES
(0, 0, 0, 0, 0, 0),
(2, 0, 0, 0, 0, 0);

-- Contact messages table
CREATE TABLE contact (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100),
    email   VARCHAR(100),
    message TEXT
);
