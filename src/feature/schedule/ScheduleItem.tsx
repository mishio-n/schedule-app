import { cn } from "@/lib/utils";
import React from "react";

interface ScheduleItemProps {
  title: string;
  startHour: number;
  endHour: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export function ScheduleItem({
  title,
  startHour,
  endHour,
  color = "#B2C8E7", // デフォルトの青色（Figmaのfill_61AB1L）
  className,
  onClick,
}: ScheduleItemProps) {
  // 1時間 = 32px として計算
  const height = (endHour - startHour) * 32;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 mx-1 rounded-md px-2 py-1 text-xs cursor-pointer overflow-hidden",
        className,
      )}
      style={{
        top: (startHour - 6) * 32, // 6時を基準にする
        height: `${height}px`,
        backgroundColor: color,
      }}
      onClick={onClick}
    >
      {title}
    </div>
  );
}
