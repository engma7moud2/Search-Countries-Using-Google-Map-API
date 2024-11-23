import { API_KEY } from "./config.js";

(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
  key: API_KEY,
  v: "weekly",
  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
  // Add other bootstrap parameters as needed, using camel case.
});
const infoContainer = document.querySelector(".info-box");
const searchInput = document.querySelector(".search-input");
const searchResults = document.querySelector(".searchResults");
searchResults.style.display = "none";

let countriesData = [];
let markers = [];

let fullCountryListHTML = ""; // Cache the full list

const renderCountry = function (data) {
  const html = `
  <article>
    <img class="country__img" src="${data.flags.svg}" />
    <div class="country__data">
      <h3 class="country__name">${data.name.common}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row Capital"><b>Capital : </b> ${
        Object.values(data.capital)[0]
      }</p>
      <p class="country__row population"><span>👫</span> ${(
        +data.population / 1000000
      ).toFixed(1)} M people</p>
      <p class="country__row language"><span>🗣️</span> ${
        Object.values(data.languages)[0]
      }</p>
      <p class="country__row currency"><span>💰</span> ${
        Object.values(data.currencies)[0].name
      }</p>
    </div>
  </article>
  `;
  infoContainer.insertAdjacentHTML("beforeend", html);
};

let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  let location = { lat: 30.0443879, lng: 31.2357257 };

  map = new Map(document.getElementById("map"), {
    center: location,
    zoom: 8,
  });

  new google.maps.Marker({
    position: location,
    map,
    title: "The Capital",
  });
}

initMap();

const getCountries = async function () {
  const url = "https://restcountries.com/v3.1/all";
  try {
    if (countriesData.length > 0) return; // Avoid re-fetching

    const response = await fetch(url);
    const result = await response.json();

    countriesData = result;

    console.log(countriesData);

    // Generate the full list HTML once
    fullCountryListHTML = countriesData
      .map(
        (country) =>
          `<li data-country='${country.name.common}'>${country.name.common}</li>`
      )
      .join("");
  } catch (error) {
    console.error(error);
  }
};

searchInput.addEventListener("focus", async function () {
  await getCountries(); // Ensure countries Data is loaded

  searchInput.value = "";
  searchResults.style.display = "block";
  searchResults.innerHTML = fullCountryListHTML;
});

searchInput.addEventListener("blur", function () {
  setTimeout(function () {
    searchResults.style.display = "none";
  }, 300);
});

searchInput.addEventListener("input", function (e) {
  searchResults.innerHTML = ""; // clear previous results

  const filteredResults = countriesData.filter(function (country) {
    return country.name.common
      .toLowerCase()
      .startsWith(e.target.value.toLowerCase());
  });

  for (let i = 0; i < filteredResults.length; i++) {
    searchResults.innerHTML += `<li data-country='${filteredResults[i].name.common}'>${filteredResults[i].name.common}</li>`;
  }

  if (filteredResults.length === 0) {
    searchResults.innerHTML = "<li>No results found</li>";
  }
});

const MarkCountry = async function () {
  await getCountries(); // Ensure countries Data is loaded

  searchResults.addEventListener("click", function (e) {
    // clear the markers
    for (const marker of markers) {
      marker.setMap(null);
    }

    infoContainer.innerHTML = "";

    if (e.target.tagName === "LI") {
      searchInput.value = e.target.dataset.country;
      searchResults.style.display = "none";

      let [selectedCountry] = countriesData.filter(
        (country) => country.name.common === e.target.dataset.country
      );

      if (!selectedCountry.capitalInfo || !selectedCountry.capitalInfo.latlng) {
        alert("No capital location available for this country.");
        return;
      }

      let position = {
        lat: selectedCountry.capitalInfo.latlng[0],
        lng: selectedCountry.capitalInfo.latlng[1],
      };

      let marker = new google.maps.Marker({
        position,
        map,
        title: "The Capital",
      });

      markers.push(marker);

      // set center of the map to marker position
      map.setCenter(marker.getPosition());

      renderCountry(selectedCountry);
    }
  });
};

MarkCountry();
