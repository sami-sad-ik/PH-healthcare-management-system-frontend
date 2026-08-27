"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import { useState } from "react";

export interface DataTableFilterValues {
  gender: string;
  specialities: string[];
  appointmentFeeMin: string;
  appointmentFeeMax: string;
}

interface DataTableFiltersProps {
  value: DataTableFilterValues;
  specialities: Array<{ id: string; title: string }>;
  onChange: (value: DataTableFilterValues) => void;
  disabled?: boolean;
}

const DataTableFilters = ({
  value,
  specialities,
  onChange,
  disabled = false,
}: DataTableFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const updateDraft = (updates: Partial<DataTableFilterValues>) => {
    setDraft((current) => ({ ...current, ...updates }));
  };

  const applyFilters = () => {
    onChange(draft);
    setOpen(false);
  };

  const clearFilters = () => {
    const cleared: DataTableFilterValues = {
      gender: "",
      specialities: [],
      appointmentFeeMin: "",
      appointmentFeeMax: "",
    };
    setDraft(cleared);
    onChange(cleared);
  };

  const activeCount =
    draft.specialities.length +
    (draft.gender ? 1 : 0) +
    (draft.appointmentFeeMin || draft.appointmentFeeMax ? 1 : 0);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}>
        <Filter />
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        <ChevronDown />
      </Button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 flex max-h-[calc(100vh-7rem)] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-lg border bg-background p-4 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filter doctors</h3>
            <button
              type="button"
              aria-label="Close filters"
              title="Close filters"
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="mb-4 block text-sm">
            <span className="mb-1.5 block font-medium">Gender</span>
            <select
              value={draft.gender}
              disabled={disabled}
              onChange={(event) => updateDraft({ gender: event.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm">
              <option value="">All genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </label>

          <fieldset className="mb-4">
            <legend className="mb-1.5 text-sm font-medium">Specialities</legend>
            <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border p-2">
              {specialities?.map((speciality) => (
                <label key={speciality.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.specialities.includes(speciality.title)}
                    disabled={disabled}
                    onChange={(event) =>
                      updateDraft({
                        specialities: event.target.checked
                          ? [...draft.specialities, speciality.title]
                          : draft.specialities.filter((title) => title !== speciality.title),
                      })
                    }
                  />
                  {speciality.title}
                </label>
              ))}
              {!specialities.length && (
                <span className="text-sm text-muted-foreground">No specialities found.</span>
              )}
            </div>
          </fieldset>

          <fieldset className="mb-4">
            <legend className="mb-1.5 text-sm font-medium">Appointment fee</legend>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                aria-label="Minimum appointment fee"
                value={draft.appointmentFeeMin}
                onChange={(event) => updateDraft({ appointmentFeeMin: event.target.value })}
                className="h-9 min-w-0 rounded-lg border border-input bg-background px-2 text-sm"
              />
              <input
                type="number"
                min="0"
                placeholder="Max"
                aria-label="Maximum appointment fee"
                value={draft.appointmentFeeMax}
                onChange={(event) => updateDraft({ appointmentFeeMax: event.target.value })}
                className="h-9 min-w-0 rounded-lg border border-input bg-background px-2 text-sm"
              />
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
            <Button type="button" size="sm" onClick={applyFilters}>
              <Check /> Apply changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTableFilters;