import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { format, startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "../../components/ui/calendar";
import { useAppStore } from "../../store/app";

export const StartDatePicker: React.FC = () => {
  const { weekStartDate, setWeekStartDate } = useAppStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-[#000000] text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        >
          {weekStartDate ? `${format(weekStartDate, "yyyy/MM/dd")}` : ""}
        </button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          className="w-auto p-0 bg-slate-50 shadow-lg rounded-md"
          align="start"
        >
          <Calendar
            mode="single"
            selected={weekStartDate}
            onSelect={(newDate) => {
              // 選択された日付を週の開始日（月曜日）に設定
              if (newDate) {
                const weekStart = startOfWeek(newDate, { weekStartsOn: 1 });
                setWeekStartDate(weekStart);
              }
            }}
            locale={ja}
            initialFocus
          />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};
