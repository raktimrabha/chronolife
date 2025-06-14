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

  // Calculate cell size based on viewport width
  const [cellSize, setCellSize] = React.useState(12);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth - 40; // Account for padding
      const maxCellSize = 12; // Max size of each cell
      const minCellSize = 8;  // Min size of each cell
      const calculatedSize = Math.max(minCellSize, Math.min(maxCellSize, Math.floor(containerWidth / GRID_COLUMNS)));
      setCellSize(calculatedSize);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Only show every 5th year label on mobile
  const yearLabelInterval = window.innerWidth < 640 ? 10 : 5;
  // Only show every 13th week label on mobile (quarterly)
  const weekLabelInterval = window.innerWidth < 640 ? 13 : 5;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col items-center w-full px-2 sm:px-4" ref={containerRef}>
        <div className="flex items-start gap-1 sm:gap-2 w-full max-w-full overflow-x-auto pb-2">
          {/* Age labels on the left */}
          <div className="flex flex-col items-end sticky left-0 bg-background z-10 pr-1">
            {/* Age heading */}
            <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1 h-6 flex items-center justify-center">
              Age
            </div>
            {/* Year labels - aligned with grid rows */}
            <div className="flex flex-col" style={{ gap: '1px' }}>
              {years.map((year) => (
                <div 
                  key={year} 
                  className="text-[10px] sm:text-xs text-muted-foreground font-mono flex items-center justify-end pr-1" 
                  style={{ 
                    height: `${cellSize}px`,
                    minWidth: '24px',
                    opacity: year % yearLabelInterval === 0 ? 1 : 0.3
                  }}
                >
                  {year % yearLabelInterval === 0 ? year : ''}
                </div>
              ))}
            </div>
          </div>
          
          {/* Main grid container */}
          <div className="relative">
            {/* Week of the Year heading and week number labels */}
            <div className="flex flex-col mb-1">
              <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1 text-center h-6 flex items-center justify-center">
                Week of Year
              </div>
              {/* Week number labels - aligned with grid columns */}
              <div className="flex" style={{ gap: '1px' }}>
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                  <div 
                    key={weekIndex} 
                    className="text-[10px] sm:text-xs text-muted-foreground font-mono flex items-center justify-center" 
                    style={{ 
                      width: `${cellSize}px`, 
                      height: '12px',
                      opacity: weekIndex % weekLabelInterval === 0 ? 1 : 0.3
                    }}
                  >
                    {weekIndex % weekLabelInterval === 0 ? weekIndex : ''}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grid */}
            <div
              className="rounded-lg border bg-card shadow-lg p-2 sm:p-4"
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(52, ${cellSize}px)`,
                gap: '1px',
                width: 'max-content',
                maxWidth: '100%',
                overflow: 'visible'
              }}
            >
              {Array.from({ length: totalWeeks }).map((_, i) => {
                const week = i % GRID_COLUMNS;
                const year = Math.floor(i / GRID_COLUMNS);
                const weekDate = new Date(dob);
                weekDate.setDate(weekDate.getDate() + i * 7);
                
                let colorClass = "bg-gray-200 dark:bg-gray-700"; // Future weeks - light gray
                let outlineClass = "";
                
                if (i < weekNumNow) {
                  colorClass = "bg-blue-500 dark:bg-blue-600"; // Lived weeks - blue
                }
                if (i === weekNumNow) {
                  colorClass = "bg-green-500 dark:bg-green-600"; // Current week - green
                  outlineClass = "ring-1 ring-green-300 dark:ring-green-400";
                }
                
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "cursor-pointer transition-all duration-100 hover:scale-110 hover:z-10",
                          colorClass,
                          outlineClass,
                          {
                            'rounded-tl-sm': week === 0,
                            'rounded-tr-sm': week === 51,
                            'rounded-bl-sm': i >= totalWeeks - 52 && week === 0,
                            'rounded-br-sm': i >= totalWeeks - 52 && week === 51,
                          }
                        )}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          minWidth: `${cellSize}px`,
                          minHeight: `${cellSize}px`,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs rounded shadow z-50">
                      <div>
                        <span className="font-mono font-semibold">Age {year}, Week {week + 1}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {weekDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      {i < weekNumNow && <div className="text-[10px] text-blue-600 dark:text-blue-400">Lived</div>}
                      {i === weekNumNow && <div className="text-[10px] font-bold text-green-600 dark:text-green-400">This week</div>}
                      {i > weekNumNow && <div className="text-[10px] text-muted-foreground">Future</div>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Bottom labels */}
        <div className="mt-4 sm:mt-6 text-center w-full max-w-3xl text-xs sm:text-sm text-muted-foreground px-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col items-start sm:items-center">
              <div className="font-semibold">Birth</div>
              <div className="text-[10px] sm:text-xs">{dob.toLocaleDateString()}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-semibold">Each row = 1 year</div>
              <div className="text-[10px] sm:text-xs">{cellSize > 10 ? '52 weeks per year' : '52w/year'}</div>
            </div>
            <div className="flex flex-col items-end sm:items-center col-span-2 sm:col-span-1 mt-1 sm:mt-0">
              <div className="font-semibold">{targetAge} years</div>
              <div className="text-[10px] sm:text-xs">{totalWeeks.toLocaleString()} weeks total</div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LifeWeeksGrid;
