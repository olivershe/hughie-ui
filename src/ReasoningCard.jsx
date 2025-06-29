import React, { useState } from "react";
import { Info } from "lucide-react";

const ReasoningCard = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl px-3 py-2 mt-2 text-sm select-none">
      <div
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <Info className="w-4 h-4" />
        <span>{open ? "Hide" : "Show"} reasoning</span>
      </div>
      {open && <p className="mt-2 leading-relaxed">{text}</p>}
    </div>
  );
};

export default ReasoningCard;
