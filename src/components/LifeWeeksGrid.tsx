
import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type LifeWeeksGridProps = {
  dob: Date;
  targetAge?: number; // in years
};

function getWeekNumber(d1: Date, d2: Date): number {
  // The week count from d1 to d2, where week 0 is the week containing d1
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const start = new Date(d1);
  start.setHours(0,0,0,0);
  const end = new Date(d2);
  end.setHours(0,0,0,0);
  return Math.floor((end.getTime() - start.getTime()) / msInWeek);
}

const GRID_COLUMNS = 52;
const MAX_YEARS = 90;

const LifeWeeksGrid: React.FC<LifeWeeksGridProps> = ({ dob, targetAge = MAX_YEARS }) => {
  const totalWeeks = GRID_COLUMNS * targetAge;
  const today = new Date();
  const weekNumNow = Math.max(0, Math.min(totalWeeks - 1, getWeekNumber(dob, today)));
  const years: number[] = [];
  for (let y = 0; y < targetAge; ++y) years.push(y);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col items-center">
        <div className="flex items-start gap-2">
          {/* Age labels on the left */}
          <div className="flex flex-col items-end">
            {/* Age heading */}
            <div className="text-xs font-semibold text-muted-foreground mb-2 h-6 flex items-center justify-center">
              Age
            </div>
            {/* Year labels - aligned with grid rows */}
            <div className="flex flex-col" style={{ gap: '1px' }}>
              {years.map((year) => (
                <div 
                  key={year} 
                  className="text-xs text-muted-foreground font-mono flex items-center justify-end pr-2" 
                  style={{ height: '12px', minWidth: '24px' }}
                >
                  {year % 5 === 0 ? year : ''}
                </div>
              ))}
            </div>
          </div>
          
          {/* Main grid container */}
          <div className="relative">
            {/* Week of the Year heading and week number labels */}
            <div className="flex flex-col mb-2">
              <div className="text-xs font-semibold text-muted-foreground mb-1 text-center h-6 flex items-center justify-center">
                Week of the Year
              </div>
              {/* Week number labels - aligned with grid columns */}
              <div className="flex" style={{ gap: '1px' }}>
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                  <div 
                    key={weekIndex} 
                    className="text-xs text-muted-foreground font-mono flex items-center justify-center" 
                    style={{ width: '12px', height: '12px' }}
                  >
                    {weekIndex % 5 === 0 ? weekIndex : ''}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grid */}
            <div
              className="rounded-lg border bg-card p-4 shadow-lg"
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(52, 12px)',
                gap: '1px',
                maxWidth: '100%', 
                overflowX: 'auto' 
              }}
            >
              {Array.from({ length: totalWeeks }).map((_, i) => {
                const week = i % GRID_COLUMNS;
                const year = Math.floor(i / GRID_COLUMNS);
                const weekDate = new Date(dob);
                weekDate.setDate(weekDate.getDate() + i * 7);
                
                let colorClass = "bg-gray-200"; // Future weeks - light gray
                let outlineClass = "";
                
                if (i < weekNumNow) {
                  colorClass = "bg-blue-500"; // Lived weeks - blue
                }
                if (i === weekNumNow) {
                  colorClass = "bg-green-500"; // Current week - green
                  outlineClass = "ring-2 ring-green-300";
                }
                
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-3 h-3 rounded-[1px] cursor-pointer transition-all duration-100",
                          colorClass,
                          outlineClass,
                          "hover:scale-110"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs rounded shadow">
                      <div>
                        <span className="font-mono font-semibold">Age {year}, Week {week + 1}</span>
                      </div>
                      <div>
                        {weekDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      {i < weekNumNow && <div className="text-[10px] text-muted-foreground">Lived</div>}
                      {i === weekNumNow && <div className="text-[10px] text-green-600 font-bold">This week</div>}
                      {i > weekNumNow && <div className="text-[10px] text-muted-foreground">Future</div>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Bottom labels */}
        <div className="mt-6 flex justify-between w-full max-w-3xl text-sm text-muted-foreground px-2">
          <div className="flex flex-col items-start">
            <div className="font-semibold">Birth</div>
            <div className="text-xs">{dob.toLocaleDateString()}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="font-semibold">Each row = 1 year</div>
            <div className="text-xs">52 weeks per year</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-semibold">{targetAge} years</div>
            <div className="text-xs">{totalWeeks.toLocaleString()} weeks total</div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LifeWeeksGrid;
