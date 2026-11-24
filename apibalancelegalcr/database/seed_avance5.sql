-- =====================================================================
-- Service Agenda - Test data for Avance 5 (bookings and invoicing)
-- Run AFTER schema.sql, seed.sql, seed_avance3.sql and seed_avance4.sql,
-- on the SAME day as seed_avance4.sql (schedules are relative to today).
-- All clients and appointments are FICTITIOUS test data.
--
-- The manager fixed in the code is user 2 (Adrián Pérez, provider 2),
-- so the new data goes to branch 1 (Oficina Central).
-- Upcoming appointments use the first 3 WEEKDAYS after today, which are
-- days that already have a 08:00-17:00 schedule from seed_avance4.sql.
-- =====================================================================
USE service_agenda;

-- ---------------------------------------------------------------------
-- Invoice status 2 is shown as "Facturado", as the Avance 5 statement says
-- ---------------------------------------------------------------------
UPDATE invoice_statuses SET name = 'Facturado' WHERE id = 2;

-- ---------------------------------------------------------------------
-- 4th booking question, of type number, so the form shows the 3 types
-- (text, yes_no, number)
-- ---------------------------------------------------------------------
INSERT INTO booking_questions (id, service_id, question_text, answer_type, sort_order) VALUES
  (4, NULL, '¿Cuántas personas están involucradas en el caso?', 'number', 4);

-- Answer to the new question for the existing appointments
INSERT INTO appointment_answers (appointment_id, question_id, answer_text) VALUES
  (1, 4, '2'), (2, 4, '2'), (3, 4, '1'), (4, 4, '1'), (5, 4, '2'),
  (6, 4, '3'), (7, 4, '1'), (8, 4, '2'), (9, 4, '3'), (10, 4, '2');

-- ---------------------------------------------------------------------
-- First 3 weekdays (Mon-Fri) after today
--   Friday -> +3 (Monday), Saturday -> +2, any other day -> +1
-- ---------------------------------------------------------------------
SET @d1 = CURDATE() + INTERVAL (CASE WEEKDAY(CURDATE()) WHEN 4 THEN 3 WHEN 5 THEN 2 ELSE 1 END) DAY;
SET @d2 = @d1 + INTERVAL (CASE WEEKDAY(@d1) WHEN 4 THEN 3 ELSE 1 END) DAY;
SET @d3 = @d2 + INTERVAL (CASE WEEKDAY(@d2) WHEN 4 THEN 3 ELSE 1 END) DAY;

-- ---------------------------------------------------------------------
-- Upcoming appointments of branch 1, booked by the manager (user 2)
-- Durations: service 1, 2 and 4 = 60 min, service 5 = 120 min
-- Status ids: 1 Pendiente, 2 Confirmada
-- @d1 has 2 appointments (09-10 and 13-15) to show the free hours
-- ---------------------------------------------------------------------
INSERT INTO appointments
  (id, client_id, provider_id, branch_id, service_id, status_id, starts_at, ends_at, created_by)
VALUES
  (11, 5, 2, 1, 1, 2, TIMESTAMP(@d1, '09:00:00'), TIMESTAMP(@d1, '10:00:00'), 2),
  (12, 6, 2, 1, 5, 1, TIMESTAMP(@d1, '13:00:00'), TIMESTAMP(@d1, '15:00:00'), 2),
  (13, 9, 2, 1, 4, 1, TIMESTAMP(@d2, '10:00:00'), TIMESTAMP(@d2, '11:00:00'), 2),
  (14, 7, 2, 1, 2, 2, TIMESTAMP(@d3, '08:00:00'), TIMESTAMP(@d3, '09:00:00'), 2);

INSERT INTO appointment_answers (appointment_id, question_id, answer_text) VALUES
  (11, 1, 'Quiero saber cómo reclamar el depósito de garantía de un alquiler.'),
  (11, 2, 'No'), (11, 3, 'No'), (11, 4, '2'),
  (12, 1, 'Divorcio por mutuo acuerdo, ya tenemos el convenio conversado.'),
  (12, 2, 'Sí'), (12, 3, 'No'), (12, 4, '2'),
  (13, 1, 'Me despidieron y no me pagaron la liquidación completa.'),
  (13, 2, 'No'), (13, 3, 'Sí'), (13, 4, '1'),
  (14, 1, 'Traspaso de una casa que heredamos entre hermanos.'),
  (14, 2, 'Sí'), (14, 3, 'Sí'), (14, 4, '3');

-- ---------------------------------------------------------------------
-- Invoices of branch 1
--   8-11: proforma of each new appointment (1 service line, quantity 1)
--   12-13: direct sales of products already issued (FAC-0006, FAC-0007)
-- Status ids: 1 Proforma, 2 Facturado. Tax 13%. Totals = sum of the lines.
-- The next invoice issued by the app will be FAC-0008.
-- ---------------------------------------------------------------------
INSERT INTO invoices
  (id, invoice_number, appointment_id, client_id, branch_id, status_id, issued_by, issued_at,
   subtotal, tax_total, total)
VALUES
  (8,  NULL,       11,   5, 1, 1, NULL, NULL,                 30000.00,  3900.00,  33900.00),
  (9,  NULL,       12,   6, 1, 1, NULL, NULL,                150000.00, 19500.00, 169500.00),
  (10, NULL,       13,   9, 1, 1, NULL, NULL,                 35000.00,  4550.00,  39550.00),
  (11, NULL,       14,   7, 1, 1, NULL, NULL,                 80000.00, 10400.00,  90400.00),
  (12, 'FAC-0006', NULL, 9, 1, 2, 2,    '2026-11-10 10:30',  48000.00,  6240.00,  54240.00),
  (13, 'FAC-0007', NULL, 8, 1, 2, 2,    '2026-11-16 15:00',  26000.00,  3380.00,  29380.00);

INSERT INTO invoice_items
  (invoice_id, service_id, product_id, description, quantity, unit_price, tax_rate,
   line_subtotal, line_tax, line_total)
VALUES
  -- proformas: 1 line each
  (8,  1,    NULL, 'Consulta legal',                        1,  30000.00, 13.00,  30000.00,  3900.00,  33900.00),
  (9,  5,    NULL, 'Divorcio por mutuo acuerdo',            1, 150000.00, 13.00, 150000.00, 19500.00, 169500.00),
  (10, 4,    NULL, 'Asesoría en derecho laboral',           1,  35000.00, 13.00,  35000.00,  4550.00,  39550.00),
  (11, 2,    NULL, 'Escrituras y traspasos',                1,  80000.00, 13.00,  80000.00, 10400.00,  90400.00),
  -- FAC-0006: 2 products
  (12, NULL, 1,    'Certificación de personería jurídica',  2,  15000.00, 13.00,  30000.00,  3900.00,  33900.00),
  (12, NULL, 6,    'Libro de actas de asamblea',            1,  18000.00, 13.00,  18000.00,  2340.00,  20340.00),
  -- FAC-0007: 2 products
  (13, NULL, 2,    'Copia certificada de escritura',        1,  10000.00, 13.00,  10000.00,  1300.00,  11300.00),
  (13, NULL, 4,    'Certificación de propiedad inmueble',   2,   8000.00, 13.00,  16000.00,  2080.00,  18080.00);
