export interface WeatherData {
  temperature: number; // Celsius
  precipitation: number; // mm
  soilMoisture: number; // m³/m³
  isRaining: boolean;
  isHot: boolean; // over 30C
  isDry: boolean; // low soil moisture
}

export async function getLocalWeatherContext(latitude: number, longitude: number): Promise<WeatherData | null> {
  try {
    // Open-Meteo provides free non-commercial weather data without an API key
    // Requesting current temperature, precipitation, and soil moisture within the 0-1cm depth layer
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,soil_moisture_0_to_1cm&timezone=auto`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data = await response.json();
    
    const current = data.current;
    
    // Safety check if data is incomplete
    if (!current) {
        return null;
    }

    return {
      temperature: current.temperature_2m || 0,
      precipitation: current.precipitation || 0,
      soilMoisture: current.soil_moisture_0_to_1cm || 0,
      isRaining: (current.precipitation || 0) > 0,
      isHot: (current.temperature_2m || 0) > 30,
      isDry: (current.soil_moisture_0_to_1cm || 0) < 0.2 // Simplified threshold for dry topsoil
    };
  } catch (error) {
    console.warn("Failed to fetch weather context:", error);
    return null; // Graceful degradation if weather API fails
  }
}
