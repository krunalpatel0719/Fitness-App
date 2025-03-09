import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
  } from "recharts";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  
  export function DataBarChart({
    title,
    data,
    dataKey,
    timeframe,
    goalText = null,
    barColor = "#3b82f6",
    barSize,
    customTooltip,
    goal = 0,
    valueFormatter = (value) => value.toLocaleString(),
  }) {
    // Auto-calculate bar size based on timeframe if not provided
    const calculatedBarSize = barSize || (
      timeframe === "year" || timeframe === "6 months"
        ? 8
        : timeframe === "day"
        ? 12
        : 24
    );
  
    return (
      <Card className="border-0 shadow-md dark:bg-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center dark:text-white pb-2">
            <CardTitle>{title}</CardTitle>
            {goalText && (
              <Badge className="hover:bg-transparent bg-transparent text-sm font-semibold dark:text-white">
                {goalText}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                barSize={calculatedBarSize}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  fontSize={11}
                  tickMargin={5}
                  axisLine={false}
                  tickLine={false}
                  interval={timeframe === "day" ? 2 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  tickFormatter={(value) => (value === 0 ? "" : valueFormatter(value))}
                />
                <Tooltip content={customTooltip} />
                <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} label={false}>
                  {data.map((entry, index) => {
                    // Determine the fill color based on conditions
                    let fillColor = "#e5e7eb"; // Default gray for zero values
                    if (entry[dataKey] > 0) {
                      if (goal > 0 && entry[dataKey] > goal) {
                        fillColor = "#ef4444"; // Red for values exceeding goal
                      } else {
                        fillColor = barColor; // Normal color for positive values
                      }
                    }
                    
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }