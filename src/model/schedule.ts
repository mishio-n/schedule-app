import { Work } from "./work";

export type Schedule = {
  plan: Work[];
  do: Work[];
};

export type WorkMode = keyof Schedule;
