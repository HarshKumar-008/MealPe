-- 1. Create fixed option lists (Enums) so invalid values can never enter the database
CREATE TYPE user_role AS ENUM ('STUDENT', 'STAFF', 'ADMIN');
CREATE TYPE dietary_pref AS ENUM ('VEG', 'JAIN', 'EGG');
CREATE TYPE meal_type AS ENUM ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER');
CREATE TYPE meal_state AS ENUM ('OPEN', 'LOCKED', 'ACTIVE', 'CLOSED');
CREATE TYPE booking_status AS ENUM ('OPT_IN', 'OPT_OUT', 'CONSUMED');

-- 2. Users Table: Stores students, mess staff, and admins
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    dietary_preference dietary_pref DEFAULT 'VEG',
    rebate_balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Meal Sessions Table: Stores each meal on the calendar and its cutoff deadline
CREATE TABLE meal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_date DATE NOT NULL,
    type meal_type NOT NULL,
    cutoff_time TIMESTAMPTZ NOT NULL,
    state meal_state NOT NULL DEFAULT 'OPEN',
    base_cost DECIMAL(10, 2) NOT NULL DEFAULT 45.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Meal Bookings Table: Tracks whether a student opted in, opted out, or ate the meal
CREATE TABLE meal_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_id UUID NOT NULL REFERENCES meal_sessions(id) ON DELETE CASCADE,
    status booking_status NOT NULL DEFAULT 'OPT_IN',
    scanned_at TIMESTAMPTZ,
    scanner_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, meal_id)
);

-- 5. Rebate Ledger Table: Stores ₹45 credit every time a student opts out before cutoff
CREATE TABLE rebate_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_id UUID NOT NULL REFERENCES meal_sessions(id) ON DELETE CASCADE,
    credit_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);