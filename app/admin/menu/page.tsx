"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  IndianRupee,
  Plus,
  Save,
  Trash2,
  Utensils,
  CheckCircle2,
  Info,
} from "lucide-react";

type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";

type Meal = {
  id: number;
  name: string;
  items: string[];
  price: number;
  cutoff: string;
};

const initialMeals: Meal[] = [
  {
    id: 1,
    name: "Breakfast",
    items: ["Poha", "Bread & Butter", "Tea"],
    price: 30,
    cutoff: "06:00",
  },
  {
    id: 2,
    name: "Lunch",
    items: ["Roti", "Dal", "Rice", "Paneer Curry"],
    price: 60,
    cutoff: "10:00",
  },
  {
    id: 3,
    name: "Snacks",
    items: ["Samosa", "Tea"],
    price: 20,
    cutoff: "15:00",
  },
  {
    id: 4,
    name: "Dinner",
    items: ["Roti", "Rice", "Dal Fry", "Mixed Vegetables"],
    price: 60,
    cutoff: "17:00",
  },
];

const mealTypes: MealType[] = [
  "Breakfast",
  "Lunch",
  "Snacks",
  "Dinner",
];

export default function AdminMenuPage() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [saved, setSaved] = useState(false);
  const [activeMeal, setActiveMeal] = useState(1);

  const selectedMeal = meals.find((meal) => meal.id === activeMeal);

  function updateMeal(id: number, updates: Partial<Meal>) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === id ? { ...meal, ...updates } : meal
      )
    );
    setSaved(false);
  }

  function updateItem(mealId: number, itemIndex: number, value: string) {
    setMeals((current) =>
      current.map((meal) => {
        if (meal.id !== mealId) return meal;

        const updatedItems = [...meal.items];
        updatedItems[itemIndex] = value;

        return { ...meal, items: updatedItems };
      })
    );
    setSaved(false);
  }

  function addItem(mealId: number) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? { ...meal, items: [...meal.items, "New food item"] }
          : meal
      )
    );
    setSaved(false);
  }

  function removeItem(mealId: number, itemIndex: number) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              items: meal.items.filter((_, index) => index !== itemIndex),
            }
          : meal
      )
    );
    setSaved(false);
  }

  function saveMenu() {
    setSaved(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#718071]">
            <Utensils size={16} />
            <span>Admin Portal / Menu Manager</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#183c2b] sm:text-4xl">
            Menu manager
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#718071] sm:text-base">
            Manage meal items, prices, and daily opt-out deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={saveMenu}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#244b34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183c2b]"
        >
          <Save size={17} />
          Save menu
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-[#718071]">
            <Utensils size={17} />
            Meal sessions
          </div>
          <p className="mt-3 text-3xl font-bold text-[#183c2b]">4</p>
          <p className="mt-1 text-xs text-[#718071]">
            Breakfast, lunch, snacks, dinner
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-[#718071]">
            <IndianRupee size={17} />
            Combined meal prices
          </div>
          <p className="mt-3 text-3xl font-bold text-[#183c2b]">
            ₹{meals.reduce((total, meal) => total + meal.price, 0)}
          </p>
          <p className="mt-1 text-xs text-[#718071]">
            Sum of all four listed prices
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-[#718071]">
            <CalendarDays size={17} />
            Menu day
          </div>
          <p className="mt-3 text-3xl font-bold text-[#183c2b]">
            {selectedDay}
          </p>
          <p className="mt-1 text-xs text-[#718071]">
            Select a day to edit its menu
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:p-7">
        <h2 className="text-xl font-bold text-[#183c2b]">
          Select menu day
        </h2>

        <p className="mt-1 text-sm text-[#718071]">
          Choose the day you want to manage.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                setSaved(false);
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                selectedDay === day
                  ? "bg-[#244b34] text-white"
                  : "border border-[#e5e9dc] bg-[#fbfcf8] text-[#718071] hover:border-[#9caf8d]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <div className="rounded-3xl border border-[#e5e9dc] bg-white p-4">
          <h2 className="px-2 pb-3 pt-1 text-sm font-bold text-[#183c2b]">
            Meal sessions
          </h2>

          <div className="space-y-2">
            {meals.map((meal) => (
              <button
                key={meal.id}
                type="button"
                onClick={() => setActiveMeal(meal.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  activeMeal === meal.id
                    ? "border-[#b8cda8] bg-[#edf4e6]"
                    : "border-transparent hover:bg-[#f7f8f2]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#183c2b]">
                    {meal.name}
                  </span>
                  <span className="text-sm font-bold text-[#436b37]">
                    ₹{meal.price}
                  </span>
                </div>

                <p className="mt-2 text-xs text-[#718071]">
                  {meal.items.length} food items
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedMeal && (
          <div className="rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#718071]">
                  {selectedDay}'s menu
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#183c2b]">
                  {selectedMeal.name}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-[#edf4e6] px-3 py-1.5 text-xs font-semibold text-[#436b37]">
                Editable menu
              </span>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="meal-price"
                  className="mb-2 block text-sm font-semibold text-[#183c2b]"
                >
                  Meal price (₹)
                </label>

                <div className="flex items-center rounded-xl border border-[#e5e9dc] px-3 focus-within:border-[#71935d]">
                  <IndianRupee size={17} className="text-[#718071]" />

                  <input
                    id="meal-price"
                    type="number"
                    min="0"
                    value={selectedMeal.price}
                    onChange={(event) =>
                      updateMeal(selectedMeal.id, {
                        price: Math.max(0, Number(event.target.value)),
                      })
                    }
                    className="w-full bg-transparent px-3 py-3 text-sm font-semibold text-[#183c2b] outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="meal-cutoff"
                  className="mb-2 block text-sm font-semibold text-[#183c2b]"
                >
                  Opt-out cutoff time
                </label>

                <div className="flex items-center rounded-xl border border-[#e5e9dc] px-3 focus-within:border-[#71935d]">
                  <Clock3 size={17} className="text-[#718071]" />

                  <input
                    id="meal-cutoff"
                    type="time"
                    value={selectedMeal.cutoff}
                    onChange={(event) =>
                      updateMeal(selectedMeal.id, {
                        cutoff: event.target.value,
                      })
                    }
                    className="w-full bg-transparent px-3 py-3 text-sm font-semibold text-[#183c2b] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 mt-8 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#183c2b]">Food items</h3>
                <p className="mt-1 text-xs text-[#718071]">
                  Edit the dishes served during this meal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => addItem(selectedMeal.id)}
                className="flex items-center gap-1.5 rounded-xl border border-[#dce8cf] bg-[#edf4e6] px-3 py-2 text-xs font-semibold text-[#315b2b] hover:bg-[#e2edd7]"
              >
                <Plus size={15} />
                Add item
              </button>
            </div>

            <div className="space-y-3">
              {selectedMeal.items.map((item, index) => (
                <div
                  key={`${selectedMeal.id}-${index}`}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f5e8] text-[#436b37]">
                    <Utensils size={17} />
                  </div>

                  <input
                    aria-label={`Food item ${index + 1}`}
                    value={item}
                    onChange={(event) =>
                      updateItem(selectedMeal.id, index, event.target.value)
                    }
                    className="min-w-0 flex-1 rounded-xl border border-[#e5e9dc] px-3 py-3 text-sm text-[#183c2b] outline-none focus:border-[#71935d]"
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(selectedMeal.id, index)}
                    aria-label={`Remove ${item || "food item"}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#a45b4b] transition hover:bg-[#fff0ed]"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              {selectedMeal.items.length === 0 && (
                <p className="rounded-xl bg-[#f7f8f2] px-4 py-6 text-center text-sm text-[#718071]">
                  No food items. Click Add item to add a dish.
                </p>
              )}
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#f7f8f2] p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-[#718071]" />

              <p className="text-xs leading-5 text-[#718071]">
                Changes are currently stored in page state only. They won't
                persist after refreshing the page. The selected day is also a
                UI selector; each day does not yet have its own saved menu.
              </p>
            </div>
          </div>
        )}
      </div>

      {saved && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-[#cfe2c0] bg-[#edf7e7] p-4 text-sm text-[#315b2b]"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Demo changes confirmed</p>
            <p className="mt-1 text-xs leading-5">
              Your current edits are visible, but haven't been saved to the
              database.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveMenu}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#244b34] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#183c2b]"
        >
          <Save size={17} />
          Save menu changes
        </button>
      </div>
    </div>
  );
}