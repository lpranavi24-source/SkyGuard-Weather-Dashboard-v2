import { AlertTriangle, CloudRain, Compass, Droplets, Gauge, Radio, RefreshCw, Thermometer, Wind, WifiOff } from 'lucide-react';
import type { FeedMode, MetricKey } from './command-center-controls';
import type { WeatherSnapshot } from '@/data/weatherApi';

type LiveWeatherConsoleProps = {
  snapshot: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  feedMode: FeedMode;
  selectedMetrics: MetricKey[];
  simulationLabel: string | null;
  onRetry: () => void;
};

const directionLabel = (degrees: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % directions.length];
};

const riskFor = (snapshot: WeatherSnapshot, simulationLabel: string | null) => {
  if (simulationLabel === 'Cyclone' || simulationLabel === 'Flash Flood') return 'Critical';
  if (simulationLabel === 'Heatwave' || simulationLabel === 'Sensor Blackout') return 'Warning';
  if (snapshot.windGust >= 55 || snapshot.rain >= 12 || snapshot.temperature >= 40) return 'Warning';
  return 'Nominal';
};

function RiskBadge({ level }: { level: string }) {
  const classes =
    level === 'Critical'
      ? 'border-red-400/35 bg-red-400/10 text-red-300'
      : level === 'Warning'
        ? 'border-amber-300/35 bg-amber-300/10 text-amber-200'
        : 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300';
  return (
    <span data-testid={`status-live-risk-${level.toLowerCase()}`} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono-sg text-[10px] uppercase tracking-wider ${classes}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current status-pulse" />
      {level}
    </span>
  );
}

function Metric({ icon: Icon, label, value, detail, active }: { icon: typeof Thermometer; label: string; value: string; detail: string; active: boolean }) {
  return (
    <div className={`rounded-xl border p-3 transition ${active ? 'border-cyan-300/20 bg-cyan-300/[.045]' : 'border-white/[.06] bg-white/[.018] opacity-45'}`}>
      <div className="flex items-center justify-between gap-2">
        <Icon size={15} className="text-cyan-300" />
        <span className="font-mono-sg text-[9px] uppercase tracking-wider text-slate-600">{detail}</span>
      </div>
      <div className="mt-3 font-mono-sg text-lg text-slate-100">{value}</div>
      <div className="mt-1 text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

export function LiveWeatherConsole({ snapshot, loading, error, feedMode, selectedMetrics, simulationLabel, onRetry }: LiveWeatherConsoleProps) {
  const risk = snapshot ? riskFor(snapshot, simulationLabel) : 'Warning';
  const active = (metric: MetricKey) => selectedMetrics.includes(metric);

  return (
    <section id="live-weather" className="scroll-mt-24">
      <div className="panel scanlines relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="relative flex flex-col justify-between gap-4 border-b border-white/[.08] pb-5 lg:flex-row lg:items-start">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
              <Radio size={18} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono-sg text-[10px] uppercase tracking-[.2em] text-cyan-300/70">
                Live atmospheric feed
                <span className="text-slate-700">/</span>
                {feedMode === 'live' ? 'Open-Meteo current' : 'Synthetic stream'}
              </div>
              <h2 className="mt-1 text-xl font-semibold text-slate-100">Regional conditions</h2>
              <p className="mt-1 text-xs text-slate-500">
                {snapshot ? `${snapshot.region.name} · ${snapshot.region.latitude.toFixed(4)}° N · ${snapshot.region.longitude.toFixed(4)}° E` : 'Waiting for a regional observation'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {simulationLabel && <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 font-mono-sg text-[10px] uppercase tracking-wider text-red-300">Scenario: {simulationLabel}</span>}
            <RiskBadge level={risk} />
          </div>
        </div>

        {loading && !snapshot ? (
          <div data-testid="status-live-weather-loading" className="relative grid gap-3 pt-5 sm:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-white/[.04]" />)}
          </div>
        ) : error && !snapshot ? (
          <div data-testid="status-live-weather-error" className="relative flex flex-col items-start gap-3 pt-5 sm:flex-row sm:items-center">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-400/10 text-red-300"><WifiOff size={17} /></div>
            <div className="flex-1"><div className="text-sm font-medium text-slate-200">Live feed unavailable</div><p className="mt-1 text-xs text-slate-500">{error}</p></div>
            <button type="button" data-testid="button-retry-weather" onClick={onRetry} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"><RefreshCw size={13} />Retry feed</button>
          </div>
        ) : snapshot ? (
          <div className="relative pt-5">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div className="flex items-end gap-5">
                <div>
                  <div className="flex items-center gap-2 font-mono-sg text-[10px] uppercase tracking-wider text-slate-500"><Thermometer size={14} className="text-amber-200" /> Air temperature</div>
                  <div data-testid="text-live-temperature" className="mt-1 font-mono-sg text-6xl font-medium tracking-[-.08em] text-slate-100 sm:text-7xl">{snapshot.temperature.toFixed(1)}<span className="ml-1 text-2xl text-amber-200">°C</span></div>
                  <div className="mt-1 text-xs text-slate-500">Feels like {snapshot.apparentTemperature.toFixed(1)}°C · {snapshot.condition}</div>
                </div>
                <div className="mb-2 hidden h-14 w-px bg-white/10 sm:block" />
                <div className="mb-2">
                  <div className="font-mono-sg text-2xl text-cyan-200">{snapshot.humidity}%</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">relative humidity</div>
                </div>
              </div>
              <div className="lg:text-right">
                <div className="font-mono-sg text-[10px] uppercase tracking-wider text-slate-500">LAST OBSERVED · {snapshot.observedAt.replace('T', ' ')} · {snapshot.region.timezone}</div>
                <div className="mt-2 flex items-center gap-2 lg:justify-end"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 status-pulse" /><span className="font-mono-sg text-[10px] text-emerald-300">FEED HEALTHY · POLLING READY</span></div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 border-t border-white/[.08] pt-4 sm:grid-cols-5">
              <Metric icon={Wind} label="Wind speed" value={`${snapshot.windSpeed.toFixed(1)} km/h`} detail={`${directionLabel(snapshot.windDirection)} heading`} active={active('wind')} />
              <Metric icon={Wind} label="Peak gust" value={`${snapshot.windGust.toFixed(1)} km/h`} detail="current" active={active('wind')} />
              <Metric icon={CloudRain} label="Precipitation" value={`${snapshot.precipitation.toFixed(1)} mm`} detail="current" active={active('rainfall')} />
              <Metric icon={Droplets} label="Rain rate" value={`${snapshot.rain.toFixed(1)} mm`} detail="current" active={active('rainfall')} />
              <Metric icon={Gauge} label="Pressure" value={`${snapshot.pressure.toFixed(0)} hPa`} detail="mean sea level" active={active('pressure')} />
            </div>
          </div>
        ) : null}
        {error && snapshot && <div className="relative mt-4 flex items-center gap-2 border-t border-amber-300/15 pt-3 text-[10px] text-amber-200/80"><AlertTriangle size={13} /> {snapshot.condition === 'Local station fallback' ? 'Showing a degraded local station fallback' : 'Showing the last successful observation'} · {error}</div>}
      </div>
    </section>
  );
}