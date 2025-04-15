import { da, ja } from "date-fns/locale";
import { cn } from "../../lib/utils";
import { Day, format } from "date-fns";

type Props = {
  weekDates: Date[];
};

export const WeekDateHeader: React.FC<Props> = ({ weekDates }) => {
  return weekDates.map((date, index) => {
    const day = date.getDay() as Day;

    return (
      <div
        key={`weekdate-${index}`}
        className={cn(
          "h-10 border-r border-b border-[#000000] flex flex-col items-center justify-center font-medium",
          day === 0 ? "bg-[#ffefef]" : day === 6 ? "bg-[#ebfbff]" : "",
        )}
      >
        <div>{ja.localize.day(day, { width: "narrow" })}</div>
        <div className="text-xs text-gray-500">{format(date, "MM/dd")}</div>
      </div>
    );
  });
};
