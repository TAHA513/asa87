import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// نوع موحد للبيانات
type ChartData = {
  date: string;
  value: number;
  secondaryValue?: number;
};

// مكون الرسم البياني الخطي
export function MetricsLineChart({
  data,
  title,
  description,
  primaryMetric,
  secondaryMetric,
  primaryColor = "#8884d8",
  secondaryColor = "#82ca9d",
}: {
  data: ChartData[];
  title: string;
  description: string;
  primaryMetric: string;
  secondaryMetric?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ar-IQ')}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => value.toLocaleString('ar-IQ')}
              labelFormatter={(label) => new Date(label).toLocaleDateString('ar-IQ')}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={primaryMetric}
              stroke={primaryColor}
              activeDot={{ r: 8 }}
            />
            {secondaryMetric && (
              <Line
                type="monotone"
                dataKey="secondaryValue"
                name={secondaryMetric}
                stroke={secondaryColor}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// مكون الرسم البياني المساحي
export function MetricsAreaChart({
  data,
  title,
  description,
  primaryMetric,
  secondaryMetric,
  primaryColor = "#8884d8",
  secondaryColor = "#82ca9d",
}: {
  data: ChartData[];
  title: string;
  description: string;
  primaryMetric: string;
  secondaryMetric?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ar-IQ')}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => value.toLocaleString('ar-IQ')}
              labelFormatter={(label) => new Date(label).toLocaleDateString('ar-IQ')}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={primaryMetric}
              fill={primaryColor}
              stroke={primaryColor}
              fillOpacity={0.3}
            />
            {secondaryMetric && (
              <Area
                type="monotone"
                dataKey="secondaryValue"
                name={secondaryMetric}
                fill={secondaryColor}
                stroke={secondaryColor}
                fillOpacity={0.3}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// مكون مخصص للتلميح
export function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter = (value: number) => value.toLocaleString('ar-IQ'),
}: TooltipProps<number, string> & {
  valueFormatter?: (value: number) => string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-2">
        <p className="text-sm font-medium">
          {new Date(label).toLocaleDateString('ar-IQ')}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {valueFormatter(entry.value as number)}
          </p>
        ))}
      </div>
    );
  }

  return null;
}
