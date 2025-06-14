
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LifeWeeksGrid from "@/components/LifeWeeksGrid";
import LifeStatsBar from "@/components/LifeStatsBar";

const MAX_AGE = 90;

const Index = () => {
  const [dob, setDob] = React.useState<Date | null>(null);
  const [showLifeGraphics, setShowLifeGraphics] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  const handleVisualizeLife = async () => {
    if (dob) {
      setIsGenerating(true);
      
      // Simulate generation time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowLifeGraphics(true);
      setIsGenerating(false);
      
      toast({
        title: "Life visualization complete! 🎉",
        description: "Your life journey is now displayed below. Each square represents one week of your life.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 pb-16">
      <header className="flex flex-col items-center justify-center pt-24 pb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
          Life in Weeks
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-center mb-6 leading-relaxed">
          Discover the profound perspective of viewing your entire life as a collection of weeks. 
          Each small square represents one week of a 90-year lifespan - a powerful visualization 
          that helps you appreciate time and make the most of every moment.
        </p>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <BirthdatePicker dob={dob} setDob={setDob} />
            {dob && !showLifeGraphics && !isGenerating && (
              <Button 
                onClick={handleVisualizeLife}
                size="lg"
                className="font-semibold"
              >
                Visualize My Life Journey
              </Button>
            )}
          </div>
          
          {isGenerating && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader className="h-6 w-6 animate-spin" />
                <span className="text-lg font-medium">Generating your life visualization...</span>
              </div>
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          {dob && showLifeGraphics && (
            <Button 
              onClick={() => {
                setShowLifeGraphics(false);
                setIsGenerating(false);
              }}
              variant="outline"
              size="lg"
              className="mt-4"
            >
              Choose Different Date
            </Button>
          )}
        </div>
      </header>
      
      {dob && showLifeGraphics && !isGenerating && (
        <>
          <LifeStatsBar dob={dob} targetAge={MAX_AGE} />
          <main className="w-full flex flex-col items-center">
            <LifeWeeksGrid dob={dob} targetAge={MAX_AGE} />
            <div className="mt-10 mb-8 max-w-xl text-center text-muted-foreground">
              <p className="flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-blue-500 mr-2 rounded-sm" />
                  Weeks lived
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-green-500 mr-2 ring-2 ring-green-300 rounded-sm" />
                  This week
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-gray-200 mr-2 rounded-sm" />
                  Weeks ahead
                </span>
              </p>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

function BirthdatePicker({
  dob,
  setDob,
}: {
  dob: Date | null;
  setDob: (d: Date | null) => void;
}) {
  const [month, setMonth] = React.useState<number>(new Date().getMonth());
  const [year, setYear] = React.useState<number>(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value));
  };

  const handleYearChange = (value: string) => {
    setYear(parseInt(value));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "min-w-[260px] justify-start text-left font-medium border-2 border-primary/40 hover:border-primary bg-white transition-all",
            !dob && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
          {dob ? format(dob, "PPP") : <span>Pick your date of birth</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <div className="p-3 border-b border-border">
          <div className="flex gap-2 items-center">
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((yearValue) => (
                  <SelectItem key={yearValue} value={yearValue.toString()}>
                    {yearValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={dob ?? undefined}
          onSelect={setDob}
          month={new Date(year, month)}
          onMonthChange={(newMonth) => {
            setMonth(newMonth.getMonth());
            setYear(newMonth.getFullYear());
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  );
}

export default Index;
