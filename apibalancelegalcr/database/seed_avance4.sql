-- =====================================================================
-- Service Agenda - Test data for Avance 4 (maintenance forms)
-- Run AFTER schema.sql, seed.sql and seed_avance3.sql.
-- Branch 4, new staff and new services are FICTITIOUS test data.
-- Test password for every user: Test1234!
--
-- Schedules and blocks use dates RELATIVE to the day the script runs
-- (CURDATE() + INTERVAL n DAY), so they are always in the future when
-- the professor runs the script.
-- =====================================================================
USE service_agenda;

-- ---------------------------------------------------------------------
-- Branch 4 (no managers yet: used to show the manager assignment)
-- ---------------------------------------------------------------------
INSERT INTO branches (id, name, description, address, phone, email) VALUES
  (4, 'Sucursal Cartago',
   'Atención en derecho agrario, sucesiones y trámites de propiedades para la zona de Cartago.',
   'Cartago centro, 200 m sur de la Basílica de los Ángeles', '2000-0004', 'cartago@balancelegal.test');

-- ---------------------------------------------------------------------
-- Services 4 and 5 (business fields: modality, requirements)
-- ---------------------------------------------------------------------
INSERT INTO services (id, name, description, price, duration_minutes, modality, requirements) VALUES
  (4, 'Asesoría en derecho laboral',
   'Análisis de despidos, liquidaciones, horas extra y otros conflictos entre patrono y trabajador.',
   35000.00, 60, 'in_person', 'Contrato laboral, colillas de pago o carta de despido'),
  (5, 'Divorcio por mutuo acuerdo',
   'Redacción del convenio y presentación del divorcio ante notario cuando ambas partes están de acuerdo.',
   150000.00, 90, 'in_person', 'Cédula de ambos cónyuges y certificación de matrimonio');

INSERT INTO branch_services (branch_id, service_id) VALUES
  (1, 4), (1, 5),
  (2, 4),
  (3, 5),
  (4, 1), (4, 3), (4, 4);

-- ---------------------------------------------------------------------
-- Managers WITHOUT a branch (role 2, branch_id NULL).
-- They have no row in providers yet: providers.branch_id is required,
-- so a manager becomes a provider only after being assigned to a branch.
-- ---------------------------------------------------------------------
INSERT INTO users (id, role_id, branch_id, first_name, last_name, id_number, email, phone, password_hash) VALUES
  (10, 2, NULL, 'Valeria', 'Campos Ruiz',   '1-0101-0010', 'valeria.campos@balancelegal.test', '8000-0010',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (11, 2, NULL, 'Andrés',  'Quirós Méndez', '1-0101-0011', 'andres.quiros@balancelegal.test',  '8000-0011',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (12, 2, NULL, 'Sofía',   'Brenes Alfaro', '1-0101-0012', 'sofia.brenes@balancelegal.test',   '8000-0012',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy');

-- ---------------------------------------------------------------------
-- Schedules: every branch, the next 5 WEEKDAYS (Mon-Fri) after today,
-- two ranges per day: 08:00-12:00 and 13:00-18:00 (9 hours per day).
--   d = days 1..7 from today; WEEKDAY() < 5 keeps Monday..Friday,
--   so exactly 5 dates remain.
--   r = the two time ranges of each day.
-- ---------------------------------------------------------------------
INSERT INTO branch_schedules (branch_id, schedule_date, start_time, end_time)
SELECT b.id, CURDATE() + INTERVAL d.n DAY, r.start_time, r.end_time
  FROM branches b
 CROSS JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
             UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7) d
 CROSS JOIN (SELECT '08:00:00' AS start_time, '12:00:00' AS end_time
             UNION ALL SELECT '13:00:00', '18:00:00') r
 WHERE WEEKDAY(CURDATE() + INTERVAL d.n DAY) < 5
 ORDER BY b.id, d.n, r.start_time;

-- ---------------------------------------------------------------------
-- Blocks (they never overlap a schedule range):
--   1) Lunch 12:00-13:00 on every scheduled day of every branch.
--   2) Next Saturday (a day without schedule): internal training at
--      branches 1 and 2.
--      ((5 - WEEKDAY(today) + 6) % 7) + 1 = days until next Saturday (1..7)
-- created_by = 1 (admin). provider_id NULL = the whole branch.
-- ---------------------------------------------------------------------
INSERT INTO schedule_blocks (branch_id, provider_id, block_date, start_time, end_time, reason, created_by)
SELECT DISTINCT branch_id, NULL, schedule_date, '12:00:00', '13:00:00', 'Almuerzo', 1
  FROM branch_schedules
 ORDER BY branch_id, schedule_date;

INSERT INTO schedule_blocks (branch_id, provider_id, block_date, start_time, end_time, reason, created_by)
SELECT b.id, NULL,
       CURDATE() + INTERVAL (((5 - WEEKDAY(CURDATE()) + 6) % 7) + 1) DAY,
       '08:00:00', '12:00:00', 'Capacitación interna del personal', 1
  FROM branches b
 WHERE b.id IN (1, 2);
