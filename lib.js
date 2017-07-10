const maps = require('@google/maps');
const polyline = require('@mapbox/polyline');
const tokml = require('tokml');
const togpx = require('togpx');
const geojson = require('geojson');
const topojson = require('topojson');
const util = require('util');
const { URL } = require('url');

// private
function convertDataPoint(dataPoint) {
  if (typeof dataPoint == "string") {
    return dataPoint;
  } 
  return dataPoint.split(',').map(parseFloat);
}

function convertDirections(directionsObject, toFormat) {
  const normalizedPoints = [];
  const decodedPoints = polyline.decode(directionsObject.json.routes[0].overview_polyline.points);

  for(let point of decodedPoints) {
    const value = [point[1],point[0]];
    normalizedPoints.push(value);
  }

  const data = { line: normalizedPoints };
  const geoData = geojson.parse(data, { "LineString": "line" });

  switch(toFormat) {
    case "GPX":
      console.log(togpx(geoData));
      break;
    case "KML":
      console.log(tokml(geoData));
      break;
    case "TopoJSON":
      console.log(JSON.stringify(topojson.topology(geoData)));
      break;
    default:
      console.log(JSON.stringify(geoData, null, 2));
  }

  process.exit(0); 
}

// public
function GetMapsObject(googleMapsURL) {
  const urlObject = new URL(googleMapsURL);

  const urlObjectArray = urlObject.pathname.split('/')

  const googleMapsObject = {
    origin: convertDataPoint(urlObjectArray[3]),
    destination: convertDataPoint(urlObjectArray[4]),
    waypoints: []
  };

  // extract way points from url data parameter
  const parts = urlObjectArray[6].split('=')[1].split('!');
  const indexes = parts.map((e, i) => (e === "2m2" || e === "1m2") ? i : '').filter(String);

  for(let index of indexes) {
    googleMapsObject.waypoints.push([
      parseFloat(parts[index+2].split('d')[1]),
      parseFloat(parts[index+1].split('d')[1])
    ]);
  }

  return googleMapsObject;
}

function GetDirections(directionRoute, toFormat) {
  const googleMapsClient = maps.createClient({
    Promise: global.Promise,
    key: process.env.GOOGLE_MAPS_API_KEY
  });

  googleMapsClient.directions(directionRoute)
    .asPromise()
    .then(response => {
      convertDirections(response, toFormat)
    })
    .catch((err) => {
      console.error('Error: Unable to parse URL and generate output');
      process.exit(0);
    });
}

module.exports = { GetMapsObject, GetDirections };
