const key = "f7315392ce72e45fb74ca85c82a05519";
const https = "https://";
let current;

// All document.getElementById:s
/////////////////////////////////////////////////
let show_forecast_button = document.getElementById("show-forecast-button");
let show_card = document.getElementById("show-card");
// Variable to hide forecast card by default
show_card.style.display = "none";
let search_button = document.getElementById("search-button");
let search_input = document.getElementById("search-input");
/////////////////////////////////////////////////
const city_name = document.getElementById("city_name");
const current_temp = document.getElementById("current_temp");
const temp_feels_like = document.getElementById("temp_feels_like");
const currentTime = document.getElementById("time-now");
const day = document.getElementById("weekday");
const windSpeed = document.getElementById("wind-speed");
const humidity = document.getElementById("humidity");
const time_now_2 = document.getElementById("time-now-2");
let zero_days_after_today = document.getElementById("0-days-after-today");
const cloudy_or = document.getElementById("cloudy-or");
/////////////////////////////////////////////////
let forecast_current_temp = document.getElementById("forecast-current-temp");
let forecast_current_feels = document.getElementById("forecast-current-feels");
let forecast_current_wspeed = document.getElementById(
  "forecast-current-wspeed"
);
let forecast_current_humidity = document.getElementById(
  "forecast-current-humidity"
);
let forecast_current_icon = document.getElementById("forecast-current-icon");
/////////////////////////////////////////////////

let date = new Date();
let UTC = date.toUTCString();

search_button.addEventListener("click", function () {
  let search_city = search_input.value;
  let cityName = search_city;
  current = `${https}api.openweathermap.org/data/2.5/weather?q=${cityName}&lang=en&appid=${key}&units=metric`;
  main(current, cityName);
});
const main = async (current, cityName) => {
  if (cityName === undefined) {
    cityName = "Tampere";
  } else {
    cityName = cityName;
  }
  current = `${https}api.openweathermap.org/data/2.5/weather?q=${cityName}&lang=en&appid=${key}&units=metric`;
  let currentAddress = current;
  const currentResponse = await fetch(`${currentAddress}`);
  const currentData = await currentResponse.json();
  const country = currentData.sys.country;
  const lon = currentData.coord.lon;
  const lat = currentData.coord.lat;
  const address = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${key}&units=metric`;
  const finalResponse = await fetch(address);
  const data = await finalResponse.json();
  console.log("data: ", data);
  let timeZone = data.timezone_offset;
  let month_as_number = month_maker(UTC);
  let current_time = time_now(UTC, timeZone, month_as_number);
  console.log("current_time: ", current_time);

  let current_time_day = current_time[0];
  let current_time_now = current_time[1];

  let current_date_year = parseInt(current_time[2].substring(7));
  let current_date_month = parseInt(
    month_maker(current_time[2].substring(0, 3))
  );
  let current_date_day = parseInt(current_time[2].substring(4, 6));
  let week_day = WhatDay(current_time[0]);
  //Current card
  const temp = data.current.temp;
  const feelsLike = data.current.feels_like;
  city_name.textContent = `${cityName}, ${country}`;
  day.textContent = `${current_time_now} - ${week_day} - ${current_date_day}/${current_date_month}/${current_date_year}`;
  //Forecast card
  time_now_2.textContent = `Today - ${week_day} - ${current_date_day}/${month_as_number}/${current_date_year}`;
  console.log("week_day: ", week_day);
  current_temp.textContent = `${temp.toFixed(0)} °C`;
  temp_feels_like.textContent = `${feelsLike.toFixed(0)} °C`;
  currentTime.textContent = `${current_time.slice(16, -43)}`;
  windSpeed.textContent = `${data.current.wind_speed} m/s`;
  humidity.textContent = `${data.current.humidity} %`;
  cloudy_or.textContent = `${data.current.weather[0].main}`;
  //
  for (let z = 1; z <= 7; z++) {
    let days_after_today = [document.getElementById(`${z}-days-after-today`)];
    zero_days_after_today.textContent = `${current_date_day}.${month_as_number} - Today`;
    days_after_today[0].textContent = day_for_forecast(
      current_date_day,
      current_date_month,
      current_date_year,

      z
    )
      .toString()
      .replace(/,/g, " - ");
  }
  let current_icon_id = document.getElementById("current-icon");
  let current_icon = data.current.weather[0].icon;
  current_icon_id.src = `https://openweathermap.org/img/wn/${current_icon}@2x.png`;
  const [
    forecast_temp,
    forecast_feels_likes,
    forecast_wspeed,
    forecast_humiditys,
    forecast_icon,
  ] = averager(data);
  forecast_current_temp.textContent = `${parseInt(forecast_temp[0]).toFixed(
    0
  )} °C`;
  forecast_current_feels.textContent = `${parseInt(
    forecast_feels_likes[0]
  ).toFixed(0)} °C`;
  forecast_current_wspeed.textContent = `${parseInt(forecast_wspeed[0]).toFixed(
    0
  )} m/s`;
  forecast_current_humidity.textContent = `${parseInt(
    forecast_humiditys[0]
  ).toFixed(0)} %`;
  forecast_current_icon.src = `https://openweathermap.org/img/wn/${forecast_icon[0]}.png`;
  for (let y = 1; y <= 7; y++) {
    let forecasttemp = [document.getElementById(`forecast-${y}-temp`)];
    let forecastfeels = [document.getElementById(`forecast-${y}-feels`)];
    let forecastwspeed = [document.getElementById(`forecast-${y}-wspeed`)];
    let forecasthumidity = [document.getElementById(`forecast-${y}-humidity`)];
    let forecasticon = [document.getElementById(`forecast-${y}-icon`)];
    //

    forecasttemp[0].textContent = `${parseFloat(forecast_temp[y]).toFixed(
      0
    )} °C`;
    forecastfeels[0].textContent = `${parseFloat(
      forecast_feels_likes[y]
    ).toFixed(0)} °C`;
    forecastwspeed[0].textContent = `${parseFloat(forecast_wspeed[y]).toFixed(
      0
    )} m/s`;
    forecasthumidity[0].textContent = `${parseFloat(
      forecast_humiditys[y]
    ).toFixed(0)} %`;
    forecasticon[0].src = `https://openweathermap.org/img/wn/${forecast_icon[y]}.png`;
  }
};

