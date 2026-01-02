import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface EChartProps {
  options: EChartsOption;
  height?: string;
  width?: string;
}

export default function EChart({ options, height = '400px', width = '100%' }: EChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    const getThemeColor = (isDark: boolean) => (isDark ? '#e2e8f0' : '#1e293b');

    const updateChart = () => {
      const isDark = document.documentElement.classList.contains('dark');

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
    };

    updateChart();

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateChart();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      chart.dispose();
      chartInstance.current = null;
    };
  }, [options]);

  return (
    <div
      ref={chartRef}
      style={{ height, width }}
      className="echart-container my-8 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 bg-white dark:bg-brand-surface/50"
    />
  );
}
