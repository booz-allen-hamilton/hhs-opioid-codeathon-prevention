const fs = require('fs');
const d3 = require('d3');
const topojson = require('topojson');
const moment = require('moment');
const months = [
  '2015-01',
  '2015-02',
  '2015-03',
  '2015-04',
  '2015-05',
  '2015-06',
  '2015-07',
  '2015-08',
  '2015-09',
  '2015-10',
  '2015-11',
  '2015-12',
];

const kentucky = require('./src/data/KY-21-kentucky-counties.json');
const ohio = require('./src/data/OH-39-ohio-counties.json');
const virginia = require('./src/data/VA-51-virginia-counties.json');
const westVirginia = require('./src/data/WV-54-west-virginia-counties.json');

const counties = [
  ...topojson.feature(kentucky, kentucky.objects.cb_2015_kentucky_county_20m).features,
  ...topojson.feature(ohio, ohio.objects.cb_2015_ohio_county_20m).features,
  ...topojson.feature(virginia, virginia.objects.cb_2015_virginia_county_20m).features,
  ...topojson.feature(westVirginia, westVirginia.objects.cb_2015_west_virginia_county_20m).features,
];

fs.readFile('./src/data/nibrs_sophie_df_supplyonly.csv', 'utf8', (err, string) => {
  const data = d3.csvParse(string);

  crunch(data);
})

const crunch = (data) => {
  // const uniqueFips = [...new Set(data.map(d => d.FIPSCODE1))];
  counties.forEach(county => {
    const fips = `${county.properties.STATEFP}${county.properties.COUNTYFP}`;

    const countyData = data.filter(d => {
      return d.FIPSCODE1 === fips;
    });

    const timedCountyData = {};
    const total = {
      incidents: 0,
      grams: 0,
    }

    months.forEach(month => {
      const incidents = [];

      countyData.forEach(d => {
        if (moment(month).isSame(moment(d.incident_date), 'month')) {
          incidents.push(d);
        }
        total.incidents++;
        total.grams += Number(d.total_grams);
      });

      timedCountyData[month] = {
        incidents: incidents.length,
        grams: incidents.reduce((total, inc) => total + Number(inc.total_grams), 0),
      }
    });

    county.properties.totals = total;
    county.properties.timedData = timedCountyData;
  });

  calcMaxes(counties);

  fs.writeFile('supply.json', JSON.stringify(counties), 'utf8', (err) => {
    if(err) {
      console.log('err', err);
    }
  });
}

const calcMaxes = (counties) => {
  let maxIncidents = 0;
  let maxIncidentsMonthly = 0;
  let maxGrams = 0;
  let maxGramsMonthly = 0;

  counties.forEach(county => {
    if (county.properties.totals.incidents > maxIncidents) {
      maxIncidents = county.properties.totals.incidents;
    }
    if (county.properties.totals.grams > maxGrams) {
      maxGrams = county.properties.totals.grams;
    }

    Object.keys(county.properties.timedData).forEach(key => {
      if (county.properties.timedData[key].incidents > maxIncidentsMonthly) {
        maxIncidentsMonthly = county.properties.timedData[key].incidents;
      }
      if (county.properties.timedData[key].grams > maxGramsMonthly) {
        maxGramsMonthly = county.properties.timedData[key].grams;
      }
    })
  });

  fs.writeFile('maxSupply.json', JSON.stringify({maxIncidents, maxIncidentsMonthly, maxGrams, maxGramsMonthly}), 'utf8', err => {
    if (err) {
      console.log('err', err);
    }
  })
}
