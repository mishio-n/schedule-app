export type Work = {
  id: string;
  name: string;
  start: number;
  end: number;
  dayOfWeek: number;
};

export const createWork = (params: Omit<Work, "id">): Work => {
  return {
    id: crypto.randomUUID(),
    ...params,
  };
};
