// influencer-dashboard_v2/src/admin/components/ReportsComponents/LineChartComponent.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LineChartComponent = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available for the selected filters.</p>;
  }

  // Detect if it's monthly or yearly data
  const isYearly = data[0]?.month !== undefined;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={isYearly ? "month" : "day"}
          label={{
            value: isYearly ? "Month" : "Day",
            position: "insideBottom",
            offset: -5,
          }}
          angle={-25}
          textAnchor="end"
          interval={0}
          height={60}
          style={{ fontSize: "12px" }}
        />
        <YAxis  label={{value: "Influencer Requests",angle: -90, position: "insideLeft",style: { textAnchor: "middle" },}} />
        <Tooltip formatter={(value) => `${value} Requests`} />
        <Line
          type="monotone"
          dataKey="total_requests"
          stroke="#3498db"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
