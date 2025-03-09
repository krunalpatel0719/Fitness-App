import { Card, CardContent } from "@/components/ui/card";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export function MetricCard({
  value,
  label,
  percentage = 100,
  trend = 0,
  timeframe,
  averageLabel,
  goalText,
  color = "#3b82f6",
  unit = "",
  showTrend = true,
  additionalInfo
}) {
  // Get trend info
  const getTrendInfo = (value) => {
    if (value > 0)
      return {
        color: "text-green-500",
        icon: <ArrowUpIcon className="w-4 h-4" />,
      };
    if (value < 0)
      return {
        color: "text-red-500",
        icon: <ArrowDownIcon className="w-4 h-4" />,
      };
    return {
      color: "text-yellow-500",
      icon: null,
    };
  };

  const { color: trendColor, icon: trendIcon } = getTrendInfo(trend);
  
  return (
    <Card className="border-0 shadow-md dark:bg-zinc-800">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 mb-4">
            <CircularProgressbarWithChildren
              value={percentage}
              styles={buildStyles({
                pathColor: color,
                trailColor: "#000000",
                textSize: "12px",
              })}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold dark:text-white">
                  {value}{unit}
                </span>
                <span className="capitalize text-xs text-gray-500 dark:text-gray-400 pt-1">
                  {label}
                </span>
              </div>
            </CircularProgressbarWithChildren>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {averageLabel}
            </h3>
            {showTrend && (
              <div className="flex items-center justify-center mt-1">
                {trend !== 0 ? (
                  <>
                    <span className={`text-xs font-semibold ${trendColor} flex items-center`}>
                      {trendIcon}
                      {Math.abs(trend)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      vs. previous {timeframe}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    No previous {timeframe} data
                  </span>
                )}
              </div>
            )}
            {goalText && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {goalText}
              </div>
            )}
            {additionalInfo && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {additionalInfo}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}