import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface ScheduleAddButtonProps {
  hour: number;
  column: number;
  type: "P" | "D";
  onClick: (hour: number, column: number, type: "P" | "D") => void;
}

export function ScheduleAddButton({
  hour,
  column,
  type,
  onClick,
}: ScheduleAddButtonProps) {
  return (
    <div
      className="absolute right-1 z-10 opacity-0 hover:opacity-100 transition-opacity"
      style={{
        top: `${(hour - 6) * 32 + 4}px`, // 6時を基準にし、少し余白を持たせる
      }}
    >
      <button
        type="button"
        className="bg-white rounded-full p-0.5 shadow-md hover:bg-gray-50"
        onClick={(e) => {
          e.stopPropagation();
          onClick(hour, column, type);
        }}
        aria-label="予定を追加"
      >
        <PlusCircle size={16} className="text-gray-600" />
      </button>
    </div>
  );
}
