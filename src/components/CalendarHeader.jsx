//// /src/components/CalendarHeader.jsx
import { format, subDays, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export function CalendarHeader({ title, selectedDate, setSelectedDate }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">
        {title}
      </h1>
      <div className="flex items-center sm:space-x-2 bg-white dark:bg-zinc-800 rounded-lg shadow sm:p-2 dark:shadow-none">
        <Button
          className="bg-transparent sm:p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
          variant=""
          size="icon"
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
        >
          <LuChevronLeft className="text-black dark:text-white h-4 w-4 sm:min-h-6 sm:min-w-6" />
        </Button>
        <div className="flex flex-col items-center  sm:px-6">
          <span className="tracking-tight text-nowrap text-xs sm:text-lg font-semibold dark:text-white">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <Button
          className="bg-transparent p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
          variant=""
          size="icon"
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
        >
          <LuChevronRight className="text-black dark:text-white h-4 w-4 sm:min-h-6 sm:min-w-6" />
        </Button>
      </div>
    </div>
  );
}