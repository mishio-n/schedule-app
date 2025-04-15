"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Check,
  GripVertical,
  Menu,
  Crown,
  Users,
  BarChart,
} from "lucide-react";
import { Switch } from "@/src/components/ui/switch";
import { cn } from "@/src/lib/utils";
import { format, addDays, startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";
import { useTaskStore } from "@/store";

// スケジュールの型定義
type Schedule = {
  id: number;
  column: number;
  type: "P" | "D";
  startHour: number;
  endHour: number;
  subject: string;
};

export default function ScheduleApp() {
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedSubject, setSelectedSubject] = useState("数学");
  const [activeSchedule, setActiveSchedule] = useState<number | null>(null);
  const [dragType, setDragType] = useState<
    "move" | "resize-top" | "resize-bottom" | null
  >(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHour, setDragStartHour] = useState(0);
  const [dragEndHour, setDragEndHour] = useState(0);
  const [clickedColumn, setClickedColumn] = useState<{
    column: number;
    type: "P" | "D";
  } | null>(null);
  const [date, setDate] = useState<Date | undefined>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isDragging, setIsDragging] = useState(false);

  // Zustandストアを使用
  const { tasks, addTask } = useTaskStore();

  const gridRef = useRef<HTMLDivElement>(null);

  // 曜日の配列（日本語）
  const weekdayNames = ["月", "火", "水", "木", "金", "土", "日"];

  // 7つの列（各列にPとDがある）
  const columns = Array.from({ length: 7 }, (_, i) => i + 1);
  const hours = Array.from({ length: 19 }, (_, i) => i + 6); // 6時から24時まで

  // 週の日付を計算
  const weekDates = date
    ? Array.from({ length: 7 }, (_, i) => addDays(date, i))
    : Array.from({ length: 7 }, (_, i) =>
        addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
      );

  // スケジュールデータ
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 1,
      column: 1,
      type: "P",
      startHour: 7,
      endHour: 8,
      subject: "その他",
    },
    {
      id: 2,
      column: 1,
      type: "D",
      startHour: 13,
      endHour: 19,
      subject: "その他",
    },
    {
      id: 3,
      column: 1,
      type: "D",
      startHour: 15,
      endHour: 20,
      subject: "数学",
    },
    {
      id: 4,
      column: 2,
      type: "P",
      startHour: 10,
      endHour: 12,
      subject: "その他",
    },
    {
      id: 5,
      column: 2,
      type: "D",
      startHour: 10,
      endHour: 12,
      subject: "数学",
    },
    {
      id: 6,
      column: 2,
      type: "D",
      startHour: 22,
      endHour: 23,
      subject: "数学",
    },
    {
      id: 7,
      column: 3,
      type: "P",
      startHour: 10,
      endHour: 12,
      subject: "その他",
    },
    {
      id: 8,
      column: 4,
      type: "P",
      startHour: 10,
      endHour: 12,
      subject: "その他",
    },
    {
      id: 9,
      column: 5,
      type: "P",
      startHour: 10,
      endHour: 12,
      subject: "その他",
    },
    {
      id: 10,
      column: 6,
      type: "P",
      startHour: 10,
      endHour: 12,
      subject: "その他",
    },
    {
      id: 11,
      column: 7,
      type: "P",
      startHour: 10,
      endHour: 12,
      subject: "その他",
    },
  ]);

  // 時間をピクセルに変換
  const hourToPixels = (hour: number) => {
    return (hour - 6) * 32; // 6時を基準に、1時間あたり32px
  };

  // ピクセルを時間に変換（四捨五入して0.5時間単位）
  const pixelsToHour = (pixels: number) => {
    const rawHour = pixels / 32 + 6;
    return Math.round(rawHour * 2) / 2; // 0.5時間単位に丸める
  };

  // 新しいスケジュールを追加
  const addNewSchedule = (
    column: number,
    type: "P" | "D",
    startHour: number
  ) => {
    const newSchedule: Schedule = {
      id: Math.max(0, ...schedules.map((s) => s.id)) + 1,
      column,
      type,
      startHour,
      endHour: startHour + 1,
      subject: selectedSubject,
    };
    setSchedules([...schedules, newSchedule]);
    return newSchedule.id;
  };

  // セルクリック時の処理
  const handleCellClick = (
    column: number,
    type: "P" | "D",
    hour: number,
    event: React.MouseEvent
  ) => {
    // ドラッグ中はクリックイベントを無視
    if (isDragging) return;

    // 既存のスケジュールがあるかチェック
    const existingSchedule = schedules.find(
      (s) =>
        s.column === column &&
        s.type === type &&
        hour >= s.startHour &&
        hour < s.endHour
    );

    if (existingSchedule) {
      // 既存のスケジュールをクリックした場合は科目選択メニューを表示
      setActiveSchedule(existingSchedule.id);
      setMenuPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setShowSubjectMenu(true);
    } else {
      // 空のセルをクリックした場合は新しいスケジュールを追加
      setClickedColumn({ column, type });
      setMenuPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setShowSubjectMenu(true);
    }
  };

  // 科目選択時の処理
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectMenu(false);

    if (activeSchedule) {
      // 既存のスケジュールの科目を変更
      setSchedules(
        schedules.map((s) => (s.id === activeSchedule ? { ...s, subject } : s))
      );
      setActiveSchedule(null);
    } else if (clickedColumn) {
      // 新しいスケジュールを追加
      const hour = Math.floor(menuPosition.y / 32) + 6;
      addNewSchedule(clickedColumn.column, clickedColumn.type, hour);
      setClickedColumn(null);
    }
  };

  // ドラッグ開始時の処理
  const handleDragStart = (
    scheduleId: number,
    type: "move" | "resize-top" | "resize-bottom",
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    setActiveSchedule(scheduleId);
    setDragType(type);
    setDragStartY(event.clientY);
    setDragStartHour(schedule.startHour);
    setDragEndHour(schedule.endHour);
    setIsDragging(true);

    // グローバルイベントリスナーを追加
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  // ドラッグ中の処理
  const handleDragMove = (event: MouseEvent) => {
    if (!activeSchedule || !dragType) return;

    const schedule = schedules.find((s) => s.id === activeSchedule);
    if (!schedule) return;

    const deltaY = event.clientY - dragStartY;
    const deltaHours = pixelsToHour(deltaY) - pixelsToHour(0);

    let newStartHour = schedule.startHour;
    let newEndHour = schedule.endHour;

    if (dragType === "move") {
      newStartHour = Math.max(
        6,
        Math.min(
          dragStartHour + deltaHours,
          24 - (schedule.endHour - schedule.startHour)
        )
      );
      newEndHour = newStartHour + (schedule.endHour - schedule.startHour);
    } else if (dragType === "resize-top") {
      newStartHour = Math.max(
        6,
        Math.min(dragStartHour + deltaHours, schedule.endHour - 0.5)
      );
    } else if (dragType === "resize-bottom") {
      newEndHour = Math.max(
        schedule.startHour + 0.5,
        Math.min(dragEndHour + deltaHours, 24)
      );
    }

    // 更新されたスケジュールを表示
    setSchedules(
      schedules.map((s) =>
        s.id === activeSchedule
          ? { ...s, startHour: newStartHour, endHour: newEndHour }
          : s
      )
    );
  };

  // ドラッグ終了時の処理
  const handleDragEnd = () => {
    setActiveSchedule(null);
    setDragType(null);
    setIsDragging(false);

    // グローバルイベントリスナーを削除
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
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
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, []);

  // アプリケーション初期化時にデフォルトのタスク色を設定
  useEffect(() => {
    // デフォルトのタスク色を設定
    if (tasks.size === 0) {
      addTask("数学", "#b2c8e7");
      addTask("古文", "#bae7b2");
      addTask("漢文", "#c7b2e7");
      addTask("英語", "#e7b2da");
      addTask("その他", "#d9d9d9");
    }
  }, [tasks, addTask]);

  // スケジュールブロックの色を取得 (Zustandストアから取得)
  const getScheduleColor = (subject: string) => {
    // ストアから色を取得
    const color = tasks.get(subject);
    if (color) {
      return `bg-[${color}]`;
    }

    // フォールバックの色
    return "bg-[#d9d9d9]";
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-[#000000] text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                {date ? `${format(date, "yyyy/MM/dd")}` : ""}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  // 選択された日付を週の開始日（月曜日）に設定
                  if (newDate) {
                    const weekStart = startOfWeek(newDate, { weekStartsOn: 1 });
                    setDate(weekStart);
                  } else {
                    setDate(undefined);
                  }
                }}
                locale={ja}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="flex items-center space-x-2">
            <span className="text-[#7c7c7c]">重ねる</span>
            <Switch
              checked={!isOverlapping}
              onCheckedChange={() => setIsOverlapping(!isOverlapping)}
              className="data-[state=checked]:bg-[#fbb34d]"
            />
            <span className="text-[#000000]">横並び</span>
          </div>
        </div>

        {/* サイドバーメニューの実装 */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 relative w-8 h-8">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <div className="flex flex-col gap-8 pt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-medium mb-2">Weekly Report</h2>
                <div className="flex items-center justify-center">
                  <span className="text-6xl font-normal">80</span>
                  <span className="text-3xl ml-1">点</span>
                </div>
              </div>

              {/* 先生からのコメント セクション */}
              <div className="mb-8">
                <h3 className="text-center text-base mb-4">
                  先生からのコメント
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-[#007AC5] text-white text-xs font-bold py-1 px-3 rounded-full">
                      有言実行
                    </div>
                    <div className="bg-[#007AC5] text-white text-xs font-bold py-1 px-3 rounded-full">
                      勤勉
                    </div>
                    <div className="bg-[#DE4C4C] text-white text-xs font-bold py-1 px-3 rounded-full">
                      偏食
                    </div>
                  </div>
                </div>
              </div>

              {/* 3ヶ月間の推移 セクション */}
              <div className="mb-8">
                <h3 className="text-center text-base mb-4">3ヶ月間の推移</h3>
                <div className="flex justify-center mb-4">
                  <BarChart className="w-6 h-6" />
                </div>
              </div>

              {/* 取り組んだ時間 セクション */}
              <div className="mb-8">
                <h3 className="text-center text-xs font-light mb-4">
                  取り組んだ時間
                </h3>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-light">0</span>
                  <span className="text-xs font-light">100</span>
                </div>
                <div className="w-full h-4 bg-[#d9d9d9] rounded-sm relative mb-6">
                  <div className="absolute top-0 left-0 h-full w-[80%] bg-[#FEA57C] rounded-sm"></div>
                </div>
              </div>

              {/* バランス セクション */}
              <div className="mb-8">
                <h3 className="text-center text-xs font-light mb-4">
                  バランス
                </h3>
                <div className="relative w-full h-48 flex justify-center items-center mb-6">
                  <div className="w-36 h-36 rounded-full border-4 border-[#87D0D8]"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#808080] rounded-full"></div>
                  {/* 放射状の点線 */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`radial-${i}`}
                      className="absolute top-1/2 left-1/2 w-36 h-1 border-t border-dashed border-[#808080]"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 72}deg)`,
                      }}
                    ></div>
                  ))}
                  {/* 三角形のプロットマーカー */}
                  <div className="absolute top-[30%] left-[60%] w-0 h-0 border-solid border-[8px] border-t-transparent border-r-transparent border-b-[rgba(253,115,51,0.64)] border-l-transparent transform rotate-45"></div>
                </div>
              </div>

              {/* 計画達成度 セクション */}
              <div className="mb-8">
                <h3 className="text-center text-xs font-light mb-6">
                  計画達成度
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={`grid-${i}`}
                      className={`h-6 rounded-sm ${
                        i === 12 ? "bg-[#FEA57C]" : "bg-[#d9d9d9]"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* 賞のセクション */}
              <div className="mb-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-[#FFD700]" />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* スケジュール表 */}
      <div className="relative overflow-x-auto">
        <div
          className="grid grid-cols-[40px_repeat(7,minmax(60px,1fr))] border-t border-l border-[#000000]"
          ref={gridRef}
        >
          {/* 曜日ヘッダー */}
          <div className="h-10 border-r border-b border-[#000000]"></div>
          {weekDates.map((day, index) => (
            <div
              key={`weekday-${index}`}
              className="h-10 border-r border-b border-[#000000] flex flex-col items-center justify-center font-medium"
            >
              <div>{weekdayNames[index]}</div>
              <div className="text-xs text-gray-500">
                {format(day, "MM/dd")}
              </div>
            </div>
          ))}

          {/* P/Dヘッダー */}
          <div className="h-12 border-r border-b border-[#000000]"></div>
          {columns.map((column) => (
            <div
              key={`column-${column}`}
              className="h-12 grid grid-cols-2 border-r border-b border-[#000000]"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-sm">P</div>
                <div className="h-6 border-l border-dashed border-[#7c7c7c]"></div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-sm">D</div>
                <div className="h-6 border-l border-dashed border-[#7c7c7c]"></div>
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
                  >
                    <div className="h-full border-l border-dashed border-[#7c7c7c]"></div>
                  </div>
                ))}

                {/* スケジュールブロック */}
                {schedules
                  .filter((s) => s.column === column && s.type === "P")
                  .map((schedule) => (
                    <div
                      key={`schedule-${schedule.id}`}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded-sm",
                        getScheduleColor(schedule.subject),
                        activeSchedule === schedule.id
                          ? "ring-2 ring-black z-10"
                          : "",
                        isDragging && activeSchedule === schedule.id
                          ? "opacity-80"
                          : "",
                        dragType === "move" ? "cursor-move" : ""
                      )}
                      style={{
                        top: `${hourToPixels(schedule.startHour)}px`,
                        height: `${
                          hourToPixels(schedule.endHour) -
                          hourToPixels(schedule.startHour)
                        }px`,
                      }}
                      onClick={(e) => {
                        if (!isDragging) {
                          e.stopPropagation();
                          handleCellClick(column, "P", schedule.startHour, e);
                        }
                      }}
                    >
                      {/* ドラッグハンドル - 上部 */}
                      <div
                        className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize bg-transparent hover:bg-black/10"
                        onMouseDown={(e) =>
                          handleDragStart(schedule.id, "resize-top", e)
                        }
                      ></div>

                      {/* ドラッグハンドル - 中央部（移動用） */}
                      <div
                        className="absolute inset-3 cursor-move flex items-center justify-center"
                        onMouseDown={(e) =>
                          handleDragStart(schedule.id, "move", e)
                        }
                      >
                        <GripVertical className="w-4 h-4 opacity-50" />
                      </div>

                      {/* ドラッグハンドル - 下部 */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize bg-transparent hover:bg-black/10"
                        onMouseDown={(e) =>
                          handleDragStart(schedule.id, "resize-bottom", e)
                        }
                      ></div>
                    </div>
                  ))}
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
                    <div className="h-full border-l border-dashed border-[#7c7c7c]"></div>
                  </div>
                ))}

                {/* スケジュールブロック */}
                {schedules
                  .filter((s) => s.column === column && s.type === "D")
                  .map((schedule) => (
                    <div
                      key={`schedule-${schedule.id}`}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded-sm",
                        getScheduleColor(schedule.subject),
                        activeSchedule === schedule.id
                          ? "ring-2 ring-black z-10"
                          : "",
                        isDragging && activeSchedule === schedule.id
                          ? "opacity-80"
                          : "",
                        dragType === "move" ? "cursor-move" : ""
                      )}
                      style={{
                        top: `${hourToPixels(schedule.startHour)}px`,
                        height: `${
                          hourToPixels(schedule.endHour) -
                          hourToPixels(schedule.startHour)
                        }px`,
                      }}
                      onClick={(e) => {
                        if (!isDragging) {
                          e.stopPropagation();
                          handleCellClick(column, "D", schedule.startHour, e);
                        }
                      }}
                    >
                      {/* ドラッグハンドル - 上部 */}
                      <div
                        className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize bg-transparent hover:bg-black/10"
                        onMouseDown={(e) =>
                          handleDragStart(schedule.id, "resize-top", e)
                        }
                      ></div>

                      {/* ドラッグハンドル - 中央部（移動用） */}
                      <div
                        className="absolute inset-3 cursor-move flex items-center justify-center"
                        onMouseDown={(e) =>
                          handleDragStart(schedule.id, "move", e)
                        }
                      >
                        <GripVertical className="w-4 h-4 opacity-50" />
                      </div>

                      {/* ドラッグハンドル - 下部 */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize bg-transparent hover:bg-black/10"
                        onMouseDown={(e) =>
                          handleDragStart(schedule.id, "resize-bottom", e)
                        }
                      ></div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* 科目選択メニュー */}
        {showSubjectMenu && (
          <div
            id="subject-menu"
            className="fixed bg-white border-2 border-[#000000] rounded-lg p-3 z-20 w-48"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from(tasks.entries()).map(([subject, color]) => (
              <div
                key={subject}
                className="flex items-center gap-2 mb-2 cursor-pointer"
                onClick={() => handleSubjectSelect(subject)}
              >
                {selectedSubject === subject && <Check size={16} />}
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: color }}
                ></div>
                <span>{subject}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
