export type WeatherRegion = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
  stationCount: number;
};

export type WeatherSnapshot = {
  region: WeatherRegion;
  observedAt: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  condition: string;
};

export const WEATHER_REGIONS: WeatherRegion[] = [
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam sector',
    description: 'Bay of Bengal coastal command region',
    latitude: 17.6868,
    longitude: 83.2185,
    country: 'India',
    timezone: 'Asia/Kolkata',
    stationCount: 3,
  },
  {
    id: 'kakinada',
    name: 'Kakinada coast',
    description: 'Godavari delta and coastal flood watch',
    latitude: 16.9891,
    longitude: 82.2475,
    country: 'India',
    timezone: 'Asia/Kolkata',
    stationCount: 4,
  },
  {
    id: 'srikakulam',
    name: 'Srikakulam district',
    description: 'Northern coastal Andhra monitoring region',
    latitude: 18.2949,
    longitude: 83.8938,
    country: 'India',
    timezone: 'Asia/Kolkata',
    stationCount: 5,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad metro',
    description: 'Interior heat and storm response region',
    latitude: 17.385,
    longitude: 78.4867,
    country: 'India',
    timezone: 'Asia/Kolkata',
    stationCount: 6,
  },
  {
    id: 'mumbai',
    name: 'Mumbai coast',
    description: 'Western coastal rainfall and surge watch',
    latitude: 19.076,
    longitude: 72.8777,
    country: 'India',
    timezone: 'Asia/Kolkata',
    stationCount: 8,
  },
];

const conditionForCode = (code: number) => {
  if (code === 0) return 'Clear sky';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy';
  if ([45, 48].includes(code)) return 'Reduced visibility';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain';
  if ([71, 73, 75, 77].includes(code)) return 'Snow';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([85, 86].includes(code)) return 'Snow showers';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Variable conditions';
};

type OpenMeteoResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
};

export async function fetchWeatherSnapshot(
  region: WeatherRegion,
  signal?: AbortSignal,
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(region.latitude),
    longitude: String(region.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'weather_code',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    timezone: region.timezone,
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  if (!payload.current) {
    throw new Error('Weather service returned no current observation');
  }

  const current = payload.current;
  return {
    region,
    observedAt: current.time,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    pressure: current.pressure_msl,
    windSpeed: current.wind_speed_10m,
    windGust: current.wind_gusts_10m,
    windDirection: current.wind_direction_10m,
    precipitation: current.precipitation,
    rain: current.rain,
    weatherCode: current.weather_code,
    condition: conditionForCode(current.weather_code),
  };
}

export function regionOptions(regions: WeatherRegion[]) {
  return regions.map((region) => ({
    id: region.id,
    name: region.name,
    description: region.description,
    stationCount: region.stationCount,
  }));
}