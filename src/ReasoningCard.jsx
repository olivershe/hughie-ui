import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const ReasoningCard = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="glass rounded-2xl p-3 mt-2 cursor-pointer"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Reasoning</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
};

export default ReasoningCard;
