import { useMemo, type ComponentType } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronDown,
  Clock3,
  CloudLightning,
  Droplets,
  Flame,
  MapPinned,
  MessageSquareWarning,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Thermometer,
  Waves,
  WifiOff,
  Zap,
} from 'lucide-react';

export type FeedMode = 'live' | 'simulated';
export type ZoneStatus = 'Nominal' | 'Warning' | 'Critical';
export type AlertSeverity = 'Advisory' | 'Warning' | 'Critical';
export type MetricKey = 'temperature' | 'humidity' | 'pressure' | 'wind' | 'rainfall';
export type ScenarioKey = 'Cyclone' | 'Flash Flood' | 'Heatwave' | 'Sensor Blackout';

export interface RegionOption {
  id: string;
  name: string;
  description?: string;
  stationCount?: number;
}

export interface ZoneStatusData {
  id: string;
  name: string;
  status: ZoneStatus;
  reading?: string;
  stationCount?: number;
}

export interface AlertDraft {
  message: string;
  severity: AlertSeverity;
  targetZone: string;
}

export interface TransmissionLogEntry {
  id: string;
  timestamp: string;
  message: string;
  severity: AlertSeverity;
  targetZone: string;
  status?: 'Sent' | 'Queued' | 'Acknowledged';
}

export interface CommandCenterControlsProps {
  selectedRegion: string;
  regionOptions: RegionOption[];
  searchText: string;
  isRefreshing: boolean;
  isPolling: boolean;
  feedMode: FeedMode;
  selectedMetrics: MetricKey[];
  selectedZone: string | null;
  zoneStatusData: ZoneStatusData[];
  alertDraft: AlertDraft;
  transmissionLog: TransmissionLogEntry[];
  simulationActive: ScenarioKey | null;
  onSearchTextChange: (value: string) => void;
  onRegionSelect: (regionId: string) => void;
  onRefresh: () => void;
  onPollingChange: (enabled: boolean) => void;
  onFeedModeChange: (mode: FeedMode) => void;
  onMetricToggle: (metric: MetricKey) => void;
  onZoneSelect: (zoneId: string) => void;
  onAlertDraftChange: (field: keyof AlertDraft, value: string) => void;
  onBroadcast: () => void;
  onScenarioSelect: (scenario: ScenarioKey) => void;
  onScenarioReset: () => void;
}

const metricLabels: Record<MetricKey, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  pressure: 'Pressure',
  wind: 'Wind',
  rainfall: 'Rainfall',
};

const metricIcons: Record<MetricKey, ComponentType<{ size?: number; className?: string }>> = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Activity,
  wind: Waves,
  rainfall: CloudLightning,
};

const scenarioMeta: Array<{
  key: ScenarioKey;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  accent: string;
}> = [
  { key: 'Cyclone', description: 'Escalate coastal wind and pressure signals', icon: CloudLightning, accent: 'amber' },
  { key: 'Flash Flood', description: 'Inject rainfall accumulation across zones', icon: Waves, accent: 'cyan' },
  { key: 'Heatwave', description: 'Raise temperature beyond local baseline', icon: Flame, accent: 'red' },
  { key: 'Sensor Blackout', description: 'Drop station telemetry and heartbeat', icon: WifiOff, accent: 'slate' },
];

const scenarioToneClasses: Record<string, { active: string; icon: string; label: string }> = {
  amber: {
    active: 'border-amber-300/45 bg-amber-300/10',
    icon: 'bg-amber-300/15 text-amber-200',
    label: 'text-amber-200',
  },
  cyan: {
    active: 'border-cyan-300/45 bg-cyan-300/10',
    icon: 'bg-cyan-300/15 text-cyan-200',
    label: 'text-cyan-200',
  },
  red: {
    active: 'border-red-400/45 bg-red-400/10',
    icon: 'bg-red-400/15 text-red-300',
    label: 'text-red-300',
  },
  slate: {
    active: 'border-slate-300/35 bg-slate-300/10',
    icon: 'bg-slate-300/15 text-slate-200',
    label: 'text-slate-200',
  },
};

function statusClasses(status: ZoneStatus) {
  if (status === 'Critical') {
    return {
      dot: 'bg-red-400',
      text: 'text-red-300',
      border: 'border-red-400/40',
      active: 'bg-red-400/10',
      soft: 'bg-red-400/[.06]',
    };
  }
  if (status === 'Warning') {
    return {
      dot: 'bg-amber-300',
      text: 'text-amber-200',
      border: 'border-amber-300/40',
      active: 'bg-amber-300/10',
      soft: 'bg-amber-300/[.06]',
    };
  }
  return {
    dot: 'bg-emerald-300',
    text: 'text-emerald-300',
    border: 'border-emerald-300/35',
    active: 'bg-emerald-300/10',
    soft: 'bg-emerald-300/[.05]',
  };
}

