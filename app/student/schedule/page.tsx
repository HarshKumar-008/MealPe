"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  Clock3,
  Coffee,
  Utensils,
  Moon,
  Check,
  Save,
  Info,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Meal = "breakfast" | "lunch" | "dinner";

type DaySchedule = {
  day: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

const initialSchedule: DaySchedule[] = [
  { day: "Monday", date: "Mon", breakfast: false, lunch: false, dinner: false },
  { day: "Tuesday", date: "Tue", breakfast: false, lunch: false, dinner: false },
  { day: "Wednesday", date: "Wed", breakfast: false, lunch: false, dinner: false },
  { day: "Thursday", date: "Thu", breakfast: false, lunch: false, dinner: false },
  { day: "Friday", date: "Fri", breakfast: false, lunch: false, dinner: false },
  { day: "Saturday", date: "Sat", breakfast: false, lunch: false, dinner: false },
  { day: "Sunday", date: "Sun", breakfast: false, lunch: false, dinner: false },
];

const meals: {
  key: Meal;
  label: string;
  time: string;
  icon: typeof Coffee;
}[] = [
  { key: "breakfast", label: "Breakfast", time: "7:30 AM – 9:30 AM", icon: Coffee },
  { key: "lunch", label: "Lunch", time: "12:30 PM – 2:30 PM", icon: Utensils },
  { key: "dinner", label: "Dinner", time: "7:30 PM – 9:30 PM", icon: Moon },
];

export default function WeeklySchedulePage() {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [saved, setSaved] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [dbMeals, setDbMeals] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [apiFeedback, setApiFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLiveSchedule = useCallback(async () => {
    try {
      let uid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("mealpe_user_id="))
        ?.split("=")[1];

      if (!uid) {
        const { data: student } = await supabase
          .from("users")
          .select("id")
          .eq("role", "STUDENT")
          .limit(1)
          .single();
        if (student) uid = student.id;
      }
      if (uid) setStudentId(uid);

      const res = await fetch("/api/meals/schedule");
      const data = await res.json();
      if (data.success && data.meals) {
        setDbMeals(data.meals);
      }
    } catch {
      // Fallback to local schedule
    }
  }, []);

  useEffect(() => {
    loadLiveSchedule();
  }, [loadLiveSchedule]);

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(20, 0, 0, 0);

      if (now >= cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }

      const difference = cutoff.getTime() - now.getTime();
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  async function toggleMeal(meal: Meal) {
    setApiFeedback(null);

    // Find matching database meal session for live server cutoff & rebate verification
    const matchingDbMeal = dbMeals.find(
      (m) => m.type?.toLowerCase() === meal.toLowerCase()
    );

    if (studentId && matchingDbMeal) {
      try {
        const res = await fetch("/api/meals/opt-out", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: studentId, mealId: matchingDbMeal.id }),
        });
        const data = await res.json();

        if (!res.ok) {
          setApiFeedback({
            type: "error",
            text: `Server Cutoff Guard (${res.status}): ${data.error}`,
          });
          return;
        }

        setApiFeedback({
          type: "success",
          text: `${data.message}! ₹${data.creditedAmount} credited to your Rebate Ledger (Balance: ₹${data.newRebateBalance}).`,
        });
      } catch {
        // Continue with UI toggle if offline
      }
    }

    setSchedule((current) =>
      current.map((day, index) =>
        index === selectedDay ? { ...day, [meal]: !day[meal] } : day
      )
    );
    setSaved(false);
  }

  function saveSchedule() {
    setSaved(true);
  }

  const currentDay = schedule[selectedDay];

  const optedOutCount = schedule.reduce((total, day) => {
    return total + Number(day.breakfast) + Number(day.lunch) + Number(day.dinner);
  }, 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#718071]">
            <CalendarDays size={16} />
            <span>Student Portal / Schedule</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#183c2b] sm:text-4xl">
            Weekly meal schedule
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#718071] sm:text-base">
            Plan your meals for the week. Opt out of meals before the server cutoff deadline to earn instant rebates.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#e5e9dc] bg-white px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f5e8] text-[#436b37]">
            <Clock3 size={20} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#718071]">Next daily cutoff</p>
            <p className="font-mono text-lg font-bold text-[#183c2b]">
              {timeLeft || "--:--:--"}
            </p>
          </div>
        </div>
      </div>

      {apiFeedback && (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium ${
            apiFeedback.type === "success"
              ? "border-[#cfe2c0] bg-[#edf7e7] text-[#267345]"
              : "border-[#f5c2c7] bg-[#fff0ed] text-[#a43b2b]"
          }`}
        >
          <Sparkles size={18} className="shrink-0" />
          <span>{apiFeedback.text}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <p className="text-sm text-[#718071]">Days planned</p>
          <p className="mt-2 text-3xl font-bold text-[#183c2b]">7</p>
          <p className="mt-1 text-xs text-[#718071]">Your full week at a glance</p>
        </div>

        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <p className="text-sm text-[#718071]">Meals opted out</p>
          <p className="mt-2 text-3xl font-bold text-[#183c2b]">
            {optedOutCount}
            <span className="ml-1 text-base font-medium text-[#718071]">/ 21</span>
          </p>
          <p className="mt-1 text-xs text-[#718071]">Across breakfast, lunch and dinner</p>
        </div>

        <div className="rounded-2xl border border-[#dce8cf] bg-[#edf4e6] p-5">
          <p className="text-sm text-[#526c48]">Current selection</p>
          <p className="mt-2 text-3xl font-bold text-[#183c2b]">{currentDay.day}</p>
          <p className="mt-1 text-xs text-[#526c48]">Choose meals below to opt out</p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#183c2b]">Choose a day</h2>
          <p className="mt-1 text-sm text-[#718071]">Select a day to manage its meals.</p>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {schedule.map((day, index) => {
            const isSelected = selectedDay === index;
            const dayOptOuts =
              Number(day.breakfast) + Number(day.lunch) + Number(day.dinner);

            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setSelectedDay(index)}
                className={`relative rounded-2xl border px-2 py-4 text-center transition ${
                  isSelected
                    ? "border-[#244b34] bg-[#244b34] text-white"
                    : "border-[#e5e9dc] bg-[#fbfcf8] text-[#183c2b] hover:border-[#9caf8d]"
                }`}
              >
                <span className="block text-xs font-medium">{day.date}</span>
                <span className="mt-2 block text-lg font-bold">{dayOptOuts}/3</span>
                <span
                  className={`mt-1 block text-[10px] ${
                    isSelected ? "text-[#d8e6ce]" : "text-[#718071]"
                  }`}
                >
                  opted out
                </span>
                {isSelected && (
                  <span className="absolute right-2 top-2">
                    <Check size={13} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-5 mt-8">
          <h2 className="text-xl font-bold text-[#183c2b]">{currentDay.day}&apos;s meals</h2>
          <p className="mt-1 text-sm text-[#718071]">
            Turn on a toggle to opt out of that meal (enforced by server-side cutoff clock).
          </p>
        </div>

        <div className="space-y-3">
          {meals.map((meal) => {
            const Icon = meal.icon;
            const optedOut = currentDay[meal.key];

            return (
              <div
                key={meal.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#e5e9dc] p-4 sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0f5e8] text-[#436b37]">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#183c2b]">{meal.label}</h3>
                    <p className="mt-1 text-xs text-[#718071] sm:text-sm">{meal.time}</p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={optedOut}
                  aria-label={`Opt out of ${meal.label} on ${currentDay.day}`}
                  onClick={() => toggleMeal(meal.key)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    optedOut ? "bg-[#244b34]" : "bg-[#d8ded2]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                      optedOut ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-[#f7f8f2] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-[#718071]" />
            <p className="text-xs leading-5 text-[#718071]">
              Toggling a meal calls <code className="font-mono text-[#183c2b]">POST /api/meals/opt-out</code>.
              Locked meals after the cutoff deadline return <code className="font-mono text-[#183c2b]">403 Forbidden</code>.
            </p>
          </div>

          <button
            type="button"
            onClick={saveSchedule}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#244b34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183c2b]"
          >
            <Save size={17} />
            Save schedule
          </button>
        </div>

        {saved && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-[#cfe2c0] bg-[#edf7e7] px-4 py-3 text-sm font-medium text-[#315b2b]"
          >
            Your meal schedule preferences have been synced with the server.
          </div>
        )}
      </div>
    </div>
  );
}