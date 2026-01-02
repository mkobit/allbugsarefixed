import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

/**
 * A Custom Element wrapper for Apache ECharts.
 * Handles lifecycle, resizing, and theme changes.
 */
export class ChartElement extends HTMLElement {
  private _options: EChartsOption | null = null;
  private chart: echarts.ECharts | null = null;

  constructor() {
    super();
  }

  get options(): EChartsOption | null {
    return this._options;
  }

  set options(val: EChartsOption) {
    this._options = val;
    this.render();
  }

  connectedCallback() {
    // "Property Upgrade" Pattern
    // When a custom element is defined after the HTML is parsed, properties set on the
    // element (like `el.options = ...`) might be created as own properties, shadowing
    // the class accessors. We capture the value, delete the own property, and re-set it
    // to trigger the setter on the prototype.
    // See: https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
    if (Object.prototype.hasOwnProperty.call(this, 'options')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (this as any).options;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (this as any).options;
      this.options = value;
    }

    // If options are set, render.
    if (this._options && !this.chart) {
      this.render();
    }

    // Handle Resize
    window.addEventListener('resize', this.handleResize);

    // Handle Theme Change
    this.setupThemeObserver();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }

  private handleResize = () => {
    this.chart?.resize();
  };

  private getThemeColor(isDark: boolean): string {
    return isDark ? '#e2e8f0' : '#1e293b'; // slate-200 : slate-800
  }

  private render() {
    if (!this._options) return;

    // Initialize chart if not exists
    if (!this.chart) {
      this.chart = echarts.init(this);
    }

    const isDark = document.documentElement.classList.contains('dark');

    // Clone options to avoid mutating the source if possible, and merge theme
    const finalOptions = {
        ...this._options,
        backgroundColor: 'transparent',
        darkMode: isDark,
    };

    if (!finalOptions.textStyle) {
        finalOptions.textStyle = {};
    }
    finalOptions.textStyle.color = this.getThemeColor(isDark);

    this.chart.setOption(finalOptions);
  }

  private getThemeOptions(isDark: boolean): EChartsOption {
      return {
          backgroundColor: 'transparent',
          darkMode: isDark,
          textStyle: {
              color: this.getThemeColor(isDark)
          }
      };
  }

  private setupThemeObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          if (this.chart) {
             this.chart.setOption(this.getThemeOptions(isDarkNow));
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }
}

customElements.define('blog-echart', ChartElement);
