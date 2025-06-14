
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
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-full max-w-3xl bg-white/70 border border-gray-200/60 rounded-xl shadow-lg px-6 py-4 flex flex-col items-center gap-3 backdrop-blur-md select-none mx-4">
      <div className="text-xs font-semibold tracking-[0.1em] text-gray-600 uppercase">
        Your Life in Weeks
      </div>
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
        <StatNumber
          label="Weeks Lived"
          value={weeksLived.toLocaleString()}
          color="blue"
          important
        />
        <Separator />
        <StatNumber
          label="Weeks Remaining"
          value={weeksLeft.toLocaleString()}
          subtitle="(approx. to age 90)"
          color="gray"
        />
        <Separator />
        <StatNumber
          label="Life Progress"
          value={percentageLived.toFixed(1) + "%"}
          subtitle="(approx.)"
          color="purple"
          percentage
        />
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
    if (color === "blue") return "text-blue-600";
    if (color === "purple") return "text-purple-600";
    return "text-gray-800";
  };

  return (
    <div className="flex flex-col items-center min-w-[100px] text-center">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </span>
      <span className={`text-3xl lg:text-4xl font-bold leading-none ${getValueColor()}`}>
        {value}
      </span>
      {subtitle && (
        <span className="text-xs font-medium text-gray-400 mt-0.5 leading-tight">
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
