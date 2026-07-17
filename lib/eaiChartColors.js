// Shared categorical chart palette for the EAI Platform (light theme).
// Use in fixed order for multi-segment charts (donut/bar/heatmap/map legends)
// so a given category (e.g. "IT Hardware") renders in the same color everywhere.
// Semantic status colors (success/amber/danger) live in tailwind.config.js and
// should be used directly for meaning (healthy/warning/critical), not indexed
// from this array.
export const CHART_COLORS = [
  '#00338D', // navy
  '#0091DA', // cobalt
  '#69B1E3', // skyBlue
  '#00A36C', // green
  '#6F2C91', // purple
  '#D4A017', // amber
  '#DC2626', // red
  '#94A3B8', // grey
];

export const CHART_COLOR_NAMES = {
  navy: '#00338D',
  cobalt: '#0091DA',
  skyBlue: '#69B1E3',
  green: '#00A36C',
  purple: '#6F2C91',
  amber: '#D4A017',
  red: '#DC2626',
  grey: '#94A3B8',
};

// Convenience: get a chart color by index, wrapping around if there are more
// categories than swatches.
export function chartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}
