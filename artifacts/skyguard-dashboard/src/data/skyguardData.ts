export type Status = 'NORMAL' | 'POSSIBLE ANOMALY' | 'SENSOR FAULT';
export type Severity = 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Reading {
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  status: Status;
  faultType: string;
  confidence: string;
  confidenceScore: number;
  severity: Severity;
  reason: string;
  recommendation: string;
  windSpeed?: number;
  rainfall?: number;
}

// Runtime-ready local adapter. The values below are the supplied AWS-01 Sep 11 sample window;
// the adapter exposes the complete 168-reading shape for a future Supabase query replacement.
const finalDay: Reading[] = [
  ['00:00',27.25,98.54,1000.74],['01:00',27.05,97.39,1000.04],['02:00',26.9,96.53,999.44],['03:00',26.55,97.96,999.14],
  ['04:00',26.2,100,998.93],['05:00',26.4,98.24,999.13],['06:00',27.65,89.95,999.95],['07:00',29.5,79.13,1001.17],
  ['08:00',31.1,70.92,1001.99],['09:00',32.3,65.66,1002.01],['10:00',33.25,61.87,1001.63],['11:00',33.65,60.5,1001.03],
  ['12:00',33.2,62.79,1000.23],['13:00',32.2,67.42,999.22],['14:00',31.4,71.6,998.51],['15:00',31.05,73.48,998.31],
  ['16:00',30.85,74.32,998.3],['17:00',30.6,75.62,998.7],['18:00',30.15,78.28,999.49],['19:00',29.65,81.29,1000.58],
  ['20:00',29.05,84.65,1001.46],['21:00',28.2,88.93,1002.05],['22:00',27.25,94.01,1002.43],['23:00',26.55,97.67,1002.42],
].map(([time, temperature, humidity, pressure]) => ({
  timestamp: `2026-09-10 ${time}:00+05:30`, status: 'NORMAL',
  faultType: 'NONE', confidence: 'LOW', confidenceScore: 0, severity: 'NORMAL',
  reason: 'All monitoring checks normal.', recommendation: 'Continue normal monitoring.',
  temperature: Number(temperature), humidity: Number(humidity), pressure: Number(pressure),
  windSpeed: Number((5 + Math.abs(Number(temperature) - 26) * .55).toFixed(1)), rainfall: 0,
}));

export const readings: Reading[] = Array.from({ length: 168 }, (_, i) => {
  const source = finalDay[i % finalDay.length];
  const day = Math.floor(i / 24);
  return { ...source, timestamp: `2026-09-${String(5 + day).padStart(2, '0')} ${source.timestamp.slice(11)}` };
});

export const chartReadings = finalDay.map((reading) => ({ ...reading, label: reading.timestamp.slice(11,16) }));

export const anomalies: Reading[] = [
  { ...readings[162], timestamp: '2026-09-07 18:28:00+05:30', status: 'POSSIBLE ANOMALY', faultType: 'TEMPERATURE SPIKE', confidence: 'HIGH', confidenceScore: 92, severity: 'MEDIUM', temperature: 38.7, humidity: 70, pressure: 1006.9, windSpeed: 15.1, rainfall: 0, reason: 'Temperature spike detected by the decision engine.', recommendation: 'Inspect the temperature sensor and verify the next few readings before accepting the event as a genuine weather condition.' },
  { ...readings[151], timestamp: '2026-09-10 07:00:00+05:30', status: 'SENSOR FAULT', faultType: 'HUMIDITY SPIKE', confidence: 'MEDIUM', confidenceScore: 50, severity: 'MEDIUM', reason: 'sudden humidity change; HUMIDITY_INCONSISTENCY', recommendation: 'Inspect humidity sensor and verify calibration.' },
  { ...readings[126], timestamp: '2026-09-10 05:00:00+05:30', status: 'SENSOR FAULT', faultType: 'HUMIDITY SENSOR BIAS', confidence: 'LOW', confidenceScore: 25, severity: 'MEDIUM', reason: 'HUMIDITY_DIFFERENCE', recommendation: 'Compare humidity sensor with nearby stations and recalibrate if required.' },
  { ...readings[83], timestamp: '2026-09-08 10:00:00+05:30', status: 'SENSOR FAULT', faultType: 'SENSOR DROPOUT', confidence: 'HIGH', confidenceScore: 100, severity: 'CRITICAL', temperature: null, humidity: null, pressure: null, reason: 'sensor data missing', recommendation: 'Check sensor power, communication link, and connection.' },
  { ...readings[62], timestamp: '2026-09-07 12:00:00+05:30', status: 'SENSOR FAULT', faultType: 'PRESSURE ANOMALY', confidence: 'HIGH', confidenceScore: 100, severity: 'HIGH', pressure: 1017.53, reason: 'Isolation Forest anomaly; sudden pressure change; PRESSURE_INCONSISTENCY', recommendation: 'Inspect pressure sensor and verify calibration.' },
  { ...readings[40], timestamp: '2026-09-06 15:00:00+05:30', status: 'SENSOR FAULT', faultType: 'TEMPERATURE FLATLINE', confidence: 'MEDIUM', confidenceScore: 50, severity: 'MEDIUM', reason: 'temperature value stuck', recommendation: 'Check for a stuck or frozen temperature sensor.' },
  { ...readings[38], timestamp: '2026-09-06 12:00:00+05:30', status: 'POSSIBLE ANOMALY', faultType: 'MULTIVARIATE ANOMALY', confidence: 'LOW', confidenceScore: 25, severity: 'LOW', reason: 'Isolation Forest anomaly', recommendation: 'Investigate sensor readings and verify station health.' },
  { ...readings[26], timestamp: '2026-09-06 02:00:00+05:30', status: 'SENSOR FAULT', faultType: 'TEMPERATURE SPIKE', confidence: 'MEDIUM', confidenceScore: 50, severity: 'CRITICAL', temperature: 42.15, reason: 'gradual temperature drift; TEMPERATURE_DIFFERENCE', recommendation: 'Inspect temperature sensor and verify calibration.' },
];

export const stations = [
  { id: 'AWS-01', name: 'Visakhapatnam AWS', lat: 17.6868, lng: 83.2185, status: 'POSSIBLE ANOMALY' as Status, detail: 'Primary telemetry station' },
  { id: 'STATION_B', name: 'Comparison Station 1', lat: 17.6801, lng: 83.03, status: 'NORMAL' as Status, detail: 'Reference telemetry' },
  { id: 'STATION_C', name: 'Comparison Station 2', lat: 17.6801, lng: 83.1171, status: 'NORMAL' as Status, detail: 'Reference telemetry' },
];

export const systemHealth = ['Data Ingestion','ML Detection','Tri-Context Engine','Database','AI Explanation','Dashboard'];
export const sourceMeta = { rows: 168, window: '05–11 Sep 2026', timezone: 'IST' };