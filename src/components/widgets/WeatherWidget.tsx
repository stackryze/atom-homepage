'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Eye, Thermometer, Sunrise, Sunset, CloudDrizzle, MapPin } from 'lucide-react';
import styles from './WeatherWidget.module.css';

interface WeatherData {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    isDay: boolean;
    visibility?: number;
    uvIndex?: number;
    precipitation: number;
    pressureMsl: number;
    cloudCover: number;
}

interface DailyForecast {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    precipitationSum: number;
    sunrise: string;
    sunset: string;
}

interface WeatherWidgetProps {
    location?: string;
}

const WMO_CODES: Record<number, { label: string; icon: string }> = {
    0: { label: 'Clear sky', icon: 'sun' },
    1: { label: 'Mainly clear', icon: 'sun' },
    2: { label: 'Partly cloudy', icon: 'cloud' },
    3: { label: 'Overcast', icon: 'cloud' },
    45: { label: 'Fog', icon: 'cloud' },
    48: { label: 'Rime fog', icon: 'cloud' },
    51: { label: 'Light drizzle', icon: 'drizzle' },
    53: { label: 'Drizzle', icon: 'drizzle' },
    55: { label: 'Dense drizzle', icon: 'drizzle' },
    61: { label: 'Light rain', icon: 'rain' },
    63: { label: 'Rain', icon: 'rain' },
    65: { label: 'Heavy rain', icon: 'rain' },
    71: { label: 'Light snow', icon: 'snow' },
    73: { label: 'Snow', icon: 'snow' },
    75: { label: 'Heavy snow', icon: 'snow' },
    80: { label: 'Rain showers', icon: 'rain' },
    81: { label: 'Heavy showers', icon: 'rain' },
    82: { label: 'Violent showers', icon: 'rain' },
    85: { label: 'Snow showers', icon: 'snow' },
    86: { label: 'Heavy snow showers', icon: 'snow' },
    95: { label: 'Thunderstorm', icon: 'lightning' },
    96: { label: 'Thunderstorm w/ hail', icon: 'lightning' },
    99: { label: 'Severe thunderstorm', icon: 'lightning' },
};

function getWeatherIcon(code: number, isDay: boolean, size = 24) {
    const info = WMO_CODES[code] || { icon: 'cloud' };
    switch (info.icon) {
        case 'sun': return isDay ? <Sun size={size} /> : <Cloud size={size} />;
        case 'cloud': return <Cloud size={size} />;
        case 'drizzle': return <CloudDrizzle size={size} />;
        case 'rain': return <CloudRain size={size} />;
        case 'snow': return <CloudSnow size={size} />;
        case 'lightning': return <CloudLightning size={size} />;
        default: return <Cloud size={size} />;
    }
}

function getWeatherLabel(code: number) {
    return WMO_CODES[code]?.label || 'Unknown';
}

