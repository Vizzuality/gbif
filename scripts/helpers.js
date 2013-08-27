function getURLParameter(name) {
  return decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,""])[1]
  );
}

var layers = {
  "dark": {
    "name": "dark",
    "url": "http://{s}.tiles.mapbox.com/v3/timrobertson100.map-c9rscfra/{z}/{x}/{y}.png",
    "attribution": "Mapbox, <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap and its contributors</a>"  
  },
  "ocean": {
    "name": "ocean",
    "url": "http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}.png",
    "attribution": "Esri, DeLorme, FAO, USGS, NOAA, GEBCO, IHO-IOC GEBCO, NGS, NIWA"
  },
  "satellite": {
    "name": "satellite",
    "url": "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png",
    "attribution": "Esri, DeLorme, FAO, NOAA, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community"
  },
  "light": {
    "name": "light",
    "url": "http://{s}.tiles.mapbox.com/v3/timrobertson100.map-s9fg80cf/{z}/{x}/{y}.png",
    "attribution": "Mapbox, <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap and its contributors</a>"  
  },
  "grey-blue": {
    "name": "grey-blue",
    "url": "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
    "attribution": "Nokia"
  }
}

var cats = {
  "sp": {
    "name": "sp",
    "title": "Preserved Specimens",
    "years": {
      "no":   0,
      "pre":  1,
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
    "name": "obs",
    "title": "Observations",
    "years": {
      "no":   14,
      "pre":  15,
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
    "name": "oth",
    "title": "Other types",
    "years": {
      "no":   30,
      "pre":  31,
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
  },
  "living": {
    "name": "living",
    "title": "Living Specimens",
    "key": 28
  },
  "fossil": {
    "name": "fossil",
    "title": "Fossils",
    "key": 29
  },
  "all": {
    "name": "all",
    "title": "All types",
    "years": {
      "no":   [0, 14, 30, 28, 29],
      "pre":  [15, 31],
      "1900": [2, 16, 32],
      "1910": [3, 17, 33],
      "1920": [4, 18, 34],
      "1930": [5, 19, 35],
      "1940": [6, 20, 36],
      "1950": [7, 21, 37],
      "1960": [8, 22, 38],
      "1970": [9, 23, 39],
      "1980": [10, 24, 40],
      "1990": [11, 25, 41],
      "2000": [12, 26, 42],
      "2010": [13, 27, 43]
    }
  }
};

var config = {
  GBIF_URL: "http://d30ugvnferw5sg.cloudfront.net/map/density/tile/density/tile.tcjson?key=1&x={x}&y={y}&z={z}&type=TAXON",
  GRAPH_MARGIN: 10,
  GRAPH_H: 40,
  GRAPH_W: 444,
  ANALYSIS_OVERLAY_STYLE: {
    allowIntersection: false,
    shapeOptions: {
      color: '#DA6D64',
      opacity: 1
    }
  },
  MAP: {
    type: "TAXON",
    key: 1,
    layer: "dark",
    cat: "sp",
    lat: 36.60670888641815,
    lng: 38.627929687,
    zoom: 2
  }
};
