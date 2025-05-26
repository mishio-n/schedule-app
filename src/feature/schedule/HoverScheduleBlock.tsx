import { cn } from "@/lib/utils";
import React from "react";

interface HoverScheduleBlockProps {
  hour: number;
  column: number;
  type: "P" | "D";
  onClick: (hour: number, column: number, type: "P" | "D") => void;
}

export function HoverScheduleBlock({
  hour,
  column,
  type,
  onClick,
}: HoverScheduleBlockProps) {
  // 1時間のブロックとして表示
  const startHour = hour;
  const endHour = hour + 1;
  const height = 32; // 1時間 = 32px

  return (
    <div
      className="absolute left-0 right-0 mx-1 rounded-md px-2 py-1 text-xs cursor-pointer opacity-0 group-hover:opacity-60 transition-opacity z-10"
      style={{
        top: (startHour - 6) * 32, // 6時を基準にする
        height: `${height}px`,
        backgroundColor: "#B2C8E7", // デフォルトの青色
        border: "1px dashed #6B7280",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(hour, column, type);
      }}
    >
      New Schedule
    </div>
  );
}