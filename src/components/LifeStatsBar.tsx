import React from "react";

type LifeStatsBarProps = {
  dob: Date;
  targetAge?: number;
};

function getWeeksLived(dob: Date, now: Date = new Date()) {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const start = new Date(dob);
  start.setHours(0,0,0,0);
  const end = new Date(now);
  end.setHours(0,0,0,0);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / msInWeek));
}

const LifeStatsBar: React.FC<LifeStatsBarProps> = ({ dob, targetAge = 90 }) => {
  const now = new Date();
  const weeksLived = getWeeksLived(dob, now);
  const totalWeeks = targetAge * 52;
  const weeksLeft = Math.max(0, totalWeeks - weeksLived);
  const percentageLived = Math.min(100, (weeksLived / totalWeeks) * 100);

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-lg px-4 sm:px-6 py-3 sm:py-4 flex flex-col items-center gap-2 sm:gap-3 backdrop-blur-md select-none">
      <div className="text-xs font-semibold tracking-[0.1em] text-gray-600 dark:text-gray-300 uppercase">
        Your Life in Weeks
      </div>
      <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
        <div className="col-span-3 sm:col-span-1">
          <StatNumber
            label="Weeks Lived"
            value={weeksLived.toLocaleString()}
            color="blue"
            important
          />
        </div>
        <div className="col-span-3 sm:col-span-1">
          <StatNumber
            label="Weeks Left"
            value={weeksLeft.toLocaleString()}
            subtitle={window.innerWidth > 640 ? "(to age 90)" : ""}
            color="gray"
          />
        </div>
        <div className="col-span-3 sm:col-span-1">
          <StatNumber
            label="Progress"
            value={percentageLived.toFixed(1) + "%"}
            subtitle={window.innerWidth > 640 ? "" : `of ${targetAge} years`}
            color="purple"
            percentage
          />
        </div>
      </div>
    </div>
  );
};

function StatNumber({
  label,
  value,
  subtitle,
  color = "gray",
  percentage,
  important,
}: {
  label: string;
  value: string;
  subtitle?: string;
  color?: "blue" | "purple" | "gray";
  percentage?: boolean;
  important?: boolean;
}) {
  const getValueColor = () => {
    if (color === "blue") return "text-blue-600 dark:text-blue-400";
    if (color === "purple") return "text-purple-600 dark:text-purple-400";
    return "text-gray-800 dark:text-gray-200";
  };

  return (
    <div className="flex flex-col items-center text-center p-1 sm:p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
      <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">
        {label}
      </span>
      <span className={`text-xl sm:text-2xl md:text-3xl font-bold leading-none ${getValueColor()}`}>
        {value}
      </span>
      {subtitle && (
        <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function Separator() {
  return (
    <div className="hidden lg:block h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
  );
}

export default LifeStatsBar;
