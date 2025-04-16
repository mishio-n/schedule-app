import { Work } from "./work";

export type Schedule = {
  weekStartDate: string;
  plan: Work[];
  do: Work[];
};

export type WorkMode = "plan" | "do";

export const createInitialSchedule = (weekStartDate: string): Schedule => ({
  weekStartDate,
  plan: [],
  do: [],
});
