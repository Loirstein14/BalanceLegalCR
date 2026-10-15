-- =====================================================================
-- Service Agenda - Database schema
-- MySQL 8.0.16+ (CHECK constraints are enforced from 8.0.16)
-- Single-tenant generic design: one database per business.
-- Everything business-specific lives as data (business_settings,
-- statuses, booking questions), not as structure.
-- =====================================================================

DROP DATABASE IF EXISTS service_agenda;
CREATE DATABASE service_agenda
  DEFAULT CHARACTER SET utf8mb4
 DEFAULT COLLATE utf8mb4_unicode_ci;
USE service_agenda;

-- ---------------------------------------------------------------------
-- MODULE 1: USERS AND BUSINESS
-- ---------------------------------------------------------------------

-- Catalog of the three system roles (client, manager, admin)
CREATE TABLE roles (
  id         TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(20)      NOT NULL,           -- used by the code
  name       VARCHAR(50)      NOT NULL,           -- shown to the user
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB;

-- Physical locations of the business
CREATE TABLE branches (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  address    VARCHAR(255) NOT NULL,
  phone      VARCHAR(20)  NULL,
  email      VARCHAR(254) NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,  -- soft delete
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_branches_name (name)
) ENGINE=InnoDB;

-- One single row with everything that changes from one business to another
CREATE TABLE business_settings (
  id                   TINYINT UNSIGNED NOT NULL,
  business_name        VARCHAR(100)     NOT NULL,
  legal_id             VARCHAR(20)      NULL,      -- cedula juridica
  about_text           TEXT             NULL,      -- public home page intro
  logo_path            VARCHAR(255)     NULL,
  primary_color        CHAR(7)          NOT NULL DEFAULT '#0001B4',
  secondary_color      CHAR(7)          NOT NULL DEFAULT '#ABB0F4',
  currency_code        CHAR(3)          NOT NULL DEFAULT 'CRC',
  tax_rate             DECIMAL(5,2)     NOT NULL DEFAULT 13.00,
  timezone             VARCHAR(50)      NOT NULL DEFAULT 'America/Costa_Rica',
  client_cancel_hours  TINYINT UNSIGNED NOT NULL DEFAULT 24,
  manager_cancel_hours TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_settings_single_row CHECK (id = 1),
  CONSTRAINT chk_settings_tax CHECK (tax_rate >= 0 AND tax_rate <= 100)
) ENGINE=InnoDB;

-- Everyone who logs in. branch_id = branch the user MANAGES (managers only).
-- Rules the DB cannot enforce (validated in the API):
--   * a manager must have branch_id
--   * only one admin
--   * self-registration always creates a client
CREATE TABLE users (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  role_id       TINYINT UNSIGNED NOT NULL,
  branch_id     INT UNSIGNED     NULL,
  first_name    VARCHAR(60)      NOT NULL,
  last_name     VARCHAR(80)      NOT NULL,
  id_number     VARCHAR(20)      NULL,            -- cedula, used on invoices
  email         VARCHAR(254)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,        -- password_hash() output
  phone         VARCHAR(20)      NULL,
  is_active     BOOLEAN          NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_id_number (id_number),
  CONSTRAINT fk_users_role   FOREIGN KEY (role_id)   REFERENCES roles(id)    ON DELETE RESTRICT,
  CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Person who attends appointments (lawyer, barber, doctor...).
-- branch_id = branch where the provider WORKS.
-- user_id is NULL for providers without a login; UNIQUE makes it 1:1.
CREATE TABLE providers (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NULL,
  branch_id    INT UNSIGNED NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  title        VARCHAR(60)  NULL,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_providers_user (user_id),
  CONSTRAINT fk_providers_user   FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE RESTRICT,
  CONSTRAINT fk_providers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MODULE 2: CATALOG
-- ---------------------------------------------------------------------

-- Predefined product categories (used by the category filter)
CREATE TABLE product_categories (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(80)  NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB;

-- Products. Business-specific fields: delivery_format, delivery_days.
-- "Best sellers" is NOT a column: it is computed from invoice_items.
CREATE TABLE products (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category_id     INT UNSIGNED  NOT NULL,
  name            VARCHAR(120)  NOT NULL,
  description     TEXT          NULL,
  price           DECIMAL(12,2) NOT NULL,
  image_path      VARCHAR(255)  NULL,
  delivery_format ENUM('physical','digital') NOT NULL DEFAULT 'physical',
  delivery_days   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_name (name),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Services that can be booked. Business-specific fields: modality, requirements.
-- duration_minutes is used to compute the appointment end time.
CREATE TABLE services (
  id               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name             VARCHAR(120)      NOT NULL,
  description      TEXT              NULL,
  price            DECIMAL(12,2)     NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL,
  image_path       VARCHAR(255)      NULL,
  modality         ENUM('in_person','virtual','home') NOT NULL DEFAULT 'in_person',
  requirements     TEXT              NULL,        -- documents the client must bring
  is_active        BOOLEAN           NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_name (name),
  CONSTRAINT chk_services_price CHECK (price >= 0),
  CONSTRAINT chk_services_duration CHECK (duration_minutes > 0)
) ENGINE=InnoDB;

-- Many-to-many: which branch offers which service.
-- Composite PK: the same pair cannot be registered twice.
CREATE TABLE branch_services (
  branch_id  INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (branch_id, service_id),
  CONSTRAINT fk_bs_branch  FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bs_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MODULE 3: AGENDA
-- ---------------------------------------------------------------------

-- Weekly opening hours per branch (one range per weekday, 1 = Monday ... 7 = Sunday).
-- "At least 5 days and 8 hours" is validated in the API.
CREATE TABLE branch_schedules (
  id         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  branch_id  INT UNSIGNED     NOT NULL,
  weekday    TINYINT UNSIGNED NOT NULL,
  open_time  TIME             NOT NULL,
  close_time TIME             NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_schedule_branch_day (branch_id, weekday),
  CONSTRAINT chk_schedule_weekday CHECK (weekday BETWEEN 1 AND 7),
  CONSTRAINT chk_schedule_range   CHECK (close_time > open_time),
  CONSTRAINT fk_schedule_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Blocked days or hours. provider_id NULL = the whole branch is blocked.
-- When a block is created, the API cancels the appointments inside the range.
CREATE TABLE schedule_blocks (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  branch_id   INT UNSIGNED NOT NULL,
  provider_id INT UNSIGNED NULL,
  starts_at   DATETIME     NOT NULL,
  ends_at     DATETIME     NOT NULL,
  reason      VARCHAR(150) NULL,
  created_by  INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blocks_branch_range (branch_id, starts_at, ends_at),
  CONSTRAINT chk_blocks_range CHECK (ends_at > starts_at),
  CONSTRAINT fk_blocks_branch   FOREIGN KEY (branch_id)   REFERENCES branches(id)  ON DELETE RESTRICT,
  CONSTRAINT fk_blocks_provider FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_blocks_user     FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Appointment statuses with the fixed color used across the whole app
CREATE TABLE appointment_statuses (
  id         TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(20)      NOT NULL,
  name       VARCHAR(50)      NOT NULL,
  color_hex  CHAR(7)          NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_appt_status_code (code)
) ENGINE=InnoDB;

-- Appointments (bookings).
-- ends_at is stored so the overlap check is a simple range query;
-- the overlap itself is validated in the API, per provider.
-- reminder_sent_at is the "notified" field used by the scheduled task.
CREATE TABLE appointments (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  client_id           INT UNSIGNED     NOT NULL,
  provider_id         INT UNSIGNED     NOT NULL,
  branch_id           INT UNSIGNED     NOT NULL,
  service_id          INT UNSIGNED     NOT NULL,
  status_id           TINYINT UNSIGNED NOT NULL,
  starts_at           DATETIME         NOT NULL,
  ends_at             DATETIME         NOT NULL,
  notes               TEXT             NULL,
  created_by          INT UNSIGNED     NOT NULL,   -- client or manager who booked
  reminder_sent_at    DATETIME         NULL,
  cancelled_at        DATETIME         NULL,
  cancellation_reason VARCHAR(255)     NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_appt_provider_start (provider_id, starts_at),
  KEY idx_appt_branch_start   (branch_id, starts_at),
  KEY idx_appt_reminder       (reminder_sent_at, starts_at),
  CONSTRAINT chk_appt_range CHECK (ends_at > starts_at),
  CONSTRAINT fk_appt_client   FOREIGN KEY (client_id)   REFERENCES users(id)                ON DELETE RESTRICT,
  CONSTRAINT fk_appt_provider FOREIGN KEY (provider_id) REFERENCES providers(id)            ON DELETE RESTRICT,
  CONSTRAINT fk_appt_branch   FOREIGN KEY (branch_id)   REFERENCES branches(id)             ON DELETE RESTRICT,
  CONSTRAINT fk_appt_service  FOREIGN KEY (service_id)  REFERENCES services(id)             ON DELETE RESTRICT,
  CONSTRAINT fk_appt_status   FOREIGN KEY (status_id)   REFERENCES appointment_statuses(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appt_creator  FOREIGN KEY (created_by)  REFERENCES users(id)                ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Questions asked when booking. service_id NULL = applies to every service.
CREATE TABLE booking_questions (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  service_id    INT UNSIGNED      NULL,
  question_text VARCHAR(255)      NOT NULL,
  answer_type   ENUM('text','yes_no','number') NOT NULL DEFAULT 'text',
  is_required   BOOLEAN           NOT NULL DEFAULT TRUE,
  sort_order    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active     BOOLEAN           NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_questions_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Many-to-many: answers of an appointment to the booking questions.
-- Composite PK: a question cannot be answered twice in the same appointment.
CREATE TABLE appointment_answers (
  appointment_id INT UNSIGNED NOT NULL,
  question_id    INT UNSIGNED NOT NULL,
  answer_text    TEXT         NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (appointment_id, question_id),
  CONSTRAINT fk_answers_appt     FOREIGN KEY (appointment_id) REFERENCES appointments(id)      ON DELETE RESTRICT,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id)    REFERENCES booking_questions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MODULE 4: INVOICING
-- ---------------------------------------------------------------------

-- Invoice statuses (assumption to confirm with the professor):
-- proforma -> issued (firm) | void
CREATE TABLE invoice_statuses (
  id         TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(20)      NOT NULL,
  name       VARCHAR(50)      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoice_status_code (code)
) ENGINE=InnoDB;

-- Invoice header. While status = proforma it works as the persisted "cart":
-- it lives in the database, so it survives logout.
-- appointment_id UNIQUE = 1:1 with the appointment (NULL for direct sales).
-- Totals are stored as a snapshot because an invoice is a legal document.
CREATE TABLE invoices (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  invoice_number VARCHAR(20)      NULL,            -- assigned when issued
  appointment_id INT UNSIGNED     NULL,
  client_id      INT UNSIGNED     NOT NULL,
  branch_id      INT UNSIGNED     NOT NULL,
  status_id      TINYINT UNSIGNED NOT NULL,
  issued_by      INT UNSIGNED     NULL,            -- manager/admin who issued it
  issued_at      DATETIME         NULL,
  subtotal       DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  tax_total      DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  total          DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
  emailed_at     DATETIME         NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoices_number (invoice_number),
  UNIQUE KEY uq_invoices_appointment (appointment_id),
  KEY idx_invoices_status_issued (status_id, issued_at),
  CONSTRAINT chk_invoices_amounts CHECK (subtotal >= 0 AND tax_total >= 0 AND total >= 0),
  CONSTRAINT fk_invoices_appt   FOREIGN KEY (appointment_id) REFERENCES appointments(id)     ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_client FOREIGN KEY (client_id)      REFERENCES users(id)            ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_branch FOREIGN KEY (branch_id)      REFERENCES branches(id)         ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_status FOREIGN KEY (status_id)      REFERENCES invoice_statuses(id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_issuer FOREIGN KEY (issued_by)      REFERENCES users(id)            ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Invoice lines. Each line is EITHER a service OR a product (enforced by CHECK).
-- Price, tax and description are copied at sale time so old invoices never change.
-- Note: MySQL rejects a CHECK on columns whose foreign key uses CASCADE or
-- SET NULL (error 3823), so these foreign keys must stay RESTRICT.
CREATE TABLE invoice_items (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  invoice_id    INT UNSIGNED      NOT NULL,
  service_id    INT UNSIGNED      NULL,
  product_id    INT UNSIGNED      NULL,
  description   VARCHAR(150)      NOT NULL,
  quantity      SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price    DECIMAL(12,2)     NOT NULL,
  tax_rate      DECIMAL(5,2)      NOT NULL,
  line_subtotal DECIMAL(12,2)     NOT NULL,
  line_tax      DECIMAL(12,2)     NOT NULL,
  line_total    DECIMAL(12,2)     NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_items_product (product_id),
  CONSTRAINT chk_items_one_item_type CHECK ((service_id IS NULL) <> (product_id IS NULL)),
  CONSTRAINT chk_items_quantity      CHECK (quantity > 0),
  CONSTRAINT chk_items_amounts       CHECK (unit_price >= 0 AND tax_rate >= 0),
  CONSTRAINT fk_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  CONSTRAINT fk_items_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
