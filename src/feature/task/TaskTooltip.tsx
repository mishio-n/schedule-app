import React from "react";
import { useAppStore } from "../../store/app";
import { ColorPicker } from "../../components/ColorPicker";

interface TaskTooltipProps {
  onClose?: () => void;
  onChange: (taskName: string) => void;
}

export const TaskTooltip: React.FC<TaskTooltipProps> = ({
  onClose,
  onChange,
}) => {
  const { tasks, updateTask } = useAppStore();

  return (
    <div className="absolute top-0 bg-white p-4 rounded-lg border-2 border-[#4B5563] shadow-lg z-50">
      <div className="flex flex-col gap-2 justify-center items-start">
        {tasks.map((task) => (
          <div key={task.name} className="flex items-center gap-2">
            <div className="ml-auto">
              <ColorPicker
                color={task.color}
                onChange={(result) => updateTask(task.name, result.hex)}
              />
            </div>
            <span onClick={() => onChange(task.name)} className="text-sm">
              {task.name}
            </span>
          </div>
        ))}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-xs text-gray-600 hover:text-gray-800"
        >
          Close
        </button>
      )}
    </div>
  );
};
