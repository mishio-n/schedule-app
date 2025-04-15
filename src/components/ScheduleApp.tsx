import { addDays, startOfWeek } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { WeekDateHeader } from "../feature/schedule/WeekDateHeader";
import { TaskTooltip } from "../feature/task/TaskTooltip";
import { StartDatePicker } from "../feature/weekStartDate/StartDatePicker";
import { useAppStore } from "../store/app";

export function ScheduleApp() {
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<number | null>(null);
  const [clickedColumn, setClickedColumn] = useState<{
    column: number;
    type: "P" | "D";
  } | null>(null);
  const { weekStartDate } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // 7つの列（各列にPとDがある）
  const columns = Array.from({ length: 7 }, (_, i) => i + 1);
  // 6時から24時まで
  const hours = Array.from({ length: 19 }, (_, i) => i + 6);

  // 週の日付を計算
  const weekDates = weekStartDate
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i))
    : Array.from({ length: 7 }, (_, i) =>
        addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i),
      );

  // 時間をピクセルに変換
  const hourToPixels = (hour: number) => {
    return (hour - 6) * 32; // 6時を基準に、1時間あたり32px
  };

  // ピクセルを時間に変換（四捨五入して0.5時間単位）
  const pixelsToHour = (pixels: number) => {
    const rawHour = pixels / 32 + 6;
    return Math.round(rawHour * 2) / 2; // 0.5時間単位に丸める
  };

  // セルクリック時の処理
  const handleCellClick = (
    column: number,
    type: "P" | "D",
    hour: number,
    event: React.MouseEvent,
  ) => {
    // ドラッグ中はクリックイベントを無視
    if (isDragging) return;
  };

  // 画面外クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSubjectMenu) {
        const menuElement = document.getElementById("subject-menu");
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setShowSubjectMenu(false);
          setActiveSchedule(null);
          setClickedColumn(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubjectMenu]);

  // コンポーネントのアンマウント時にイベントリスナーをクリーンアップ
  // useEffect(() => {
  //   return () => {
  //     document.removeEventListener("mousemove", handleDragMove);
  //     document.removeEventListener("mouseup", handleDragEnd);
  //   };
  // }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 mb-4">
          <StartDatePicker />
        </div>
      </div>

      {/* スケジュール表 */}
      <div className="relative overflow-x-auto">
        <div
          className="grid grid-cols-[40px_repeat(7,minmax(60px,1fr))] border-t border-l border-[#000000]"
          ref={gridRef}
        >
          {/* 曜日ヘッダー */}
          <div className="h-10 border-r border-b border-[#000000]" />
          <WeekDateHeader weekDates={weekDates} />

          {/* P/Dヘッダー */}
          <div className="h-12 border-r border-b border-[#000000]" />
          {columns.map((column) => (
            <div
              key={`column-${column}`}
              className="h-12 grid grid-cols-2 border-r border-b border-[#000000]"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-sm">Plan</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-sm">Do</div>
              </div>
            </div>
          ))}

          {/* 時間の目盛り */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={`hour-${hour}`}
                className="border-r border-b border-[#000000] h-8 flex items-center justify-center"
              >
                <span className="text-xs">{hour}</span>
              </div>
            ))}
          </div>

          {/* 各列のセル */}
          {columns.map((column) => (
            <div
              key={`column-${column}`}
              className="grid grid-cols-2 border-r border-[#000000] relative"
            >
              {/* Plan側 */}
              <div className="relative">
                {/* 時間の区切り線 */}
                {hours.map((hour) => (
                  <div
                    key={`p-hour-${column}-${hour}`}
                    className="border-b border-[#000000] h-8"
                    onClick={(e) => handleCellClick(column, "P", hour, e)}
                  />
                ))}

                {/* スケジュールブロック */}
              </div>
              {/* Do側 */}
              <div className="relative">
                {/* 時間の区切り線 */}
                {hours.map((hour) => (
                  <div
                    key={`d-hour-${column}-${hour}`}
                    className="border-b border-[#000000] h-8"
                    onClick={(e) => handleCellClick(column, "D", hour, e)}
                  >
                    <div className="h-full border-l border-dashed border-[#7c7c7c]" />
                  </div>
                ))}

                {/* スケジュールブロック */}
              </div>
            </div>
          ))}
        </div>

        {/* 科目選択メニュー */}
        {showSubjectMenu && (
          <TaskTooltip
            onClose={() => setShowSubjectMenu(false)}
            onChange={(taskName) => console.log(taskName)}
          />
        )}
      </div>
    </div>
  );
}
