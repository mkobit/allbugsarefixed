import React, { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { getThemeColor } from "../lib/theme";
import { useECharts } from "../hooks/useECharts";
import { useDarkMode } from "../hooks/useDarkMode";

interface EChartProps {
  readonly options: EChartsOption;
  readonly height?: string;
  readonly width?: string;
}

export default function EChart({ options, height = "400px", width = "100%" }: Readonly<EChartProps>) {
  const isDark = useDarkMode();

  // Merge user options with theme-specific overrides
  const finalOptions = useMemo(() => {
    return {
      ...options,
      backgroundColor: "transparent",
      darkMode: isDark,
      textStyle: {
        color: getThemeColor(isDark),
        ...(options.textStyle || {}),
      },
    } as EChartsOption;
  }, [options, isDark]);

  const chartRef = useECharts(finalOptions);

  return (
    <div
      ref={chartRef}
      style={{ height, width }}
      className="echart-container my-8 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 bg-white dark:bg-brand-surface/50"
    />
  );
}
