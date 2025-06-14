import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, Loader, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LifeWeeksGrid from "@/components/LifeWeeksGrid";
import LifeStatsBar from "@/components/LifeStatsBar";
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

const MAX_AGE = 90;

// Lazy load the Calendar component with Vite's dynamic import
const LazyCalendar = React.lazy(() => import("@/components/ui/calendar").then(mod => ({
  default: mod.Calendar
})));

// Loading component for the calendar
const CalendarLoader = () => (
  <div className="h-[300px] w-full flex items-center justify-center">
    <div className="h-8 w-8 border-2 border-gray-300 rounded-full border-t-gray-800 animate-spin" />
  </div>
);

interface Event {
  id: string;
  type: 'global' | 'personal';
  title: string;
  date: Date;
  description: string;
  color: string;
}

interface EventsByYear {
  [year: number]: Event[];
}

const globalEvents: Event[] = [
  // Add global events here...
];

const Index = () => {
  const [dob, setDob] = React.useState<Date | null>(null);
  const [showLifeGraphics, setShowLifeGraphics] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [selectedDatePreview, setSelectedDatePreview] = React.useState<string | null>(null);
  
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [personalEvents, setPersonalEvents] = React.useState<Event[]>([]);
  const [showGlobalEvents, setShowGlobalEvents] = React.useState(true);
  const [showPersonalEvents, setShowPersonalEvents] = React.useState(true);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

  const allEvents = React.useMemo(() => {
    const events = [
      ...(showGlobalEvents ? globalEvents : []),
      ...(showPersonalEvents ? personalEvents : [])
    ];
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [showGlobalEvents, showPersonalEvents, personalEvents]);

  const eventsByYear = React.useMemo<EventsByYear>(() => {
    return allEvents.reduce<EventsByYear>((acc, event) => {
      const year = event.date.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(event);
      return acc;
    }, {});
  }, [allEvents]);

  const handleAddEvent = (event: Omit<Event, 'id' | 'type'>) => {
    const newEvent: Event = {
      ...event,
      id: `personal-${Date.now()}`,
      type: 'personal' as const
    };
    setPersonalEvents(prev => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setPersonalEvents(prev => prev.filter(event => event.id !== id));
  };

  const handleDateSelect = (date: Date | null) => {
    setDob(date);
    if (date) {
      setSelectedDatePreview(format(date, 'MMMM d, yyyy'));
      // Auto-close the calendar after selection
      setTimeout(() => setIsCalendarOpen(false), 200);
    } else {
      setSelectedDatePreview(null);
    }
  };

  const handleVisualizeLife = async () => {
    if (dob) {
      // Use CSS transitions for smoother visual feedback
      const element = document.getElementById('visualization');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Start the generation process
      setIsGenerating(true);
      setShowLifeGraphics(false);
      
      // Use requestAnimationFrame for smoother animation
      const startTime = performance.now();
      const duration = 800; // Total animation duration in ms
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Update progress (0-100)
        setGenerationProgress(progress * 100);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete
          setShowLifeGraphics(true);
          // Small delay to ensure smooth transition
          requestAnimationFrame(() => {
            setIsGenerating(false);
          });
        }
      };
      
      // Start the animation
      requestAnimationFrame(animate);
    }
  };

  const EventModal: React.FC<{ isOpen: boolean; onClose: () => void; onAddEvent: (event: Omit<Event, 'id' | 'type'>) => void }> = ({ isOpen, onClose, onAddEvent }) => {
    const [title, setTitle] = React.useState('');
    const [date, setDate] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [color, setColor] = React.useState('#3B82F6');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !date) return;
      
      onAddEvent({
        title,
        date: new Date(date),
        description,
        color
      });
      
      // Reset form
      setTitle('');
      setDate('');
      setDescription('');
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Personal Event</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex gap-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
              >
                Add Event
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 pb-16 sm:px-6 lg:px-8">
      <header className="flex flex-col items-center justify-center pt-20 pb-12 sm:pt-28 sm:pb-16">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-amber-600 uppercase rounded-full bg-amber-50 mb-4">
            Life Visualization
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          <span className="relative">
            <span className="relative z-10">Chrono Life</span>
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Chrono Life
            </span>
          </span>
        </h1>
        <p className="max-w-2xl text-xl sm:text-2xl font-medium text-gray-700 dark:text-gray-300 text-center mb-6 leading-relaxed">
          Visualize Your Life in Weeks
        </p>
        <p className="max-w-2xl text-base sm:text-lg text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
          A powerful perspective on how you spend your time. See your entire life at a glance and make the most of every moment.
        </p>
        
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label htmlFor="birthdate" className="block text-sm font-medium text-muted-foreground">
              Your date of birth
            </label>
            <BirthdatePicker 
              dob={dob} 
              setDob={handleDateSelect}
              isOpen={isCalendarOpen}
              onOpenChange={setIsCalendarOpen}
            />
            {selectedDatePreview && (
              <p className="text-sm text-muted-foreground mt-1 animate-in fade-in">
                Selected: <span className="font-medium text-foreground">{selectedDatePreview}</span>
              </p>
            )}
          </div>

          <Button
            onClick={handleVisualizeLife}
            size="lg"
            disabled={!dob || isGenerating}
            className={`w-full transition-all duration-200 ${
              !dob ? 'opacity-70' : 'hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Progress className="h-4 w-4 border-2 border-white/30 rounded-full border-t-white animate-spin" />
                Generating...
              </div>
            ) : (
              'Visualize My Life Journey'
            )}
          </Button>
        </div>

        {isGenerating && (
          <div className="mt-8 w-full max-w-2xl mx-auto space-y-4 animate-pulse" id="visualization">
            <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 52 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted/50 rounded-sm"></div>
              ))}
            </div>
          </div>
        )}
      </header>

      {dob && showLifeGraphics && !isGenerating && (
        <div id="visualization" className="animate-in fade-in duration-500">
          <LifeStatsBar dob={dob} targetAge={MAX_AGE} />
          <main className="flex-1 flex flex-col items-center">
            <LifeWeeksGrid dob={dob} targetAge={MAX_AGE} />
            <div className="w-full max-w-3xl mx-auto mt-8 px-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Life Events</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="show-global"
                        checked={showGlobalEvents}
                        onChange={() => setShowGlobalEvents(!showGlobalEvents)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="show-global" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Global Events
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="show-personal"
                        checked={showPersonalEvents}
                        onChange={() => setShowPersonalEvents(!showPersonalEvents)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="show-personal" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        My Events
                      </label>
                    </div>
                    <Button
                      onClick={() => setShowEventModal(true)}
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Event</span>
                    </Button>
                  </div>
                </div>

                {Object.keys(eventsByYear).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(eventsByYear)
                      .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                      .map(([year, events]) => (
                        <div key={year} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          <h3 className="text-lg font-medium mb-3">{year}</h3>
                          <div className="space-y-3">
                            {events
                              .sort((a, b) => a.date.getTime() - b.date.getTime())
                              .map((event) => (
                                <div
                                  key={event.id}
                                  className={`p-3 rounded-lg border-l-4 ${
                                    event.type === 'global' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 border-purple-500'
                                  }`}
                                  style={{ borderLeftColor: event.color }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{event.title}</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {format(event.date, 'MMMM d, yyyy')}
                                      </p>
                                      {event.description && (
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                          {event.description}
                                        </p>
                                      )}
                                    </div>
                                    {event.type === 'personal' && (
                                      <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="text-gray-400 hover:text-red-500"
                                        aria-label="Delete event"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {showGlobalEvents || showPersonalEvents
                        ? 'No events found. Try adjusting your filters.'
                        : 'Enable event types to see events.'}
                    </p>
                    {!showPersonalEvents && (
                      <Button
                        onClick={() => setShowPersonalEvents(true)}
                        variant="ghost"
                        className="mt-4 text-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add your first event
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      <footer className="mt-auto py-8 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span> {new Date().getFullYear()} Chrono Life</span>
              <span>•</span>
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Terms
              </a>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a 
                href="https://github.com/raktimrabha" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://twitter.com/rktmrbh" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com/in/raktimrabha" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-blue-700 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com/@raktimrabha" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <span className="sr-only">YouTube</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-4 text-center md:text-left text-xs text-gray-500 dark:text-gray-400">
            <p>
              Made with ❤️ by{' '}
              <a 
                href="https://raktimrabha.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                @raktimrabha
              </a>
              {' '}to help you make the most of your time
            </p>
          </div>
        </div>
      </footer>
      <EventModal 
        isOpen={showEventModal} 
        onClose={() => setShowEventModal(false)} 
        onAddEvent={handleAddEvent} 
      />
    </div>
  );
};

interface BirthdatePickerProps {
  dob: Date | null;
  setDob: (date: Date | null) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function BirthdatePicker({ dob, setDob, isOpen, onOpenChange }: BirthdatePickerProps) {
  const [month, setMonth] = React.useState<number>(new Date().getMonth());
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Format the selected date for display
  const formattedDate = dob ? format(dob, 'MMMM d, yyyy') : 'Select your birthdate';

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !dob && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center justify-between px-4 pt-4">
          <Select
            value={month.toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[140px] mr-2">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={m} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={year.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="h-60 overflow-y-auto">
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isClient && (
          <React.Suspense fallback={<CalendarLoader />}>
            <LazyCalendar
              mode="single"
              selected={dob || undefined}
              onSelect={(date) => {
                setDob(date || null);
                onOpenChange?.(false);
              }}
              month={new Date(year, month)}
              onMonthChange={(date) => {
                setMonth(date.getMonth());
                setYear(date.getFullYear());
              }}
              className="p-3"
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </React.Suspense>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Index;
