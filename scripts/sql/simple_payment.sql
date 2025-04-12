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
    image_url TEXT,
    sku VARCHAR(20) UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(50),
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

INSERT INTO products (name, description, image_url, sku, price, stock, category) VALUES
    ('Chives', 'Aromatic plant from the lily family, used as a condiment in various dishes for its mild onion-like flavor', 'farming/cebollines-min.jpg', 'CB7845A2Z9', 5000.00, 50,'Farming'),
    ('Avocado', 'Creamy tropical fruit rich in healthy fats, vitamins, and minerals, ideal for salads and guacamole', 'farming/aguacate-min.jpg', 'AG3921F7X5', 3500.00, 100,'Farming'),
    ('Lemon', 'Acidic citrus used to season and flavor drinks and dishes, rich in vitamin C', 'farming/limon-min.jpg', 'LM6723K9P1', 1300.00, 30,'Farming'),
    ('Bananas', 'Energetic tropical fruit rich in potassium and fiber, grown in warm and humid climates', 'farming/bananos-min.jpg', 'BN4587D2J6', 1100.00, 120,'Farming'),
    ('Onion', 'Variety of onion with large bulb and intense flavor, essential in the base of many culinary preparations', 'farming/cabezona-min.jpg', 'CB5291H8M3', 1800.00, 80,'Farming'),
    ('Green Onion', 'Variety of long-stemmed onion used in soups, stews, and as a fresh condiment in traditional cooking', 'farming/cebolla-larga-min.jpg', 'CL9634R5T7', 1500.00, 70,'Farming'),
    ('Coriander', 'Aromatic herb with fresh leaves and distinctive flavor, widely used in Latin American cuisine', 'farming/cilantro-min.jpg', 'CI2378L4N9', 900.00, 60,'Farming'),
    ('Plums', 'Sweet and juicy fruit with antioxidant and digestive properties, available in various varieties', 'farming/ciruelas-min.jpg', 'CR8145V6B2', 2700.00, 45,'Farming'),
    ('Coffee', 'Bean cultivated in mountainous areas, processed and roasted for the preparation of the popular stimulating beverage', 'farming/cafe-min.jpg', 'CF7329Q1S8', 6700.00, 40,'Farming'),
    ('Corn', 'Basic cereal in Latin American diet, cultivated in various varieties for fresh and processed consumption', 'farming/maiz-min.jpg', 'MZ5812Y3C4', 1500.00, 90,'Farming'),
    ('Oranges', 'Sweet citrus fruit rich in vitamin C, grown in temperate and subtropical climates', 'farming/naranjas-min.jpg', 'NR6497G5W1', 2000.00, 75,'Farming'),
    ('Tomatoes', 'Versatile fruit rich in lycopene, used as a base in sauces, salads, and various dishes', 'farming/tomates-min.jpg', 'TM3256E8U7', 1700.00, 85,'Farming'),
    ('Cassava', 'Tropical tuber with high caloric content, a staple food in many regions due to its culinary versatility', 'farming/yuca-min.jpg', 'YC9183O4I2', 1400.00, 55,'Farming');

INSERT INTO payment_methods (user_id, type, details, is_default) VALUES
    (1, 'card', '{"type": "debit", "brand": "visa", "token": {"expiryYear": "26", "expiryMonth": "11", "cardholderName": "Yovany Suárez Silva"}, "lastFour": "5432", "cardNumber":"1234567898765432"}', TRUE),
    (1, 'card', '{"type": "credit", "brand": "mastercard", "token": {"expiryYear": "28", "expiryMonth": "01", "cardholderName": "Yovany Suárez Silva"}, "lastFour": "4444", "cardNumber":"1111222233334444"}', FALSE);

INSERT INTO transactions (user_id, payment_method_id, total_amount, status, gateway_reference, gateway_details) VALUES
    (1, 1, 100.00, 'completed', 'wompi_ref_123', '{"status": "approved", "payment_method": "card"}');

INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price) VALUES
    (1, 1, 2, 1200.00),
    (1, 2, 1, 800.00);

