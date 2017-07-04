const program = require('commander');
const { GetMapsObject, GetDirections, ConvertDirections } = require('./lib');

program
  .usage('[options] <GoogleMapsDirectionsURL ...>')
  .option('-F, --format <type>', 'Output format: GeoJSON (default), TopoJSON, KML, GPX', /^(GeoJSON|TopoJSON|KML|GPX)$/i)
  .parse(process.argv);

GetDirections(GetMapsObject(program.args[0]))
  .then(response => ConvertDirections(response, program.format))
  .catch((err) => {
    console.error('Unable to parse URL and generate output');
    process.exit(0);
  });
