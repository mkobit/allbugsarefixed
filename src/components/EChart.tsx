import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getThemeColor } from '../utils/theme';

interface EChartProps {
  options: EChartsOption;
  height?: string;
  width?: string;
}

/**
 * Hook to detect if the dark mode class is present on the document element.
 * It uses a MutationObserver to react to class changes.
 */
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initial check
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributeFilter: ['class'], attributes: true });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function EChart({ options, height = '400px', width = '100%' }: EChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const isDark = useDarkMode();

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // Update options when data or theme changes
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const finalOptions: EChartsOption = {
      ...options,
      backgroundColor: 'transparent',
      darkMode: isDark,
      textStyle: {
        color: getThemeColor(isDark),
        ...(options.textStyle || {}),
      },
    };

    chart.setOption(finalOptions);
  }, [options, isDark]);

  // Handle resizing with ResizeObserver
  useEffect(() => {
    const chart = chartInstance.current;
    const container = chartRef.current;
    if (!chart || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ height, width }}
      className="echart-container my-8 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 bg-white dark:bg-brand-surface/50"
    />
  );
}
