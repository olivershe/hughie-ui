import React from "react";

const PromptCard = ({ icon: Icon, title, subtitle, ...props }) => (
  <div
    className="w-36 h-36 p-2.5 rounded-3xl glass flex flex-col justify-between"
    {...props}
  >
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-900/90 text-white">
      <Icon strokeWidth={1.6} className="h-[10px] w-[10px]" />
    </span>
    <div className="overflow-hidden">
      <h3 className="text-sm font-medium tracking-tight text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-gray-500 line-clamp-1">{subtitle}</p>
    </div>
  </div>
);

export default PromptCard;
