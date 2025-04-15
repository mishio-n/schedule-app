import { StateCreator, create } from "zustand";
import { Mode } from "../model/mode";
import { Schedule, WorkMode } from "../model/schedule";
import { Task } from "../model/task";
import { Work } from "../model/work";

type ModeSlice = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

type ScheduleSlice = {
  schedule: Schedule;
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

const createModeSlice: StateCreator<AppState, [], [], ModeSlice> = (set) => ({
  mode: "plan",
  setMode: (mode: Mode) => set({ mode }),
});

const createScheduleSlice: StateCreator<AppState, [], [], ScheduleSlice> = (
  set,
) => ({
  schedule: {
    plan: [],
    do: [],
  },
  addWork: (work: Work, mode: WorkMode) => {
    set((state) => ({
      schedule: {
        ...state.schedule,
        [mode]: [...state.schedule[mode], work],
      },
    }));
  },
  updateWork: (workId: string, newWork: Work, mode: WorkMode) => {
    set((state) => ({
      schedule: {
        ...state.schedule,
        [mode]: state.schedule[mode].map((work) =>
          work.id === workId ? newWork : work,
        ),
      },
    }));
  },
  deleteWork: (workId: string, mode: WorkMode) => {
    set((state) => ({
      schedule: {
        ...state.schedule,
        [mode]: state.schedule[mode].filter((work) => work.id !== workId),
      },
    }));
  },
});

const createTaskSlice: StateCreator<AppState, [], [], TaskSlice> = (set) => ({
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
  [],
  [],
  WeekStartDateSlice
> = (set) => ({
  weekStartDate: new Date(),
  setWeekStartDate: (date: Date) => set({ weekStartDate: date }),
});

export const useAppStore = create<AppState>()((...a) => ({
  ...createModeSlice(...a),
  ...createScheduleSlice(...a),
  ...createTaskSlice(...a),
  ...createWeekStartDateSlice(...a),
}));
