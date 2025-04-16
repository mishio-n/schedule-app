export type Work = {
  id: string;
  name: string;
  start: number;
  end: number;
  dayOfWeek: number;
  color?: string; // 色情報を追加
};

export const createWork = (params: Omit<Work, "id">): Work => {
  return {
    id: crypto.randomUUID(),
    ...params,
  };
};
