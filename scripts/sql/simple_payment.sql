-- Entity-relationship model for a payment system with gateway integration
CREATE SCHEMA IF NOT EXISTS payment_system;
SET search_path TO payment_system;
-- Drop tables if they exist
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS inventory_history;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    fullname VARCHAR(50) NOT NULL,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    roles VARCHAR(50)[] DEFAULT ARRAY['customer']::VARCHAR[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table
CREATE TABLE payment_methods (
    payment_method_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    type VARCHAR(50) NOT NULL, -- 'card', 'transfer', etc.
    details JSONB, -- To store method-specific details
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    payment_method_id INT REFERENCES payment_methods(payment_method_id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    gateway_reference VARCHAR(100), -- Wompi reference ID
    gateway_details JSONB, -- Complete gateway response
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction items table
CREATE TABLE transaction_items (
    item_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(transaction_id),
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Inventory history table
CREATE TABLE inventory_history (
    record_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,  
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    movement_type VARCHAR(10) NOT NULL, -- 'in', 'out'
    transaction_id INT REFERENCES transactions(transaction_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE deliveries (
    delivery_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(transaction_id),
    delivery_address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'preparing', 'shipped', 'delivered'
    tracking_code VARCHAR(50),
    estimated_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory update triggers
CREATE OR REPLACE FUNCTION update_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock when transaction is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Reduce stock for each item
        UPDATE products p
        SET stock = p.stock - ti.quantity,
            updated_at = CURRENT_TIMESTAMP
        FROM transaction_items ti
        WHERE ti.transaction_id = NEW.transaction_id
        AND p.product_id = ti.product_id;
        
        -- Record movement in history
        INSERT INTO inventory_history (product_id, quantity, movement_type, transaction_id)
        SELECT ti.product_id, ti.quantity, 'out', NEW.transaction_id
        FROM transaction_items ti
        WHERE ti.transaction_id = NEW.transaction_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_inventory();

-- Performance indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);
CREATE INDEX idx_inventory_history_product ON inventory_history(product_id);

-- Sample data
INSERT INTO users (fullname, username, password, email, address, phone, roles) VALUES
    ('Yovany Suárez Silva','yosuarezs','$2b$10$/o3Yb4Q3Ag5RjCo78UoR6elVTh77WzhcAM7oY0Qeq6lgpQra/k1BW', 'yovanysuarezsilva@example.com', 'Calle Sinai, Timaná, Huila', '5551234567','{customer,admin}'),
    ('Selena Suárez Medina', 'sesuarezm','$2b$10$/o3Yb4Q3Ag5RjCo78UoR6elVTh77WzhcAM7oY0Qeq6lgpQra/k1BW', 'selenasuarezmedina@example.com', 'Avenida Santa Lucia, Timaná, Huila', '5557654321','{customer}');

INSERT INTO products (name, description, price, stock) VALUES
    ('Laptop', 'High-performance computer', 1200.00, 50),
    ('Cellphone', 'Latest generation smartphone', 800.00, 100),
    ('Tablet', 'Tablet for kids', 300.00, 30);

INSERT INTO payment_methods (user_id, type, details, is_default) VALUES
    (1, 'card', '{"type": "visa", "last4": "4242", "token": "tok_test_123"}', TRUE),
    (2, 'card', '{"type": "mastercard", "last4": "5555", "token": "tok_test_456"}', TRUE);