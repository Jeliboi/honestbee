-- ============================================================
-- HONESTBEE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (optional, we'll use serial/integer PKs per ERD)

-- ============================================================
-- 1. CUSTOMER TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customer (
  customer_id   SERIAL PRIMARY KEY,
  customer_name  VARCHAR(50)  NOT NULL,
  customer_email VARCHAR(50)  NOT NULL UNIQUE,
  customer_phone VARCHAR(15)  NOT NULL,
  customer_password VARCHAR(50) NOT NULL,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_address VARCHAR(100) NOT NULL
);

-- ============================================================
-- 2. VENDOR TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor (
  vendor_id      SERIAL PRIMARY KEY,
  vendor_name    VARCHAR(50)  NOT NULL,
  vendor_type    VARCHAR(30)  NOT NULL,
  vendor_email   VARCHAR(50)  NOT NULL,
  vendor_phone   VARCHAR(15)  NOT NULL,
  vendor_address VARCHAR(100) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL CHECK (commission_rate >= 0)
);

-- ============================================================
-- 3. PRODUCT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product (
  product_id          SERIAL PRIMARY KEY,
  product_name        VARCHAR(50)   NOT NULL,
  product_description VARCHAR(100),
  product_price       DECIMAL(10,2) NOT NULL CHECK (product_price >= 0),
  stock_quantity      INTEGER       NOT NULL CHECK (stock_quantity >= 0),
  product_category    VARCHAR(30)   NOT NULL,
  vendor_id           INTEGER       NOT NULL REFERENCES vendor(vendor_id) ON DELETE CASCADE
);

-- ============================================================
-- 4. ORDER TABLE (named orders to avoid SQL reserved word)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id         SERIAL PRIMARY KEY,
  order_date       DATE          NOT NULL DEFAULT CURRENT_DATE,
  order_status     VARCHAR(20)   NOT NULL DEFAULT 'pending',
  total_amount     DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  customer_id      INTEGER       NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  vendor_id        INTEGER       NOT NULL REFERENCES vendor(vendor_id) ON DELETE CASCADE,
  delivery_address VARCHAR(100)  NOT NULL
);

-- ============================================================
-- 5. ORDER_ITEM TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_item (
  orderitem_id SERIAL PRIMARY KEY,
  order_id     INTEGER       NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id   INTEGER       NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  quantity     INTEGER       NOT NULL CHECK (quantity >= 1),
  unit_price   DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal     DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- ============================================================
-- 6. PAYMENT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payment (
  payment_id     SERIAL PRIMARY KEY,
  order_id       INTEGER       NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  payment_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(20)   NOT NULL,
  payment_status VARCHAR(20)   NOT NULL DEFAULT 'pending',
  amount_paid    DECIMAL(10,2) NOT NULL CHECK (amount_paid >= 0)
);

-- ============================================================
-- 7. SHOPPER TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS shopper (
  shopper_id        SERIAL PRIMARY KEY,
  shopper_name      VARCHAR(50) NOT NULL,
  shopper_phone     VARCHAR(15) NOT NULL,
  employment_status VARCHAR(20) NOT NULL DEFAULT 'active',
  hire_date         DATE        NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================
-- 8. DELIVERY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery (
  delivery_id     SERIAL PRIMARY KEY,
  order_id        INTEGER     NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  shopper_id      INTEGER     NOT NULL REFERENCES shopper(shopper_id) ON DELETE CASCADE,
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  delivery_date   DATE        NOT NULL,
  delivery_time   TIME        NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Enable for all tables
-- ============================================================
ALTER TABLE customer   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopper    ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery   ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (for demo/development)
-- In production, replace these with proper auth-based policies
CREATE POLICY "allow_all_customer"   ON customer   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_vendor"     ON vendor     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_product"    ON product    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_orders"     ON orders     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_order_item" ON order_item FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payment"    ON payment    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_shopper"    ON shopper    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delivery"   ON delivery   FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Vendors
INSERT INTO vendor (vendor_name, vendor_type, vendor_email, vendor_phone, vendor_address, commission_rate) VALUES
('FreshMart Superstore', 'Supermarket', 'freshmart@honestbee.com', '09171234567', '123 Ayala Ave, Makati', 12.00),
('Island Eats Kitchen', 'Restaurant', 'islandeats@honestbee.com', '09181234567', '45 Colon St, Cebu City', 15.00),
('Green Garden Organics', 'Specialty', 'greengarden@honestbee.com', '09191234567', '78 Lahug, Cebu City', 10.00),
('Sakura Japanese Resto', 'Restaurant', 'sakura@honestbee.com', '09201234567', '12 IT Park, Cebu City', 15.00),
('MegaGrocery Warehouse', 'Supermarket', 'megagrocery@honestbee.com', '09211234567', '99 SM North, Quezon City', 11.50);

-- Products
INSERT INTO product (product_name, product_description, product_price, stock_quantity, product_category, vendor_id) VALUES
('Organic Whole Milk', 'Fresh farm-sourced whole milk, 1L', 89.00, 150, 'Dairy', 1),
('Free-Range Eggs (12pcs)', 'Certified free-range chicken eggs', 130.00, 80, 'Dairy', 1),
('Sourdough Bread Loaf', 'Artisan sourdough, baked fresh daily', 180.00, 40, 'Bakery', 1),
('Grilled Liempo Plate', 'Grilled pork belly with rice and atchara', 215.00, 30, 'Meals', 2),
('Palabok Special', 'Classic Filipino noodle dish', 195.00, 25, 'Meals', 2),
('Organic Spinach Bunch', 'Freshly harvested spinach, 200g', 75.00, 60, 'Vegetables', 3),
('Mixed Berries Pack', 'Strawberries, blueberries, raspberries 300g', 350.00, 45, 'Fruits', 3),
('Salmon Sashimi (8pcs)', 'Fresh Norwegian salmon sashimi', 480.00, 20, 'Japanese', 4),
('Chicken Teriyaki Bento', 'Grilled chicken, rice, miso soup', 395.00, 18, 'Japanese', 4),
('Brown Rice (5kg)', 'Premium long-grain brown rice', 295.00, 100, 'Grains', 5),
('Coconut Water (6-pack)', 'Natural coconut water, no sugar added', 210.00, 75, 'Beverages', 5),
('Baby Carrots (500g)', 'Pre-washed sweet baby carrots', 95.00, 55, 'Vegetables', 3);

-- Shoppers
INSERT INTO shopper (shopper_name, shopper_phone, employment_status, hire_date) VALUES
('Marco Reyes', '09301234567', 'active', '2023-01-15'),
('Liza Santos', '09311234567', 'active', '2023-03-22'),
('Carlo Mendoza', '09321234567', 'active', '2022-11-08'),
('Ana Villanueva', '09331234567', 'active', '2023-06-01'),
('Ben Castillo', '09341234567', 'on-leave', '2022-09-14');

-- Customers
INSERT INTO customer (customer_name, customer_email, customer_phone, customer_password, registration_date, customer_address) VALUES
('Shaun Michael Catalla', 'shaun@email.com', '09451234567', 'password123', '2024-01-10', '456 Mango Ave, Cebu City'),
('Maria Clara Dela Cruz', 'maria@email.com', '09461234567', 'password123', '2024-02-14', '789 Osmena Blvd, Cebu City'),
('Jose Rizal Gomez', 'jose@email.com', '09471234567', 'password123', '2024-03-05', '321 Gaisano St, Mandaue');
