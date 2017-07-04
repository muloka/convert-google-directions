const maps = require('@google/maps');
const polyline = require('@mapbox/polyline');
const tokml = require('tokml');
const togpx = require('togpx');
const geojson = require('geojson');
const topojson = require('topojson');
const util = require('util');
const { URL } = require('url');

const GOOGLE_MAPS_API_KEY = require('./config').GOOGLE_MAPS_API_KEY;

function GetMapsObject(googleMapsURL) {
  function convertDataPoint(dataPoint) {
    if (typeof dataPoint == "string") {
      return dataPoint;
    } 
    return dataPoint.split(',').map((s) => parseFloat(s));
  }

  const urlObject = new URL(googleMapsURL);

  const urlObjectArray = urlObject.pathname.split('/')

  const googleMapsObject = {
    origin: convertDataPoint(urlObjectArray[3]),
    destination: convertDataPoint(urlObjectArray[4]),
    waypoints: []
  };

  /**
   * Code to parse the values in the "data" attribute in a Google Maps URL to an Array
   *
   * Based on information from:
   *  http://stackoverflow.com/a/34275131
   *  http://stackoverflow.com/a/24662610
   *  https://stackoverflow.com/a/31854423
   *  https://gist.github.com/jeteon/e71fa21c1feb48fe4b5eeec045229a0c
   */
  const parts = urlObjectArray[6].split('=')[1].split('!');
  const indexes = parts.map((e, i) => e === "2m2" ? i : '').filter(String);

  for(let index of indexes) {
    googleMapsObject.waypoints.push([
      parseFloat(parts[index+2].split('d')[1]),
      parseFloat(parts[index+1].split('d')[1])
    ]);
  }

  return googleMapsObject;
}

async function GetDirections(directionRoute) {
  const googleMapsClient = maps.createClient({
    Promise: global.Promise,
    key: GOOGLE_MAPS_API_KEY
  });

  return googleMapsClient.directions(directionRoute).asPromise();
}

function ConvertDirections(directionsObject, toFormat) {
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

module.exports = { GetMapsObject, GetDirections, ConvertDirections };
