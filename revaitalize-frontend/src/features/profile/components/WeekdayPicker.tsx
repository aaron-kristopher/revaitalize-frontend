import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';

interface WeekdayPickerProps {
  selectedDays: number[];
  maxDays: number;
  onChange: (days: number[]) => void;
  disabled?: boolean;
}

const WEEKDAYS = [
  { value: 0, label: 'Sun', name: 'Sunday' },
  { value: 1, label: 'Mon', name: 'Monday' },
  { value: 2, label: 'Tue', name: 'Tuesday' },
  { value: 3, label: 'Wed', name: 'Wednesday' },
  { value: 4, label: 'Thu', name: 'Thursday' },
  { value: 5, label: 'Fri', name: 'Friday' },
  { value: 6, label: 'Sat', name: 'Saturday' },
];

export const WeekdayPicker: React.FC<WeekdayPickerProps> = ({
  selectedDays,
  maxDays,
  onChange,
  disabled = false,
}) => {
  const [localSelectedDays, setLocalSelectedDays] = useState<number[]>(selectedDays);

  useEffect(() => {
    setLocalSelectedDays(selectedDays);
  }, [selectedDays]);

  const handleDayToggle = (dayValue: number) => {
    if (disabled) return;

    let newSelectedDays: number[];
    
    if (localSelectedDays.includes(dayValue)) {
      // Remove the day
      newSelectedDays = localSelectedDays.filter(day => day !== dayValue);
    } else {
      // Add the day only if we haven't reached the max
      if (localSelectedDays.length < maxDays) {
        newSelectedDays = [...localSelectedDays, dayValue].sort();
      } else {
        return; // Don't add if at max capacity
      }
    }

    setLocalSelectedDays(newSelectedDays);
    onChange(newSelectedDays);
  };

  const isSelected = (dayValue: number) => localSelectedDays.includes(dayValue);
  const canSelect = (dayValue: number) => isSelected(dayValue) || localSelectedDays.length < maxDays;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">
          Choose exactly {maxDays} days for your workout schedule
        </Label>
        <p className="text-xs text-slate-500 mt-1">
          Selected: {localSelectedDays.length}/{maxDays} days
        </p>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => {
          const selected = isSelected(day.value);
          const selectable = canSelect(day.value);
          
          return (
            <Button
              key={day.value}
              variant={selected ? "default" : "outline"}
              size="sm"
              className={`h-12 flex flex-col items-center justify-center ${
                !selectable && !selected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => handleDayToggle(day.value)}
              disabled={disabled || (!selectable && !selected)}
              title={day.name}
            >
              <span className="text-xs font-semibold">{day.label}</span>
              {selected && (
                <div className="w-1 h-1 bg-current rounded-full mt-1" />
              )}
            </Button>
          );
        })}
      </div>

      {localSelectedDays.length !== maxDays && (
        <p className="text-sm text-amber-600">
          Please select {maxDays - localSelectedDays.length} more day{maxDays - localSelectedDays.length !== 1 ? 's' : ''} to complete your schedule.
        </p>
      )}
    </div>
  );
}; 