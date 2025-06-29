import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const Badge = ({ score }) => {
  if (typeof score !== "number") return null;

  let Icon = CheckCircle;
  let color = "bg-emerald-500";

  if (score < 0.4) {
    Icon = XCircle;
    color = "bg-rose-500";
  } else if (score < 0.7) {
    Icon = AlertTriangle;
    color = "bg-amber-400";
  }

  return (
    <div
      className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-white flex items-center justify-center ${color}`}
    >
      <Icon className="w-3 h-3" />
    </div>
  );
};

export default Badge;
