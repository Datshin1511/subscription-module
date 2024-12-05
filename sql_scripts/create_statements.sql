USE transform_db;

CREATE TABLE CUSTOMER (
    CustomerID VARCHAR(10) PRIMARY KEY, 
    Name VARCHAR(100) NOT NULL,
    PAN VARCHAR(10),
    
    CONSTRAINT chk_CustomerID CHECK (CustomerID REGEXP '^CN[0-9]{8}$'),
    CONSTRAINT chk_PAN CHECK (PAN REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]$')
);

CREATE TABLE PRODUCT (
    ProductName VARCHAR(50) PRIMARY KEY,
    Description VARCHAR(255),
    AnnualSubscriptionCost FLOAT NOT NULL CHECK (AnnualSubscriptionCost > 0)
);

CREATE TABLE SUBSCRIPTION (
    SubscriptionID INT AUTO_INCREMENT PRIMARY KEY, 
    CustomerID VARCHAR(50),
    ProductName VARCHAR(50),
    SubscriptionStartDate DATE NOT NULL,
    SubscriptionEndDate DATE NOT NULL,
    NumberOfUsers INT NOT NULL CHECK (NumberOfUsers > 0),
    
    FOREIGN KEY (CustomerID) REFERENCES CUSTOMER(CustomerID),
    FOREIGN KEY (ProductName) REFERENCES PRODUCT(ProductName),
    
    CONSTRAINT chk_subs_CustomerID CHECK (CustomerID REGEXP '^CN[0-9]{8}$')
);
