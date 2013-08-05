var config = {
  GBIF_URL:       "http://apidev.gbif.org/map/density/tile/density/tile.tcjson?key=1&x={x}&y={y}&z={z}&type=TAXON",
  GRAPH_MARGIN:   10,
  GRAPH_H:        40,
  GRAPH_W:        504,
  ANALYSIS_OVERLAY_STYLE: {
    allowIntersection: false,
    shapeOptions: {
        color: '#DA6D64',
        opacity: 1
    }
  }
};

var cats = {
  "sp": {
    "title": "Preserved Specimens",
    "years": {
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
      "2010": 13
    }
  },
  "obs": {
    "title": "Observations",
    "years": {
      "1900": 16,
      "1910": 17,
      "1920": 18,
      "1930": 19,
      "1940": 20,
      "1950": 21,
      "1960": 22,
      "1970": 23,
      "1980": 24,
      "1990": 25,
      "2000": 26,
      "2010": 27
    }
  },
  "oth": {
    "title": "Other types",
    "years": {
      "1900": 32,
      "1910": 33,
      "1920": 34,
      "1930": 35,
      "1940": 36,
      "1950": 37,
      "1960": 38,
      "1970": 39,
      "1980": 40,
      "1990": 41,
      "2000": 42,
      "2010": 43
    }
  }
};

// SP_NO_YEAR: 0,
// SP_PRE_1900: 1,
// OBS_NO_YEAR: 14,
// OBS_PRE_1900: 15,
// LIVING: 28,
// FOSSIL: 29,
// OTH_NO_YEAR: 30,
// OTH_PRE_1900: 31,
