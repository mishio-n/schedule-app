import { format } from "date-fns";

export const yyyymmdd = (date: Date): string => format(date, "yyyy-MM-dd");
