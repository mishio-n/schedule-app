import React, { useState, useRef, useEffect } from "react";
import { BlockPicker, ColorResult } from "react-color";

type Props = {
  color?: string;
  onChange?: (color: ColorResult) => void;
  disableAlpha?: boolean;
  className?: string;
};

export const ColorPicker: React.FC<Props> = ({
  color = "#000000",
  onChange,
  className = "",
}) => {
  const [currentColor, setCurrentColor] = useState(color);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleColorChange = (newColor: ColorResult) => {
    setCurrentColor(newColor.hex);
    onChange?.(newColor);
  };

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className={className} ref={pickerRef}>
      <div
        className="w-4 h-4 rounded-sm cursor-pointer"
        style={{ backgroundColor: currentColor }}
        onClick={togglePicker}
      />

      {showPicker && (
        <div className="absolute mt-2 z-10">
          <BlockPicker
            color={currentColor}
            onChange={handleColorChange}
            triangle="hide"
          />
        </div>
      )}
    </div>
  );
};
