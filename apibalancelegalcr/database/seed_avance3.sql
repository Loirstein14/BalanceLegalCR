-- =====================================================================
-- Service Agenda - Test data for Avance 3 (lists and details)
-- Run AFTER schema.sql and seed.sql.
-- Branches 2 and 3, their staff and all clients are FICTITIOUS test data.
-- Test password for every user: Test1234!
-- =====================================================================
USE service_agenda;

-- ---------------------------------------------------------------------
-- Branches: complete branch 1 and add two more (invoice header needs
-- name, phone, address and email)
-- ---------------------------------------------------------------------
UPDATE branches
   SET address = 'El Rodeo de San Isidro, Alajuela',
       phone   = '2000-0001',
       email   = 'central@balancelegal.test'
 WHERE id = 1;

INSERT INTO branches (id, name, address, phone, email) VALUES
  (2, 'Sucursal Heredia',  'Heredia centro, 100 m norte del parque central', '2000-0002', 'heredia@balancelegal.test'),
  (3, 'Sucursal San José', 'San José, Barrio Escalante, avenida 7',          '2000-0003', 'sanjose@balancelegal.test');

-- ---------------------------------------------------------------------
-- Users: id numbers for existing users, one manager per new branch,
-- and five clients
-- ---------------------------------------------------------------------
UPDATE users SET id_number = '1-0101-0001', phone = '8000-0001' WHERE id = 1;
UPDATE users SET id_number = '1-0101-0002', phone = '8000-0002' WHERE id = 2;

