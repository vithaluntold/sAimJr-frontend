# Database Schema - Module Integration

## Overview
The S(ai)m Jr database is designed to| file_size         | BIGINT       | File size in bytes                  | NOT NULL         |
| mime_type         | VARCHAR(100) | MIME type of the file               |                  |
| processed         | BOOLEAN      | Whether file has been processed     | DEFAULT FALSE    |
| processing_status | VARCHAR(50)  | Status (pending, processing, completed, failed) | DEFAULT 'pending'
| created_at        | TIMESTAMP    | Creation timestamp                  | DEFAULT NOW()    |

Indexes:
- Primary key on `id`
- Index on `company_id`
- Index on `file_type`

### transactions
Stores historical transaction data.

| Column        | Type         | Description                         | Constraints        |
|---------------|--------------|-------------------------------------|------------------|
| id            | UUID         | Unique identifier                   | PRIMARY KEY      |
| company_id    | VARCHAR(50)  | Reference to companies.id           | NOT NULL, FOREIGN KEY |
| date          | DATE         | Transaction date                    | NOT NULL         |
| description   | TEXT         | Transaction description             | NOT NULL         |
| amount        | DECIMAL(15,2)| Transaction amount                  | NOT NULL         |
| party_id      | UUID         | Reference to parties.id             | FOREIGN KEY      |
| category      | VARCHAR(100) | Transaction category                |                  |
| rule_id       | UUID         | Applied rule reference              | FOREIGN KEY      |
| account_code  | VARCHAR(20)  | Chart of accounts code              |                  |
| created_at    | TIMESTAMP    | Creation timestamp                  | DEFAULT NOW()    |

Indexes:
- Primary key on `id`
- Index on `company_id`
- Index on `date`
- Index on `party_id`

### rules
Transaction categorization rules.

| Column        | Type         | Description                         | Constraints        |
|---------------|--------------|-------------------------------------|------------------|
| id            | UUID         | Unique identifier                   | PRIMARY KEY      |
| company_id    | VARCHAR(50)  | Reference to companies.id           | NOT NULL, FOREIGN KEY |
| name          | VARCHAR(255) | Rule name                          | NOT NULL         |
| conditions    | JSONB        | Rule conditions                     | NOT NULL         |
| target_account| VARCHAR(100) | Target account for categorization   | NOT NULL         |
| priority      | INTEGER      | Rule priority                       | DEFAULT 0        |
| is_active     | BOOLEAN      | Whether rule is active              | DEFAULT TRUE     |
| created_at    | TIMESTAMP    | Creation timestamp                  | DEFAULT NOW()    |

Indexes:
- Primary key on `id`
- Index on `company_id`
- Index on `priority`

### parties
Contact/vendor information.

| Column        | Type         | Description                         | Constraints        |
|---------------|--------------|-------------------------------------|------------------|
| id            | UUID         | Unique identifier                   | PRIMARY KEY      |
| company_id    | VARCHAR(50)  | Reference to companies.id           | NOT NULL, FOREIGN KEY |
| name          | VARCHAR(255) | Party name                          | NOT NULL         |
| contact_id    | UUID         | Reference to contacts.id            | FOREIGN KEY      |
| relationship  | VARCHAR(50)  | Relationship type (vendor, customer)| NOT NULL         |
| created_at    | TIMESTAMP    | Creation timestamp                  | DEFAULT NOW()    |

Indexes:
- Primary key on `id`
- Index on `company_id`
- Index on `name`

### contacts
Contact information storage.

| Column        | Type         | Description                         | Constraints        |
|---------------|--------------|-------------------------------------|------------------|
| id            | UUID         | Unique identifier                   | PRIMARY KEY      |
| company_id    | VARCHAR(50)  | Reference to companies.id           | NOT NULL, FOREIGN KEY |
| name          | VARCHAR(255) | Contact name                        | NOT NULL         |
| email         | VARCHAR(255) | Contact email                       |                  |
| phone         | VARCHAR(50)  | Contact phone                       |                  |
| address       | JSONB        | Contact address                     |                  |
| type          | VARCHAR(50)  | Contact type                        |                  |
| created_at    | TIMESTAMP    | Creation timestamp                  | DEFAULT NOW()    |

Indexes:
- Primary key on `id`
- Index on `company_id`
- Index on `name`

### chat_sessions
Chat session management.

| Column          | Type         | Description                         | Constraints        |
|-----------------|--------------|-------------------------------------|------------------|
| id              | UUID         | Unique identifier                   | PRIMARY KEY      |
| company_id      | VARCHAR(50)  | Reference to companies.id           | NOT NULL, FOREIGN KEY |
| messages        | JSONB        | Chat messages array                 | DEFAULT '[]'     |
| current_step    | INTEGER      | Current workflow step               | DEFAULT 1        |
| completed_steps | INTEGER[]    | Array of completed steps            | DEFAULT '{}'     |
| is_active       | BOOLEAN      | Whether session is active           | DEFAULT TRUE     |
| created_at      | TIMESTAMP    | Creation timestamp                  | DEFAULT NOW()    |
| updated_at      | TIMESTAMP    | Last update timestamp               | DEFAULT NOW()    |

Indexes:
- Primary key on `id`
- Index on `company_id`
- Index on `is_active`

