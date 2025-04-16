import { yyyymmdd } from "@/lib/date";
import { TZDate } from "@date-fns/tz";
import { startOfWeek } from "date-fns";
import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Mode } from "../model/mode";
import { createInitialSchedule, Schedule, WorkMode } from "../model/schedule";
import { Task } from "../model/task";
import { Work } from "../model/work";

type ModeSlice = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

type ScheduleSlice = {
  schedules: Schedule[];
  addWork: (work: Work, mode: WorkMode) => void;
  updateWork: (workId: string, newWork: Work, mode: WorkMode) => void;
  deleteWork: (workId: string, mode: WorkMode) => void;
};

type TaskSlice = {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskName: string, color: string) => void;
};

type WeekStartDateSlice = {
  weekStartDate: string;
  setWeekStartDate: (date: Date) => void;
};

export type AppState = ModeSlice &
  ScheduleSlice &
  TaskSlice &
  WeekStartDateSlice;

const createModeSlice: StateCreator<
  AppState,
  [["zustand/devtools", never]],
  [["zustand/persist", AppState]],
  ModeSlice
> = (set) => ({
  mode: "plan",
  setMode: (mode: Mode) => set({ mode }),
});

const createScheduleSlice: StateCreator<
  AppState,
  [["zustand/devtools", never]],
  [["zustand/persist", AppState]],
  ScheduleSlice
> = (set) => ({
  schedules: [],
  addWork: (work: Work, mode: WorkMode) => {
    set((state) => {
      const targetSchedule = state.schedules.find(
        (schedule) => schedule.weekStartDate === state.weekStartDate,
      );
      if (!targetSchedule) {
        return state;
      }

      return {
        schedules: state.schedules.with(
          state.schedules.indexOf(targetSchedule),
          {
            ...targetSchedule,
            [mode]: [...targetSchedule[mode], work],
          },
        ),
      };
    });
  },
  updateWork: (workId: string, newWork: Work, mode: WorkMode) => {
    set((state) => {
      const targetSchedule = state.schedules.find(
        (schedule) => schedule.weekStartDate === state.weekStartDate,
      );
      if (!targetSchedule) {
        return state;
      }

      return {
        schedules: state.schedules.with(
          state.schedules.indexOf(targetSchedule),
          {
            ...targetSchedule,
            [mode]: targetSchedule[mode].map((work) =>
              work.id === workId ? newWork : work,
            ),
          },
        ),
      };
    });
  },
  deleteWork: (workId: string, mode: WorkMode) => {
    set((state) => {
      const targetSchedule = state.schedules.find(
        (schedule) => schedule.weekStartDate === state.weekStartDate,
      );
      if (!targetSchedule) {
        return state;
      }

      return {
        schedules: state.schedules.with(
          state.schedules.indexOf(targetSchedule),
          {
            ...targetSchedule,
            [mode]: targetSchedule[mode].filter((work) => work.id !== workId),
          },
        ),
      };
    });
  },
});

const createTaskSlice: StateCreator<
  AppState,
  [["zustand/devtools", never]],
  [["zustand/persist", AppState]],
  TaskSlice
> = (set) => ({
  tasks: [],
  addTask: (task: Task) => {
    set((state) => {
      if (state.tasks.some((t) => t.name === task.name)) {
        // タスクが既に存在する場合は、何もしない
        return state;
      }
      return {
        tasks: [...state.tasks, task],
      };
    });
  },
  updateTask: (taskName: string, color: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.name === taskName ? { ...task, color } : task,
      ),
    }));
  },
});

const createWeekStartDateSlice: StateCreator<
  AppState,
  [["zustand/devtools", never]],
  [["zustand/persist", AppState]],
  WeekStartDateSlice
> = (set) => ({
  weekStartDate: yyyymmdd(
    startOfWeek(new TZDate(new Date(), "Asia/Tokyo"), {
      weekStartsOn: 1,
    }),
  ),
  setWeekStartDate: (date: Date) => {
    set((state) => {
      const weekStartDate = yyyymmdd(
        startOfWeek(new TZDate(date, "Asia/Tokyo"), {
          weekStartsOn: 1,
        }),
      );
      // スケジュールが空の場合は、初期化する
      if (
        state.schedules.find(
          (schedule) => schedule.weekStartDate === weekStartDate,
        ) === undefined
      ) {
        return {
          weekStartDate,
          schedules: [...state.schedules, createInitialSchedule(weekStartDate)],
        };
      }
      return { weekStartDate };
    });
  },
});

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({
        ...createModeSlice(...a),
        ...createScheduleSlice(...a),
        ...createTaskSlice(...a),
        ...createWeekStartDateSlice(...a),
      }),
      {
        name: "schedule-app-storage",
      },
    ),
  ),
);