INSERT INTO users (id, role_id, branch_id, first_name, last_name, id_number, email, phone, password_hash) VALUES
  -- managers (role 2)
  (3, 2, 2,    'Mariana',        'Rojas Vega',        '1-0101-0003', 'heredia.manager@balancelegal.test', '8000-0003',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (4, 2, 3,    'Daniel',         'Mora Castro',       '1-0101-0004', 'sanjose.manager@balancelegal.test', '8000-0004',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  -- clients (role 1)
  (5, 1, NULL, 'Carlos',         'Jiménez Solano',    '2-0202-0005', 'carlos.jimenez@cliente.test',  '8100-0005',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (6, 1, NULL, 'María Fernanda', 'Araya Quesada',     '2-0202-0006', 'maria.araya@cliente.test',     '8100-0006',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (7, 1, NULL, 'José Pablo',     'Vargas Ureña',      '2-0202-0007', 'jose.vargas@cliente.test',     '8100-0007',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (8, 1, NULL, 'Ana Lucía',      'Hernández Brenes',  '2-0202-0008', 'ana.hernandez@cliente.test',   '8100-0008',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (9, 1, NULL, 'Esteban',        'Salazar Murillo',   '2-0202-0009', 'esteban.salazar@cliente.test', '8100-0009',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy');

-- ---------------------------------------------------------------------
-- Providers (lawyers) for the new branches
-- ---------------------------------------------------------------------
INSERT INTO providers (id, user_id, branch_id, display_name, title) VALUES
  (3, 3, 2, 'Licda. Mariana Rojas', 'Abogada'),
  (4, 4, 3, 'Lic. Daniel Mora',     'Abogado y Notario');

-- ---------------------------------------------------------------------
-- Schedules (Monday to Friday, 08:00 - 17:00) and services per branch
-- ---------------------------------------------------------------------
INSERT INTO branch_schedules (branch_id, weekday, open_time, close_time) VALUES
  (2, 1, '08:00', '17:00'), (2, 2, '08:00', '17:00'), (2, 3, '08:00', '17:00'),
  (2, 4, '08:00', '17:00'), (2, 5, '08:00', '17:00'),
  (3, 1, '08:00', '17:00'), (3, 2, '08:00', '17:00'), (3, 3, '08:00', '17:00'),
  (3, 4, '08:00', '17:00'), (3, 5, '08:00', '17:00');

INSERT INTO branch_services (branch_id, service_id) VALUES
  (2, 1), (2, 3),
  (3, 1), (3, 2), (3, 3);

-- ---------------------------------------------------------------------
-- Services: replace the 'Demo' descriptions
-- ---------------------------------------------------------------------
UPDATE services SET description = 'Reunión presencial con un abogado para analizar su caso y orientarle sobre los pasos a seguir.' WHERE id = 1;
UPDATE services SET description = 'Elaboración e inscripción de escrituras de compraventa y traspaso de vehículos o inmuebles.'   WHERE id = 2;
UPDATE services SET description = 'Asesoría legal por videollamada para consultas que no requieren documentos originales.'       WHERE id = 3;

-- ---------------------------------------------------------------------
-- Products: real descriptions and images for the 3 existing ones,
-- plus 3 more so every category has variety.
-- Image files go in apibalancelegalcr/uploads/ with these exact names.
-- ---------------------------------------------------------------------
UPDATE products
   SET description = 'Documento emitido por notario que acredita la existencia de una sociedad y quién la representa legalmente.',
       image_path  = 'product-1.jpg'
 WHERE id = 1;
UPDATE products
   SET description = 'Copia fiel de una escritura del protocolo del notario, con sello y firma, válida para trámites oficiales.',
       image_path  = 'product-2.jpg'
 WHERE id = 2;
UPDATE products
   SET description = 'Libros de actas de asamblea de socios, junta directiva y registro de accionistas, legalizados.',
       image_path  = 'product-3.jpg'
 WHERE id = 3;

INSERT INTO products (id, category_id, name, description, price, image_path, delivery_format, delivery_days) VALUES
  (4, 1, 'Certificación de propiedad inmueble',
   'Certificación notarial con la información registral de una propiedad: dueño, medida, gravámenes y anotaciones.',
   8000.00,  'product-4.jpg', 'digital',  1),
  (5, 2, 'Copia certificada de expediente',
   'Copia certificada de un expediente judicial o administrativo para presentar ante otra institución.',
   12000.00, 'product-5.jpg', 'physical', 3),
  (6, 3, 'Libro de actas de asamblea',
   'Libro individual para registrar las actas de asamblea de una sociedad, legalizado ante el Registro Nacional.',
   18000.00, 'product-6.jpg', 'physical', 4);

-- ---------------------------------------------------------------------
-- Appointments: 4 in branch 1, 3 in branch 2, 3 in branch 3,
-- with every status represented.
-- Status ids: 1 Pendiente, 2 Confirmada, 3 Reprogramada,
--             4 Completada, 5 Cancelada, 6 No asistió
-- ---------------------------------------------------------------------
INSERT INTO appointments
  (id, client_id, provider_id, branch_id, service_id, status_id, starts_at, ends_at,
   created_by, reminder_sent_at, cancelled_at, cancellation_reason, created_at)
VALUES
  -- branch 1 - Oficina Central
  (1,  5, 1, 1, 1, 4, '2026-10-05 09:00', '2026-10-05 10:00', 5, '2026-10-04 08:00', NULL, NULL, '2026-10-01 10:15'),
  (2,  6, 2, 1, 2, 4, '2026-10-06 14:00', '2026-10-06 15:00', 2, '2026-10-05 08:00', NULL, NULL, '2026-10-02 08:30'),
  (3,  7, 1, 1, 3, 2, '2026-10-20 10:00', '2026-10-20 10:45', 7, NULL,               NULL, NULL, '2026-10-12 19:40'),
  (4,  8, 2, 1, 1, 1, '2026-10-22 15:00', '2026-10-22 16:00', 8, NULL,               NULL, NULL, '2026-10-14 11:05'),
  -- branch 2 - Sucursal Heredia
  (5,  9, 3, 2, 1, 4, '2026-10-07 08:00', '2026-10-07 09:00', 9, '2026-10-06 08:00', NULL, NULL, '2026-10-03 16:20'),
  (6,  5, 3, 2, 3, 5, '2026-10-13 11:00', '2026-10-13 11:45', 5, NULL, '2026-10-11 09:00', 'El cliente indicó que no puede asistir.', '2026-10-08 13:10'),
  (7,  6, 3, 2, 1, 3, '2026-10-21 13:00', '2026-10-21 14:00', 3, NULL,               NULL, NULL, '2026-10-09 10:45'),
  -- branch 3 - Sucursal San José
  (8,  7, 4, 3, 2, 4, '2026-10-08 10:00', '2026-10-08 11:00', 4, '2026-10-07 08:00', NULL, NULL, '2026-10-04 09:30'),
  (9,  8, 4, 3, 1, 6, '2026-10-09 16:00', '2026-10-09 17:00', 8, '2026-10-08 08:00', NULL, NULL, '2026-10-05 15:00'),
  (10, 9, 4, 3, 3, 1, '2026-10-23 09:00', '2026-10-23 09:45', 9, NULL,               NULL, NULL, '2026-10-14 17:25');

-- ---------------------------------------------------------------------
-- Answers to the 3 booking questions for every appointment
-- Question ids: 1 motivo (text), 2 asesoría previa (yes_no), 3 fecha límite (yes_no)
-- ---------------------------------------------------------------------
INSERT INTO appointment_answers (appointment_id, question_id, answer_text) VALUES
  (1,  1, 'Necesito asesoría para cobrar una deuda de un antiguo socio.'),
  (1,  2, 'No'), (1,  3, 'No'),
  (2,  1, 'Traspaso de un vehículo que compré a un familiar.'),
  (2,  2, 'No'), (2,  3, 'Sí'),
  (3,  1, 'Consulta sobre el proceso de pensión alimentaria.'),
  (3,  2, 'Sí'), (3,  3, 'Sí'),
  (4,  1, 'Revisión de un contrato de alquiler antes de firmarlo.'),
  (4,  2, 'No'), (4,  3, 'Sí'),
  (5,  1, 'Quiero iniciar un proceso de divorcio por mutuo acuerdo.'),
  (5,  2, 'No'), (5,  3, 'No'),
  (6,  1, 'Dudas sobre una herencia sin testamento.'),
  (6,  2, 'Sí'), (6,  3, 'No'),
  (7,  1, 'Asesoría por despido sin responsabilidad patronal.'),
  (7,  2, 'No'), (7,  3, 'Sí'),
  (8,  1, 'Escritura de compraventa de un lote en Escazú.'),
  (8,  2, 'Sí'), (8,  3, 'Sí'),
  (9,  1, 'Constitución de una sociedad anónima para mi negocio.'),
  (9,  2, 'No'), (9,  3, 'No'),
  (10, 1, 'Consulta sobre un accidente de tránsito y el parte oficial.'),
  (10, 2, 'No'), (10, 3, 'Sí');

-- ---------------------------------------------------------------------
-- Invoices. Proforma is created when the appointment is booked;
-- it becomes Firme (issued) when the service ends.
-- Status ids: 1 Proforma, 2 Firme, 3 Anulada
-- Lines per invoice: 1 -> 1 line (service)
--                    2 -> 2 lines (service + product)
--                    3 -> 3 lines (service + 2 products)
--                    4 -> 3 lines (service + 2 products, quantity 3)
--                    5 -> 2 lines (products only, direct sale)
--                    6, 7 -> 1 line (proforma of upcoming appointments)
-- Tax 13%. Totals = sum of the lines.
-- ---------------------------------------------------------------------
INSERT INTO invoices
  (id, invoice_number, appointment_id, client_id, branch_id, status_id, issued_by, issued_at,
   subtotal, tax_total, total, created_at)
VALUES
  (1, 'FAC-0001', 1,    5, 1, 2, 2, '2026-10-05 10:10',  30000.00,  3900.00,  33900.00, '2026-10-01 10:15'),
  (2, 'FAC-0002', 2,    6, 1, 2, 2, '2026-10-06 15:20', 100000.00, 13000.00, 113000.00, '2026-10-02 08:30'),
  (3, 'FAC-0003', 5,    9, 2, 2, 3, '2026-10-07 09:15',  63000.00,  8190.00,  71190.00, '2026-10-03 16:20'),
  (4, 'FAC-0004', 8,    7, 3, 2, 4, '2026-10-08 11:20', 149000.00, 19370.00, 168370.00, '2026-10-04 09:30'),
  (5, 'FAC-0005', NULL, 8, 3, 2, 4, '2026-10-10 14:00',  20000.00,  2600.00,  22600.00, '2026-10-10 13:45'),
  (6, NULL,       3,    7, 1, 1, NULL, NULL,             25000.00,  3250.00,  28250.00, '2026-10-12 19:40'),
  (7, NULL,       4,    8, 1, 1, NULL, NULL,             30000.00,  3900.00,  33900.00, '2026-10-14 11:05');

INSERT INTO invoice_items
  (invoice_id, service_id, product_id, description, quantity, unit_price, tax_rate,
   line_subtotal, line_tax, line_total)
VALUES
  -- invoice 1: 1 line
  (1, 1,    NULL, 'Consulta legal',                         1, 30000.00, 13.00,  30000.00,  3900.00,  33900.00),
  -- invoice 2: 2 lines (service + product)
  (2, 2,    NULL, 'Escrituras y traspasos',                 1, 80000.00, 13.00,  80000.00, 10400.00,  90400.00),
  (2, NULL, 2,    'Copia certificada de escritura',         2, 10000.00, 13.00,  20000.00,  2600.00,  22600.00),
  -- invoice 3: 3 lines (service + 2 products)
  (3, 1,    NULL, 'Consulta legal',                         1, 30000.00, 13.00,  30000.00,  3900.00,  33900.00),
  (3, NULL, 1,    'Certificación de personería jurídica',   1, 15000.00, 13.00,  15000.00,  1950.00,  16950.00),
  (3, NULL, 6,    'Libro de actas de asamblea',             1, 18000.00, 13.00,  18000.00,  2340.00,  20340.00),
  -- invoice 4: 3 lines (service + 2 products)
  (4, 2,    NULL, 'Escrituras y traspasos',                 1, 80000.00, 13.00,  80000.00, 10400.00,  90400.00),
  (4, NULL, 3,    'Juego de libros legales de sociedad',    1, 45000.00, 13.00,  45000.00,  5850.00,  50850.00),
  (4, NULL, 4,    'Certificación de propiedad inmueble',    3,  8000.00, 13.00,  24000.00,  3120.00,  27120.00),
  -- invoice 5: 2 lines (products only)
  (5, NULL, 5,    'Copia certificada de expediente',        1, 12000.00, 13.00,  12000.00,  1560.00,  13560.00),
  (5, NULL, 4,    'Certificación de propiedad inmueble',    1,  8000.00, 13.00,   8000.00,  1040.00,   9040.00),
  -- invoice 6: proforma, 1 line
  (6, 3,    NULL, 'Consulta legal virtual',                 1, 25000.00, 13.00,  25000.00,  3250.00,  28250.00),
  -- invoice 7: proforma, 1 line
  (7, 1,    NULL, 'Consulta legal',                         1, 30000.00, 13.00,  30000.00,  3900.00,  33900.00);
