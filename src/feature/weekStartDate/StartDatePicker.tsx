import { Calendar } from "@/components/ui/calendar";
import { useAppStore } from "@/store/app";
import { TZDate } from "@date-fns/tz";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";

export const StartDatePicker: React.FC = () => {
  const { weekStartDate, setWeekStartDate } = useAppStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-[#000000] text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        >
          {weekStartDate}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-slate-50 shadow-lg rounded-md z-50"
        align="start"
      >
        <Calendar
          mode="single"
          selected={new TZDate(weekStartDate, "Asia/Tokyo")}
          onSelect={(newDate) => {
            // 選択された日付を週の開始日（月曜日）に設定
            if (newDate) {
              const weekStart = startOfWeek(new TZDate(newDate, "Asia/Tokyo"), {
                weekStartsOn: 1,
              });
              setWeekStartDate(weekStart);
            }
          }}
          locale={ja}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
