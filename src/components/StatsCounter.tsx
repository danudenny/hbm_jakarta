import React from "react";
import CountUp from "react-countup";

type StatItem = {
  value: number;
  suffix: string;
  label: string;
  duration?: number;
};

type StatsCounterProps = {
  stats?: StatItem[];
};

const StatsCounter: React.FC<StatsCounterProps> = ({ stats }) => {
  // Default stats if none are provided
  const defaultStats = [
    { value: 5000, suffix: "", label: "Visas Processed", duration: 2.5 },
    { value: 98, suffix: "%", label: "Success Rate", duration: 2.5 },
    { value: 200, suffix: "+", label: "Partner Companies", duration: 2.5 },
    { value: 10, suffix: "+", label: "Years Experience", duration: 2.5 },
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
      {displayStats.map((stat, index) => (
        <div key={index} className="stats-card text-center">
          <CountUp
            end={stat.value}
            duration={stat.duration || 2.5}
            separator=","
            suffix={stat.suffix}
            className="text-4xl font-bold mb-2"
          />
          <p className="text-white/80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;
