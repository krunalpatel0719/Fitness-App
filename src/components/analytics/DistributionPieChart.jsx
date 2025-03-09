import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
  } from "recharts";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  
  export function DistributionPieChart({
    title,
    data,
    dataKey,
    colorMap,
    legendItems = null,
  }) {
    // If legendItems aren't provided, create them from data
    const displayedLegend = legendItems || data.map(item => ({
      name: item.name,
      value: item.value || item[dataKey],
      color: colorMap[item.name] || "#6b7280" // Default gray
    }));
  
    return (
      <Card className="border-0 shadow-md dark:bg-zinc-800 dark:text-white">
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="w-72 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey={dataKey}
                    paddingAngle={5}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colorMap[entry.name] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
  
          <div className="flex flex-wrap justify-around mt-4">
            {displayedLegend.map((item, index) => (
              <div key={index} className="text-center mb-2">
                <div
                  className="text-2xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.value}
                  {item.unit || ""}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }