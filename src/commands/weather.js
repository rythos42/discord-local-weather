export async function getWeatherOutput(airVisualApiKey) {
  async function getDataByCoordinates(coordinate) {
    const result = await fetch(
      `http://api.airvisual.com/v2/nearest_city?${coordinate}&key=${airVisualApiKey}`
    );
    const { status, data } = await result.json();

    if (status !== "success") throw new Error(status);

    return data;
  }

  async function getDataByCityName(city) {
    const result = await fetch(
      `http://api.airvisual.com/v2/city?city=${city}&state=British Columbia&country=Canada&key=${airVisualApiKey}`
    );
    const response = await result.json();

    if (response.status !== "success")
      throw new Error(JSON.stringify(response));

    return response.data;
  }

  function printDate(date) {
    return new Date(Date.parse(date)).toLocaleString();
  }

  function createCityEmbed(city, currentData) {
    const { pollution, weather } = currentData;
    return {
      title: city,
      fields: [
        {
          name: "Time",
          value: `Measured at ${printDate(weather.ts)}, AQI at ${printDate(
            pollution.ts
          )}.`,
        },
        {
          name: "Weather",
          value: `- Temperature: ${weather.tp}C\n- Humidity: ${
            weather.hu
          }\n- Wind speed: ${weather.ws}km/h\n- Air quality index: ${
            pollution.aqius
          } (${getAqiSensitivity(pollution.aqius)})`,
        },
      ],
    };
  }

  function getAqiSensitivity(aqi) {
    if (aqi <= 50) return "Good"; // Green
    if (aqi <= 100) return "Moderate"; // Yellow
    if (aqi <= 150) return "Unhealthy for Sensitive Groups"; // Orange
    if (aqi <= 200) return "Unhealthy"; // Red
    else return "Really Unhealthy"; // Not in the chart
  }

  console.log("Getting Enderby data.");
  const enderbyData = await getDataByCoordinates(
    "lat=50.55310643837481&lon=-119.14008791812606"
  );
  console.log("Creating Enderby output from " + JSON.stringify(enderbyData));
  const enderbyEmbed = createCityEmbed(
    enderbyData.city + ", " + enderbyData.state,
    enderbyData.current
  );

  console.log("Getting Vernon data.");
  const vernonData = await getDataByCityName("Vernon");
  console.log("Creating Vernon output from " + JSON.stringify(vernonData));
  const vernonEmbed = createCityEmbed(
    vernonData.city + ", " + vernonData.state,
    vernonData.current
  );

  console.log("Getting Salmon Arm data.");
  const salmonArmData = await getDataByCityName("Salmon Arm");
  console.log(
    "Creating Salmon Arm output from " + JSON.stringify(salmonArmData)
  );
  const salmonArmEmbed = createCityEmbed(
    salmonArmData.city + ", " + salmonArmData.state,
    salmonArmData.current
  );

  return [enderbyEmbed, vernonEmbed, salmonArmEmbed];
}
