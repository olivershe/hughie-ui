import React from "react";
import { Check, AlertTriangle, HelpCircle } from "lucide-react";

export default function Badge({ score }) {
  if (typeof score !== "number") return null;

  const lvl = score >= 0.75 ? "high" : score >= 0.4 ? "med" : "low";
  const Icon = { high: Check, med: AlertTriangle, low: HelpCircle }[lvl];
  const cls = {
    high: "bg-emerald-500",
    med: "bg-amber-400",
    low: "bg-rose-500",
  }[lvl];

  return (
    <div
      className={`absolute -top-1 -right-1 h-5 w-5 rounded-full ring-2 ring-white shadow flex items-center justify-center ${cls}`}
      title={`Model confidence ${(score * 100).toFixed(0)}%`}
    >
      <Icon className="w-[10px] h-[10px]" strokeWidth={2} />
    </div>
  );
}