function getWindDirection(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

export default function WeatherWidget({ location }: WeatherWidgetProps) {
    const [current, setCurrent] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<DailyForecast[]>([]);
    const [cityName, setCityName] = useState(location || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = useCallback(async (city: string) => {
        try {
            setLoading(true);
            setError(null);

            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                setError('Location not found');
                setLoading(false);
                return;
            }

            const { latitude, longitude, name } = geoData.results[0];
            setCityName(name);

            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
                `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,` +
                `pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,is_day` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset` +
                `&timezone=auto&forecast_days=5`
            );
            const data = await weatherRes.json();

            if (data.current) {
                setCurrent({
                    temperature: Math.round(data.current.temperature_2m),
                    feelsLike: Math.round(data.current.apparent_temperature),
                    humidity: data.current.relative_humidity_2m,
                    windSpeed: Math.round(data.current.wind_speed_10m),
                    windDirection: data.current.wind_direction_10m,
                    weatherCode: data.current.weather_code,
                    isDay: data.current.is_day === 1,
                    precipitation: data.current.precipitation,
                    pressureMsl: Math.round(data.current.pressure_msl),
                    cloudCover: data.current.cloud_cover,
                });
            }

            if (data.daily) {
                const days: DailyForecast[] = [];
                for (let i = 0; i < data.daily.time.length; i++) {
                    days.push({
                        date: data.daily.time[i],
                        tempMax: Math.round(data.daily.temperature_2m_max[i]),
                        tempMin: Math.round(data.daily.temperature_2m_min[i]),
                        weatherCode: data.daily.weather_code[i],
                        precipitationSum: data.daily.precipitation_sum[i],
                        sunrise: data.daily.sunrise[i],
                        sunset: data.daily.sunset[i],
                    });
                }
                setForecast(days);
            }
        } catch {
            setError('Failed to fetch weather');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (location) fetchWeather(location);
    }, [location, fetchWeather]);

    // Refresh every 15 minutes
    useEffect(() => {
        if (!location) return;
        const interval = setInterval(() => fetchWeather(location), 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, [location, fetchWeather]);

    if (!location) {
        return (
            <div className={styles.widget}>
                <div className={styles.empty}>
                    <MapPin size={20} />
                    <span>Set location in Settings → General</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.widget}>
                <div className={styles.loading}>Loading weather...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.widget}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    if (!current) return null;

    const today = forecast[0];

    return (
        <div className={styles.widget}>
            {/* Current Weather */}
            <div className={styles.current}>
                <div className={styles.mainInfo}>
                    <div className={styles.weatherIcon}>
                        {getWeatherIcon(current.weatherCode, current.isDay, 40)}
                    </div>
                    <div className={styles.tempBlock}>
                        <span className={styles.temperature}>{current.temperature}°</span>
                        <span className={styles.condition}>{getWeatherLabel(current.weatherCode)}</span>
                    </div>
                </div>
                <div className={styles.location}>
                    <MapPin size={12} />
                    <span>{cityName}</span>
                </div>
                <div className={styles.feelsLike}>
                    Feels like {current.feelsLike}°
                    {today && <span className={styles.hiLo}>H:{today.tempMax}° L:{today.tempMin}°</span>}
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.stat}>
                    <Droplets size={14} />
                    <span className={styles.statLabel}>Humidity</span>
                    <span className={styles.statValue}>{current.humidity}%</span>
                </div>
                <div className={styles.stat}>
                    <Wind size={14} />
                    <span className={styles.statLabel}>Wind</span>
                    <span className={styles.statValue}>{current.windSpeed} km/h {getWindDirection(current.windDirection)}</span>
                </div>
                <div className={styles.stat}>
                    <Thermometer size={14} />
                    <span className={styles.statLabel}>Pressure</span>
                    <span className={styles.statValue}>{current.pressureMsl} hPa</span>
                </div>
                <div className={styles.stat}>
                    <Eye size={14} />
                    <span className={styles.statLabel}>Cloud</span>
                    <span className={styles.statValue}>{current.cloudCover}%</span>
                </div>
                {today && (
                    <>
                        <div className={styles.stat}>
                            <Sunrise size={14} />
                            <span className={styles.statLabel}>Sunrise</span>
                            <span className={styles.statValue}>{new Date(today.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={styles.stat}>
                            <Sunset size={14} />
                            <span className={styles.statLabel}>Sunset</span>
                            <span className={styles.statValue}>{new Date(today.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </>
                )}
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 1 && (
                <div className={styles.forecast}>
                    {forecast.slice(1).map((day) => (
                        <div key={day.date} className={styles.forecastDay}>
                            <span className={styles.dayName}>
                                {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <div className={styles.forecastIcon}>
                                {getWeatherIcon(day.weatherCode, true, 16)}
                            </div>
                            <span className={styles.forecastTemp}>
                                <span className={styles.tempHigh}>{day.tempMax}°</span>
                                <span className={styles.tempLow}>{day.tempMin}°</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
