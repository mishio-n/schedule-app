import { StateCreator, create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Mode } from "../model/mode";
import { Schedule, WorkMode } from "../model/schedule";
import { Task } from "../model/task";
import { Work } from "../model/work";
import { startOfWeek } from "date-fns";
import { TZDate } from "@date-fns/tz";

type ModeSlice = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

type ScheduleSlice = {
  schedules: Map<Date, Schedule>;
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
  weekStartDate: Date;
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
  schedules: new Map<Date, Schedule>([
    [startOfWeek(new Date(), { weekStartsOn: 1 }), { plan: [], do: [] }],
  ]),
  addWork: (work: Work, mode: WorkMode) => {
    set((state) => {
      const targetSchedule = state.schedules.get(state.weekStartDate);
      if (!targetSchedule) {
        return state;
      }

      return {
        schedules: state.schedules.set(state.weekStartDate, {
          ...targetSchedule,
          [mode]: [...targetSchedule[mode], work],
        }),
      };
    });
  },
  updateWork: (workId: string, newWork: Work, mode: WorkMode) => {
    set((state) => {
      const targetSchedule = state.schedules.get(state.weekStartDate);
      if (!targetSchedule) {
        return state;
      }

      return {
        schedules: state.schedules.set(state.weekStartDate, {
          ...targetSchedule,
          [mode]: targetSchedule[mode].map((work) =>
            work.id === workId ? newWork : work,
          ),
        }),
      };
    });
  },
  deleteWork: (workId: string, mode: WorkMode) => {
    set((state) => {
      const targetSchedule = state.schedules.get(state.weekStartDate);
      if (!targetSchedule) {
        return state;
      }

      return {
        schedules: state.schedules.set(state.weekStartDate, {
          ...targetSchedule,
          [mode]: targetSchedule[mode].filter((work) => work.id !== workId),
        }),
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
  weekStartDate: startOfWeek(new TZDate(new Date(), "Asia/Tokyo"), {
    weekStartsOn: 1,
  }),
  setWeekStartDate: (date: Date) =>
    set({ weekStartDate: startOfWeek(date, { weekStartsOn: 1 }) }),
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
