-- 1. Insert Dummy Users (10 Students, 1 Staff, 1 Admin)
INSERT INTO users (reg_no, full_name, role, dietary_preference, rebate_balance) VALUES
('20253111', 'Harsh Kumar', 'STUDENT', 'VEG', 0.00),
('20253104', 'Shrey Gayakvad', 'STUDENT', 'JAIN', 0.00),
('20253156', 'Yuvraj Mehariya', 'STUDENT', 'VEG', 0.00),
('20253101', 'Aarav Sharma', 'STUDENT', 'EGG', 0.00),
('20253102', 'Rohan Verma', 'STUDENT', 'VEG', 0.00),
('20253103', 'Priya Patel', 'STUDENT', 'JAIN', 0.00),
('20253105', 'Kabir Singh', 'STUDENT', 'EGG', 0.00),
('20253106', 'Ananya Gupta', 'STUDENT', 'VEG', 0.00),
('20253107', 'Vikram Nair', 'STUDENT', 'VEG', 0.00),
('20253108', 'Neha Joshi', 'STUDENT', 'JAIN', 0.00),
('STAFF001', 'Ramesh Kumar (Mess Staff)', 'STAFF', 'VEG', 0.00),
('ADMIN001', 'Chief Warden (Admin)', 'ADMIN', 'VEG', 0.00);

-- 2. Insert Meal Sessions for Today and Tomorrow
-- Note: We set some cutoffs in the past (LOCKED) and some in the future (OPEN) so you can test both!
INSERT INTO meal_sessions (service_date, type, cutoff_time, state, base_cost) VALUES
-- Today's Meals:
(CURRENT_DATE, 'BREAKFAST', NOW() - INTERVAL '6 hours', 'CLOSED', 40.00),
(CURRENT_DATE, 'LUNCH',     NOW() - INTERVAL '2 hours', 'ACTIVE', 50.00),
(CURRENT_DATE, 'SNACKS',    NOW() + INTERVAL '1 hour',  'OPEN',   30.00),
(CURRENT_DATE, 'DINNER',    NOW() + INTERVAL '4 hours', 'OPEN',   60.00),
-- Tomorrow's Meals:
(CURRENT_DATE + 1, 'BREAKFAST', NOW() + INTERVAL '14 hours', 'OPEN', 40.00),
(CURRENT_DATE + 1, 'LUNCH',     NOW() + INTERVAL '18 hours', 'OPEN', 50.00),
(CURRENT_DATE + 1, 'SNACKS',    NOW() + INTERVAL '21 hours', 'OPEN', 30.00),
(CURRENT_DATE + 1, 'DINNER',    NOW() + INTERVAL '24 hours', 'OPEN', 60.00);

-- 3. Automatically create default 'OPT_IN' bookings for every STUDENT for every meal
INSERT INTO meal_bookings (user_id, meal_id, status)
SELECT u.id, m.id, 'OPT_IN'
FROM users u
CROSS JOIN meal_sessions m
WHERE u.role = 'STUDENT';