function averager(data) {
  let temperatures = [];
  let feels_likes = [];
  let wind_speeds = [];
  let humiditys = [];
  let icons = [];
  for (let i = 0; i <= 7; i++) {
    feels_likes[i] = (
      (data.daily[i].temp.day + data.daily[i].temp.eve) /
      2
    ).toFixed(2);
    temperatures[i] = (
      (data.daily[i].feels_like.day + data.daily[i].feels_like.eve) /
      2
    ).toFixed(2);
    wind_speeds[i] = data.daily[i].wind_speed;
    humiditys[i] = data.daily[i].humidity;
    icons[i] = data.daily[i].weather[0].icon;
  }
  return [temperatures, feels_likes, wind_speeds, humiditys, icons];
}

/////////////////////////////////////////////////
function month_maker(UTC) {
  let month;
  if (UTC.includes("Jan")) month = 1;
  if (UTC.includes("Feb")) month = 2;
  if (UTC.includes("Mar")) month = 3;
  if (UTC.includes("Apr")) month = 4;
  if (UTC.includes("May")) month = 5;
  if (UTC.includes("Jun")) month = 6;
  if (UTC.includes("Jul")) month = 7;
  if (UTC.includes("Aug")) month = 8;
  if (UTC.includes("Sep")) month = 9;
  if (UTC.includes("Oct")) month = 10;
  if (UTC.includes("Nov")) month = 11;
  if (UTC.includes("Dec")) month = 12;
  return month;
}
function time_now(UTC, timeZone, month_as_number) {
  let timezonehours = Math.floor(timeZone / 60 / 60);
  let timezoneminutes = Math.floor(timeZone / 60) - timezonehours * 60;
  let timezoneseconds = timeZone % 60;
  let year = parseFloat(UTC.slice(12, -13));
  let month = month_as_number;
  let day = parseFloat(UTC.slice(5, -22));
  let hours = parseFloat(UTC.slice(17, -10));
  let minutes = parseFloat(UTC.slice(20, -7));
  let seconds = parseFloat(UTC.slice(23, -4));

  let current_day = new Date(
    year,
    month - 1,
    day,
    hours + timezonehours,
    minutes + timezoneminutes,
    seconds + timezoneseconds
  )
    .toString()
    .substring(0, 4);
  let current_time = new Date(
    year,
    month - 1,
    day,
    hours + timezonehours,
    minutes + timezoneminutes,
    seconds + timezoneseconds
  )
    .toTimeString()
    .substring(0, 5);
  let current_date = new Date(
    year,
    month - 1,
    day,
    hours + timezonehours,
    minutes + timezoneminutes,
    seconds + timezoneseconds
  )
    .toDateString()
    .slice(4);
  return [current_day, current_time, `${current_date}`];
}
function weekday(today) {
  let name;
  if (today === 0) name = "Sunday";
  if (today === 1) name = "Monday";
  if (today === 2) name = "Tuesday";
  if (today === 3) name = "Wednesday";
  if (today === 4) name = "Thursday";
  if (today === 5) name = "Friday";
  if (today === 6) name = "Saturday";
  return name;
}
function day_for_forecast(day, month, year, dayCount) {
  day = day + dayCount;
  let new_date = new Date(year, month - 1, day).getDay();
  let tell_me_day = weekday(new_date);
  return [`${day}.${month}`, tell_me_day];
}
function WhatDay(what_day) {
  if (what_day.includes("Sun")) return "Sunday";
  if (what_day.includes("Mon")) return "Monday";
  if (what_day.includes("Tue")) return "Tuesday";
  if (what_day.includes("Wed")) return "Wednesday";
  if (what_day.includes("Thu")) return "Thursday";
  if (what_day.includes("Fri")) return "Friday";
  if (what_day.includes("Sat")) return "Saturday";
}
show_forecast_button.onclick = function () {
  if (show_card.style.display === "none") {
    show_card.style.display = "block";

    show_card.style.transition = "all 1s";
  } else {
    show_card.style.display = "none";
  }
};
main();
