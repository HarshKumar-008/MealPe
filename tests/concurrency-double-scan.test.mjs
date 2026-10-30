import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_REQUESTS = 50;

// Read Supabase keys from the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Key.');
    console.error('Run this script using: node --env-file=.env.local tests/concurrency-double-scan.test.mjs');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runConcurrencyTest() {
    console.log('==============================================================');
    console.log(' MEALPE ATOMIC QR CHECK-IN CONCURRENCY STRESS TEST (50x LOAD)');
    console.log('==============================================================\n');

    // 1. Fetch students directly from Supabase and meals from your API
    const { data: students, error } = await supabase.from('users').select('*').eq('role', 'STUDENT');
    const mealsRes = await fetch(`${BASE_URL}/api/meals/schedule`).then((r) => r.json());

    if (error || !students || students.length === 0) {
        console.error('Error fetching students from Supabase. Did you run seed.sql?');
        process.exit(1);
    }

    const meals = mealsRes.meals || [];

    // Find a student + meal combination that is currently OPT_IN
    let targetStudent = null;
    let targetMeal = null;
    let qrString = null;

    for (const student of students) {
        for (const meal of meals) {
            const qrRes = await fetch(
                `${BASE_URL}/api/qr/generate?userId=${student.id}&mealId=${meal.id}`
            ).then((r) => r.json());

            if (qrRes.success && qrRes.qrString) {
                targetStudent = student;
                targetMeal = meal;
                qrString = qrRes.qrString;
                break;
            }
        }
        if (qrString) break;
    }

    if (!qrString) {
        console.error('No unconsumed OPT_IN booking found. Re-run seed.sql in Supabase to reset bookings.');
        process.exit(1);
    }

    console.log(`Target Student : ${targetStudent.full_name} (${targetStudent.reg_no})`);
    console.log(`Target Meal    : ${targetMeal.type} on ${targetMeal.service_date}`);
    console.log(`Generated QR   : ${qrString.slice(0, 48)}...`);
    console.log(`\nFiring ${CONCURRENT_REQUESTS} simultaneous POST /api/qr/verify requests...\n`);

    const startTime = Date.now();

    // 2. Fire 50 simultaneous requests at the exact same millisecond
    const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, idx) =>
        fetch(`${BASE_URL}/api/qr/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrString })
        }).then(async (res) => ({
            attempt: idx + 1,
            status: res.status,
            body: await res.json()
        }))
    );

    const results = await Promise.all(requests);
    const totalDurationMs = Date.now() - startTime;

    // 3. Count results
    const accepted200 = results.filter((r) => r.status === 200).length;
    const blocked409 = results.filter((r) => r.status === 409).length;
    const otherErrors = results.length - accepted200 - blocked409;

    console.table({
        'Total Parallel Scans Fired': CONCURRENT_REQUESTS,
        '200 OK (Meal Redeemed)': accepted200,
        '409 Conflict (Double-Scan Blocked)': blocked409,
        'Other Status Codes': otherErrors,
        'Total Batch Time (ms)': totalDurationMs
    });

    if (accepted200 === 1 && blocked409 === CONCURRENT_REQUESTS - 1) {
        console.log('\n✅ PASS: Zero Double-Spend Vulnerability! Strictly 1 token redeemed.\n');
    } else {
        console.error('\n❌ FAIL: Race condition detected!\n');
        process.exit(1);
    }
}

runConcurrencyTest();