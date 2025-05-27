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
  return (
    <button
      className="absolute z-10 left-0 top-0 w-full h-full flex items-center justify-center cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick(hour, column, type);
      }}
    >
      <div 
        className="w-[calc(100%_-_8px)] h-[calc(100%_-_4px)] rounded-md px-2 py-1 text-xs opacity-70 flex items-center justify-center"
        style={{
          backgroundColor: "#B2C8E7", // デフォルトの青色
          border: "1px dashed #6B7280",
        }}
      >
        <div className="flex items-center gap-1">
          <span>+</span>
          <span>New Schedule</span>
        </div>
      </div>
    </button>
  );
}
