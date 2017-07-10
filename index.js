const program = require('commander');
const { GetMapsObject, GetDirections } = require('./lib');

program
  .version('1.0.3')
  .description('Convert Google directions URL to a given output format')
  .usage('[options] <GoogleMapsDirectionsURL ...>')
  .option(
    '-K, --key <API_KEY>', 
    'Google Maps API key (defaults to env variable: GOOGLE_MAPS_API_KEY)', 
    process.env.GOOGLE_MAPS_API_KEY
  )
  .option(
    '-F, --format <type>', 
    'Output format: GeoJSON (default), TopoJSON, KML, GPX', 
     /^(GeoJSON|TopoJSON|KML|GPX)$/i,
    'GeoJSON'
  )
  .parse(process.argv);

// overwrite api key
if (program.key) process.env.GOOGLE_MAPS_API_KEY = program.key;

// if no args or api key not found
if (!program.args.length) program.help();

if (process.env.GOOGLE_MAPS_API_KEY === undefined) {
  console.error('Error: Unable to find Google Maps API key');
  process.exit(0);
}

// if args then execute main program
if (program.args.length) GetDirections(GetMapsObject(program.args[0]), program.format);
