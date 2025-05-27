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
  const height = 32; // 1時間 = 32px

  return (
    <div
      className="absolute inset-0 z-10 mx-1 my-0 rounded-md px-2 py-1 text-xs cursor-pointer opacity-70 transition-opacity flex items-center justify-center"
      style={{
        height: `${height}px`,
        top: 0, // Ensure the block is positioned at the top of the cell
        left: 0, // Ensure the block is positioned at the left of the cell
        right: 0, // Ensure the block spans the width of the cell
        backgroundColor: "#B2C8E7", // デフォルトの青色
        border: "1px dashed #6B7280",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(hour, column, type);
      }}
    />
  );
}
