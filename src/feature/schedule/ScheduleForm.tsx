import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    startHour: number;
    endHour: number;
    color: string;
  }) => void;
  defaultValues?: {
    title?: string;
    startHour?: number;
    endHour?: number;
    color?: string;
  };
}

export function ScheduleForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues = {},
}: ScheduleFormProps) {
  const [title, setTitle] = useState(defaultValues.title || "");
  const [startHour, setStartHour] = useState(
    defaultValues.startHour?.toString() || "",
  );
  const [endHour, setEndHour] = useState(
    defaultValues.endHour?.toString() || "",
  );
  const [color, setColor] = useState(defaultValues.color || "#B2C8E7");

  const colorOptions = [
    { value: "#B2C8E7", label: "青" },
    { value: "#BAE7B2", label: "緑" },
    { value: "#C7B2E7", label: "紫" },
    { value: "#E7B2DA", label: "ピンク" },
    { value: "#D9D9D9", label: "灰色" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(startHour);
    const end = parseFloat(endHour);

    if (isNaN(start) || isNaN(end) || start >= end) {
      alert("開始時間と終了時間を正しく入力してください");
      return;
    }

    onSubmit({
      title,
      startHour: start,
      endHour: end,
      color,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>予定の追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="予定のタイトルを入力"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startHour">開始時間</Label>
              <Input
                id="startHour"
                type="number"
                min="6"
                max="23.5"
                step="0.5"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                placeholder="例: 9.5 (9:30)"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endHour">終了時間</Label>
              <Input
                id="endHour"
                type="number"
                min="6.5"
                max="24"
                step="0.5"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                placeholder="例: 10.5 (10:30)"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>色</Label>
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded-full ${
                    color === option.value
                      ? "ring-2 ring-offset-2 ring-black"
                      : ""
                  }`}
                  style={{ backgroundColor: option.value }}
                  title={option.label}
                  onClick={() => setColor(option.value)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