### processing_runs
File processing run tracking.

| Column        | Type         | Description                         | Constraints        |
|---------------|--------------|-------------------------------------|------------------|
| id            | UUID         | Unique identifier                   | PRIMARY KEY      |
| company_id    | VARCHAR(50)  | Reference to companies.id           | NOT NULL, FOREIGN KEY |
| file_name     | VARCHAR(255) | Processed file name                 | NOT NULL         |
| file_type     | VARCHAR(50)  | Type of file processed              | NOT NULL         |
| status        | VARCHAR(50)  | Processing status                   | DEFAULT 'pending'|
| started_at    | TIMESTAMP    | Processing start time               | NOT NULL         |
| completed_at  | TIMESTAMP    | Processing completion time          |                  |
| results       | JSONB        | Processing results and statistics   |                  |

Indexes:
- Primary key on `id`
- Index on `company_id`
- Index on `status`

```port accounting data processing and multi-tenant architecture without user authentication (handled by parent platform). The schema uses PostgreSQL as the primary relational database with proper indexing for performance optimization.

## Schema Diagram
\`\`\`
+----------------+      +----------------+      +----------------+
|   companies    |      |   file_uploads |      |  transactions  |
+----------------+      +----------------+      +----------------+
| id             |<---->| id             |<---->| id             |
| name           |      | company_id     |      | company_id     |
| industry       |      | file_name      |      | date           |
| fiscal_year_end|      | file_type      |      | description    |
| currency       |      | file_path      |      | amount         |
| chart_of_accounts|     | processed      |      | party_id       |
| created_at     |      | processing_status |   | category       |
| updated_at     |      | created_at     |      | rule_id        |
+----------------+      +----------------+      | created_at     |
        ^                                       +----------------+
        |                                       
        |                                       
+----------------+      +----------------+      +----------------+
|     rules      |      |    parties     |      |  chat_sessions |
+----------------+      +----------------+      +----------------+
| id             |      | id             |      | id             |
| company_id     |      | company_id     |      | company_id     |
| name           |      | name           |      | messages       |
| category       |      | contact_id     |      | current_step   |
| conditions     |      | relationship   |      | completed_steps|
| priority       |      | created_at     |      | is_active      |
| is_active      |      +----------------+      | created_at     |
| created_at     |                              | updated_at     |
+----------------+      +----------------+      +----------------+
                        |    contacts    |      
                        +----------------+      +----------------+
                        | id             |      | processing_runs|
                        | company_id     |      +----------------+
                        | name           |      | id             |
                        | email          |      | company_id     |
                        | phone          |      | file_name      |
                        | address        |      | status         |
                        | type           |      | started_at     |
                        | created_at     |      | completed_at   |
                        +----------------+      | results        |
                                                +----------------+
\`\`\`

## Tables



### companies
Stores company information for multi-tenant support (no user authentication).

| Column          | Type         | Description                           | Constraints         |
|-----------------|--------------|---------------------------------------|-------------------|
| id              | VARCHAR(50)  | Unique company identifier             | PRIMARY KEY       |
| name            | VARCHAR(255) | Company name                          | NOT NULL          |
| business_name   | VARCHAR(255) | Legal business name                   | NOT NULL          |
| industry        | VARCHAR(100) | Company industry                      |                   |
| nature_of_business | VARCHAR(255) | Nature of business                   |                   |
| location        | VARCHAR(255) | Company location                      |                   |
| reporting_framework | VARCHAR(100) | Accounting framework used            |                   |
| statutory_compliances | TEXT   | Compliance requirements               |                   |
| fiscal_year_end | VARCHAR(5)   | End of fiscal year (MM-DD)            |                   |
| currency        | CHAR(3)      | Company currency code                 | DEFAULT 'USD'     |
| chart_of_accounts | JSONB      | Chart of accounts data                |                   |
| has_active_chat | BOOLEAN      | Whether company has active chat       | DEFAULT FALSE     |
| created_at      | TIMESTAMP    | Creation timestamp                    | DEFAULT NOW()     |
| updated_at      | TIMESTAMP    | Last update timestamp                 | DEFAULT NOW()     |

Indexes:
- Primary key on `id`
- Index on `name`
- Index on `business_name`



### file_uploads
Tracks uploaded files and their processing status.

| Column            | Type         | Description                         | Constraints        |
|-------------------|--------------|-------------------------------------|------------------|
| id                | UUID         | Unique identifier                   | PRIMARY KEY      |
| company_id        | BIGINT       | Reference to companies.id           | NOT NULL, FOREIGN KEY |
| file_name         | VARCHAR(255) | Original file name                  | NOT NULL         |
| file_path         | VARCHAR(512) | Path to stored file                 | NOT NULL         |
| file_type         | VARCHAR(50)  | Type of file (bank_statement, chart_of_accounts, contacts) | NOT NULL |
| file_size         | BIGINT       | File size in bytes                  | NOT NULL         |
| mime_type         | VARCHAR(100) | MIME type of the file               |                  |
| processed         | BOOLEAN      | Whether file has been processed     | DEFAULT FALSE    |
| processing_status | VARCHAR(50)  | Status (pending, processing, completed, failed) | DEFAULT 'pending'
