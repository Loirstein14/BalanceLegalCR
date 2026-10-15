-- =====================================================================
-- Service Agenda - Seed data (Balance Legal)
-- Run after schema.sql.
-- Test password for both users: Test1234!  (bcrypt, generated with password_hash)
-- Never commit real passwords. Prices, products and services are DEMO data
-- until Alejandra confirms the real ones.
-- =====================================================================
USE service_agenda;

INSERT INTO roles (id, code, name) VALUES
  (1, 'client',  'Cliente'),
  (2, 'manager', 'Encargado'),
  (3, 'admin',   'Administrador');

INSERT INTO business_settings (id, business_name, about_text) VALUES
  (1, 'Balance Legal CR',
   'Servicios legales y notariales con atención personalizada.');

INSERT INTO branches (id, name, address, phone, email) VALUES
  (1, 'Oficina Central', 'Dirección por definir', NULL, NULL);

INSERT INTO users (id, role_id, branch_id, first_name, last_name, email, password_hash) VALUES
  (1, 3, NULL, 'Alejandra', 'Chavarría', 'admin@balancelegal.test',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy'),
  (2, 2, 1,    'Adrián',    'Pérez',     'manager@balancelegal.test',
   '$2y$10$T4TVBQGMwdSekGYTzTNeAul1FiJb.3ZdPOjmmjM1Jec8gBqWqYXuy');

INSERT INTO providers (id, user_id, branch_id, display_name, title) VALUES
  (1, 1, 1, 'Licda. Alejandra Chavarría', 'Abogada y Notaria'),
  (2, 2, 1, 'Lic. Adrián Pérez',          'Abogado');

-- Monday to Friday, 08:00 - 17:00 (lunch handled as a block if needed)
INSERT INTO branch_schedules (branch_id, weekday, open_time, close_time) VALUES
  (1, 1, '08:00', '17:00'), (1, 2, '08:00', '17:00'), (1, 3, '08:00', '17:00'),
  (1, 4, '08:00', '17:00'), (1, 5, '08:00', '17:00');

INSERT INTO appointment_statuses (id, code, name, color_hex) VALUES
  (1, 'pending',     'Pendiente',    '#F59E0B'),
  (2, 'confirmed',   'Confirmada',   '#2563EB'),
  (3, 'rescheduled', 'Reprogramada', '#7C3AED'),
  (4, 'completed',   'Completada',   '#16A34A'),
  (5, 'cancelled',   'Cancelada',    '#DC2626'),
  (6, 'no_show',     'No asistió',   '#6B7280');

INSERT INTO invoice_statuses (id, code, name) VALUES
  (1, 'proforma', 'Proforma'),
  (2, 'issued',   'Firme'),
  (3, 'void',     'Anulada');

INSERT INTO product_categories (id, name) VALUES
  (1, 'Certificaciones'),
  (2, 'Copias certificadas'),
  (3, 'Libros legales');

INSERT INTO products (category_id, name, description, price, delivery_format, delivery_days) VALUES
  (1, 'Certificación de personería jurídica', 'Demo', 15000.00, 'digital',  1),
  (2, 'Copia certificada de escritura',       'Demo', 10000.00, 'physical', 2),
  (3, 'Juego de libros legales de sociedad',  'Demo', 45000.00, 'physical', 5);

INSERT INTO services (id, name, description, price, duration_minutes, modality, requirements) VALUES
  (1, 'Consulta legal',           'Demo', 30000.00, 60, 'in_person', 'Cédula de identidad'),
  (2, 'Escrituras y traspasos',   'Demo', 80000.00, 60, 'in_person', 'Cédula y documentos del bien'),
  (3, 'Consulta legal virtual',   'Demo', 25000.00, 45, 'virtual',   NULL);

INSERT INTO branch_services (branch_id, service_id) VALUES (1, 1), (1, 2), (1, 3);

-- Booking questions (validate wording with Alejandra). service_id NULL = all services.
INSERT INTO booking_questions (service_id, question_text, answer_type, sort_order) VALUES
  (NULL, 'Describa brevemente el motivo de su consulta',          'text',   1),
  (NULL, '¿Ha recibido asesoría legal previa sobre este caso?',     'yes_no', 2),
  (NULL, '¿Tiene alguna fecha límite o audiencia próxima?',         'yes_no', 3);
