import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption, ECharts } from 'echarts';

/**
 * Custom hook to initialize and manage an Apache ECharts instance.
 * Handles resizing, cleanup, and option updates.
 *
 * @param options - The ECharts options object.
 * @param theme - The theme to apply (e.g., 'light' or 'dark', or a custom object).
 * @returns A ref to attach to the chart container div.
 */
export function useECharts(options: Readonly<EChartsOption>, theme?: Readonly<string | object>): React.MutableRefObject<HTMLDivElement | null> {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  // Initialize and dispose chart
  useEffect(() => {
    // eslint-disable-next-line functional/prefer-immutable-types
    const container = chartRef.current;
    if (!container) return;

    if (!chartInstance.current) {
      // eslint-disable-next-line functional/immutable-data
      chartInstance.current = echarts.init(container);
    }

    // eslint-disable-next-line functional/prefer-immutable-types
    const chart = chartInstance.current;

    // Handle Resize
    // eslint-disable-next-line functional/prefer-immutable-types
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      // eslint-disable-next-line functional/immutable-data
      chartInstance.current = null;
    };
  }, []); // Run once on mount

  // Update options and theme
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    // Apply options.
    // Note: We might want to handle 'notMerge' or 'lazyUpdate' as arguments in the future.
    chart.setOption(options);

    // Theme updates usually require disposing and re-initializing in ECharts if passing a registered theme string name,
    // but explicit style options (like we do for dark mode text color) can be updated via setOption.
    // Since we handle "theme" via option overrides in the consumer, this effect mainly syncs options.

  }, [options, theme]);

  return chartRef;
}