function severityClasses(severity: AlertSeverity) {
  if (severity === 'Critical') return 'text-red-300 border-red-400/40 bg-red-400/10';
  if (severity === 'Warning') return 'text-amber-200 border-amber-300/40 bg-amber-300/10';
  return 'text-cyan-200 border-cyan-300/30 bg-cyan-300/10';
}

export function CommandCenterControls({
  selectedRegion,
  regionOptions,
  searchText,
  isRefreshing,
  isPolling,
  feedMode,
  selectedMetrics,
  selectedZone,
  zoneStatusData,
  alertDraft,
  transmissionLog,
  simulationActive,
  onSearchTextChange,
  onRegionSelect,
  onRefresh,
  onPollingChange,
  onFeedModeChange,
  onMetricToggle,
  onZoneSelect,
  onAlertDraftChange,
  onBroadcast,
  onScenarioSelect,
  onScenarioReset,
}: CommandCenterControlsProps) {
  const filteredRegions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return regionOptions;
    return regionOptions.filter((region) =>
      `${region.name} ${region.description ?? ''}`.toLowerCase().includes(query),
    );
  }, [regionOptions, searchText]);

  const selectedRegionLabel =
    regionOptions.find((region) => region.id === selectedRegion)?.name ?? selectedRegion;
  const canBroadcast = alertDraft.message.trim().length > 0 && alertDraft.targetZone.length > 0;

  return (
    <section
      aria-labelledby="command-center-controls-title"
      className="space-y-4 text-slate-100"
      data-testid="command-center-controls"
    >
      <div className="flex flex-col justify-between gap-3 border-b border-white/[.08] pb-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 font-mono-sg text-[10px] uppercase tracking-[.22em] text-cyan-300/70">
            <Radio size={13} />
            Operator console / control surface
          </div>
          <h2 id="command-center-controls-title" className="text-xl font-semibold tracking-tight text-slate-100">
            Command center controls
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            Tune the regional feed, isolate telemetry, and send an operator-reviewed warning without leaving the monitoring view.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono-sg text-[10px] uppercase tracking-wider text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${isPolling ? 'bg-emerald-300 status-pulse' : 'bg-slate-600'}`} />
          {isPolling ? 'polling enabled' : 'polling paused'}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <div className="panel rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="command-region-search" className="mb-2 block font-mono-sg text-[10px] uppercase tracking-[.18em] text-slate-500">
                Monitoring region
              </label>
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/70" />
                <input
                  id="command-region-search"
                  data-testid="input-region-search"
                  aria-label="Search monitoring regions"
                  value={searchText}
                  onChange={(event) => onSearchTextChange(event.target.value)}
                  placeholder="Search Visakhapatnam, Kakinada..."
                  className="w-full rounded-xl border border-white/10 bg-[#0b1622] py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                />
              </div>
              <div className="relative mt-2">
                <select
                  data-testid="select-region"
                  aria-label="Select monitoring region"
                  value={selectedRegion}
                  onChange={(event) => onRegionSelect(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-cyan-300/20 bg-cyan-300/[.06] px-3 py-2.5 pr-9 text-sm font-medium text-cyan-100 outline-none transition hover:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                >
                  {filteredRegions.length === 0 ? (
                    <option value={selectedRegion}>{selectedRegionLabel || 'No matching region'}</option>
                  ) : (
                    filteredRegions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                        {region.stationCount !== undefined ? ` · ${region.stationCount} stations` : ''}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300" />
              </div>
              <div className="mt-2 flex min-h-5 items-center gap-2 text-[11px] text-slate-500">
                <MapPinned size={13} className="text-cyan-300/70" />
                <span data-testid="text-selected-region">
                  {regionOptions.find((region) => region.id === selectedRegion)?.description ?? selectedRegionLabel}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <div className="flex rounded-xl border border-white/10 bg-white/[.03] p-1" role="group" aria-label="Feed mode">
                {(['live', 'simulated'] as FeedMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    data-testid={`button-feed-${mode}`}
                    aria-pressed={feedMode === mode}
                    onClick={() => onFeedModeChange(mode)}
                    className={`rounded-lg px-3 py-2 font-mono-sg text-[10px] uppercase tracking-wider transition ${
                      feedMode === mode
                        ? 'bg-cyan-300/15 text-cyan-200 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {mode === 'live' ? 'Live feed' : 'Simulated'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="button-refresh-telemetry"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Refreshing' : 'Refresh'}
                </button>
                <button
                  type="button"
                  data-testid="button-toggle-polling"
                  aria-pressed={isPolling}
                  onClick={() => onPollingChange(!isPolling)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs transition ${
                    isPolling
                      ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300'
                      : 'border-white/10 bg-white/[.03] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock3 size={14} />
                  {isPolling ? 'Polling' : 'Paused'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-white/[.07] pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono-sg text-[10px] uppercase tracking-[.18em] text-slate-500">Telemetry layers</span>
              <span className="font-mono-sg text-[10px] text-cyan-300/70">{selectedMetrics.length}/5 visible</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(metricLabels) as MetricKey[]).map((metric) => {
                const Icon = metricIcons[metric];
                const active = selectedMetrics.includes(metric);
                return (
                  <button
                    key={metric}
                    type="button"
                    data-testid={`button-metric-${metric}`}
                    aria-pressed={active}
                    onClick={() => onMetricToggle(metric)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                      active
                        ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100'
                        : 'border-white/10 bg-white/[.02] text-slate-500 hover:border-white/20 hover:text-slate-300'
                    }`}
                  >
                    <Icon size={14} />
                    {metricLabels[metric]}
                    {active && <Check size={13} className="text-cyan-300" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-mono-sg text-[10px] uppercase tracking-[.18em] text-cyan-300/70">
                <MapPinned size={13} />
                Regional grid
              </div>
              <h3 className="mt-1 text-sm font-semibold text-slate-200">Zone selector</h3>
            </div>
            <div className="flex items-center gap-3 font-mono-sg text-[9px] uppercase tracking-wider text-slate-600">
              <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />nominal</span>
              <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />warning</span>
              <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-400" />critical</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {zoneStatusData.map((zone) => {
              const tone = statusClasses(zone.status);
              const active = selectedZone === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  data-testid={`button-zone-${zone.id}`}
                  aria-pressed={active}
                  onClick={() => onZoneSelect(zone.id)}
                  className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${
                    active ? `${tone.border} ${tone.active}` : `border-white/10 ${tone.soft} hover:border-white/25`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`h-2 w-2 rounded-full ${tone.dot} ${zone.status !== 'Nominal' ? 'status-pulse' : ''}`} />
                    <span className={`font-mono-sg text-[9px] uppercase tracking-wider ${tone.text}`}>{zone.status}</span>
                  </div>
                  <div className="mt-3 truncate text-xs font-medium text-slate-200">{zone.name}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 font-mono-sg text-[9px] text-slate-600">
                    <span>{zone.reading ?? 'Awaiting reading'}</span>
                    {zone.stationCount !== undefined && <span>{zone.stationCount} AWS</span>}
                  </div>
                </button>
              );
            })}
          </div>
          {zoneStatusData.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-7 text-center text-xs text-slate-600">
              No zones available for this region.
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 border-t border-white/[.07] pt-3 font-mono-sg text-[10px] text-slate-500">
            <ShieldAlert size={13} className="text-amber-200" />
            {selectedZone ? `Focused zone: ${zoneStatusData.find((zone) => zone.id === selectedZone)?.name ?? selectedZone}` : 'Select a zone to focus telemetry'}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <div className="panel rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-300/10 text-amber-200">
              <MessageSquareWarning size={17} />
            </div>
            <div>
              <div className="font-mono-sg text-[10px] uppercase tracking-[.18em] text-amber-200/70">Operator transmission</div>
              <h3 className="mt-1 text-sm font-semibold text-slate-200">Broadcast warning</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="alert-message" className="mb-1.5 block text-[11px] text-slate-500">Message</label>
              <textarea
                id="alert-message"
                data-testid="input-alert-message"
                aria-label="Broadcast warning message"
                value={alertDraft.message}
                onChange={(event) => onAlertDraftChange('message', event.target.value)}
                placeholder="Describe the condition and operator action..."
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1622] px-3 py-2.5 text-sm leading-5 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-amber-300/45 focus:ring-2 focus:ring-amber-300/10"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="alert-severity" className="mb-1.5 block text-[11px] text-slate-500">Severity</label>
                <select
                  id="alert-severity"
                  data-testid="select-alert-severity"
                  aria-label="Warning severity"
                  value={alertDraft.severity}
                  onChange={(event) => onAlertDraftChange('severity', event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-xs outline-none transition ${severityClasses(alertDraft.severity)}`}
                >
                  <option value="Advisory">Advisory</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label htmlFor="alert-target-zone" className="mb-1.5 block text-[11px] text-slate-500">Target zone</label>
                <select
                  id="alert-target-zone"
                  data-testid="select-alert-target-zone"
                  aria-label="Warning target zone"
                  value={alertDraft.targetZone}
                  onChange={(event) => onAlertDraftChange('targetZone', event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1622] px-3 py-2.5 text-xs text-slate-200 outline-none transition focus:border-amber-300/45 focus:ring-2 focus:ring-amber-300/10"
                >
                  <option value="">Select target zone</option>
                  {zoneStatusData.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                </select>
              </div>
            </div>
            <button
              type="button"
              data-testid="button-broadcast-warning"
              onClick={onBroadcast}
              disabled={!canBroadcast}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/35 bg-amber-300/10 px-3 py-2.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[.03] disabled:text-slate-600"
            >
              <Send size={14} />
              Broadcast warning
            </button>
          </div>
        </div>

        <div className="panel rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-mono-sg text-[10px] uppercase tracking-[.18em] text-cyan-300/70">Delivery ledger</div>
              <h3 className="mt-1 text-sm font-semibold text-slate-200">Transmission log</h3>
            </div>
            <span className="font-mono-sg text-[10px] text-slate-600">{transmissionLog.length} records</span>
          </div>
          <div className="max-h-[245px] space-y-2 overflow-y-auto pr-1">
            {transmissionLog.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                <Send size={17} className="mx-auto text-slate-600" />
                <p className="mt-2 text-xs text-slate-600">No warnings transmitted in this session.</p>
              </div>
            ) : (
              transmissionLog.map((entry) => (
                <div key={entry.id} data-testid={`log-transmission-${entry.id}`} className="rounded-xl border border-white/[.08] bg-white/[.025] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${entry.severity === 'Critical' ? 'bg-red-400' : entry.severity === 'Warning' ? 'bg-amber-300' : 'bg-cyan-300'}`} />
                      <span className={`font-mono-sg text-[9px] uppercase tracking-wider ${severityClasses(entry.severity).split(' ')[0]}`}>{entry.severity}</span>
                      <span className="font-mono-sg text-[9px] text-slate-600">{entry.timestamp}</span>
                    </div>
                    <span className="font-mono-sg text-[9px] uppercase tracking-wider text-emerald-300">{entry.status ?? 'Sent'}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{entry.message}</p>
                  <div className="mt-2 flex items-center gap-1 font-mono-sg text-[9px] text-slate-600">
                    <MapPinned size={11} />
                    {entry.targetZone}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono-sg text-[10px] uppercase tracking-[.18em] text-red-300/75">
              <Zap size={13} />
              Scenario lab / local only
            </div>
            <h3 className="mt-1 text-sm font-semibold text-slate-200">Weather event simulation</h3>
            <p className="mt-1 text-xs text-slate-500">Stage a controlled event for operator review. No remote mutation is performed by this control.</p>
          </div>
          {simulationActive && (
            <button
              type="button"
              data-testid="button-reset-simulation"
              onClick={onScenarioReset}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 font-mono-sg text-[10px] uppercase tracking-wider text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
            >
              <RotateCcw size={13} />
              Reset scenario
            </button>
          )}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scenarioMeta.map((scenario) => {
            const Icon = scenario.icon;
            const active = simulationActive === scenario.key;
            const tone = scenarioToneClasses[scenario.accent];
            return (
              <button
                key={scenario.key}
                type="button"
                data-testid={`button-scenario-${scenario.key.toLowerCase().replaceAll(' ', '-')}`}
                aria-pressed={active}
                onClick={() => onScenarioSelect(scenario.key)}
                className={`group rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${active ? tone.active : 'border-white/10 bg-white/[.025] hover:border-white/20'}`}
              >
                <div className={`mb-5 grid h-8 w-8 place-items-center rounded-lg ${active ? tone.icon : 'bg-white/[.06] text-slate-500 group-hover:text-slate-300'}`}>
                  <Icon size={15} />
                </div>
                <div className="text-xs font-medium text-slate-200">{scenario.key}</div>
                <div className="mt-1 min-h-8 text-[10px] leading-4 text-slate-600">{scenario.description}</div>
                <div className={`mt-3 font-mono-sg text-[9px] uppercase tracking-wider ${active ? tone.label : 'text-slate-700'}`}>
                  {active ? 'Active scenario' : 'Run simulation'}
                </div>
              </button>
            );
          })}
        </div>
        {simulationActive && (
          <div data-testid="status-active-simulation" className="mt-4 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/[.06] px-3 py-2 font-mono-sg text-[10px] uppercase tracking-wider text-red-300">
            <AlertTriangle size={13} />
            {simulationActive} staged · monitoring response
          </div>
        )}
      </div>
    </section>
  );
}