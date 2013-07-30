var config = {
  CARTODB_URL:    "http://matallo.cartodb.com/api/v2/sql",
  GBIF_URL:       "http://apidev.gbif.org/map/density/tile/density/tile.tcjson?key=1&x={x}&y={y}&z={z}&type=TAXON",
  GRAPH_MARGIN:   10,
  GRAPH_H:        40,
  GRAPH_W:        504
  // ZOOM:           3,
  // MINZOOM:        3,
  // MAXZOOM:        17,
  // LAT:            15,
  // LNG:            27
};

var cat_keys = {
  "sp": {
    "1900": 2,
    "1910": 3,
    "1920": 4,
    "1930": 5,
    "1940": 6,
    "1950": 7,
    "1960": 8,
    "1970": 9,
    "1980": 10,
    "1990": 11,
    "2000": 12,
    "2010": 13,
  }
};

function yearsToKeys(agg, left_year, right_year) {
  console.log(agg, left_year, right_year);
}

// SP_NO_YEAR: 0,
// SP_PRE_1900: 1,
// SP_1900_1910: 2,
// SP_1910_1920: 3,
// SP_1920_1930: 4,
// SP_1930_1940: 5,
// SP_1940_1950: 6,
// SP_1950_1960: 7,
// SP_1960_1970: 8,
// SP_1970_1980: 9,
// SP_1980_1990: 10,
// SP_1990_2000: 11,
// SP_2000_2010: 12,
// SP_2010_2020: 13,
// OBS_NO_YEAR: 14,
// OBS_PRE_1900: 15,
// OBS_1900_1910: 16,
// OBS_1910_1920: 17,
// OBS_1920_1930: 18,
// OBS_1930_1940: 19,
// OBS_1940_1950: 20,
// OBS_1950_1960: 21,
// OBS_1960_1970: 22,
// OBS_1970_1980: 23,
// OBS_1980_1990: 24,
// OBS_1990_2000: 25,
// OBS_2000_2010: 26,
// OBS_2010_2020: 27,
// LIVING: 28,
// FOSSIL: 29,
// OTH_NO_YEAR: 30,
// OTH_PRE_1900: 31,
// OTH_1900_1910: 32,
// OTH_1910_1920: 33,
// OTH_1920_1930: 34,
// OTH_1930_1940: 35,
// OTH_1940_1950: 36,
// OTH_1950_1960: 37,
// OTH_1960_1970: 38,
// OTH_1970_1980: 39,
// OTH_1980_1990: 40,
// OTH_1990_2000: 41,
// OTH_2000_2010: 42,
// OTH_2010_2020: 4