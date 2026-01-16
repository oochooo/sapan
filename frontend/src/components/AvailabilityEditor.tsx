"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { officeHoursApi } from "@/lib/api";
import type { AvailabilityRule } from "@/types";

interface AvailabilityEditorProps {
  rules: AvailabilityRule[];
  onRulesChange: () => void;
}

const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

export default function AvailabilityEditor({
  rules,
  onRulesChange,
}: AvailabilityEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newRule, setNewRule] = useState({
    weekday: 0,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 30,
  });

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await officeHoursApi.createAvailability(newRule);
      setIsAdding(false);
      setNewRule({
        weekday: 0,
        start_time: "09:00",
        end_time: "17:00",
        slot_duration_minutes: 30,
      });
      onRulesChange();
    } catch (error) {
      console.error("Failed to create availability rule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this availability rule?")) {
      return;
    }

    setDeletingId(id);
    try {
      await officeHoursApi.deleteAvailability(id);
      onRulesChange();
    } catch (error) {
      console.error("Failed to delete availability rule:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (rule: AvailabilityRule) => {
    try {
      await officeHoursApi.updateAvailability(rule.id, {
        is_active: !rule.is_active,
      });
      onRulesChange();
    } catch (error) {
      console.error("Failed to toggle availability rule:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Office Hours Availability
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Set when founders can book time with you
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Availability
          </button>
        )}
      </div>

      {/* Add new rule form */}
      {isAdding && (
        <form
          onSubmit={handleAddRule}
          className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Add New Availability
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                value={newRule.weekday}
                onChange={(e) =>
                  setNewRule({ ...newRule, weekday: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {WEEKDAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={newRule.start_time}
                onChange={(e) =>
                  setNewRule({ ...newRule, start_time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={newRule.end_time}
                onChange={(e) =>
                  setNewRule({ ...newRule, end_time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                value={newRule.slot_duration_minutes}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    slot_duration_minutes: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      )}

      {/* Existing rules */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">
            No availability set. Add your first availability above.
          </p>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                rule.is_active
                  ? "border-gray-200 bg-white"
                  : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.is_active}
                    onChange={() => handleToggleActive(rule)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>

                <div>
                  <span className="font-medium text-gray-900">
                    {rule.weekday_display}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">
                    ({rule.slot_duration_minutes} min slots)
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteRule(rule.id)}
                disabled={deletingId === rule.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              >
                {deletingId === rule.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
