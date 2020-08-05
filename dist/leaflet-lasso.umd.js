(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet')) :
    typeof define === 'function' && define.amd ? define(['exports', 'leaflet'], factory) :
    (global = global || self, factory(global.LeafletLasso = {}, global.L));
}(this, (function (exports, L) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var LassoPolygon = /** @class */ (function (_super) {
        __extends(LassoPolygon, _super);
        function LassoPolygon(latlngs, options) {
            var _this = _super.call(this) || this;
            _this.polyline = L.polyline(latlngs, options);
            _this.polygon = L.polygon(latlngs, __assign(__assign({}, options), { weight: 0 }));
            return _this;
        }
        LassoPolygon.prototype.onAdd = function (map) {
            this.polyline.addTo(map);
            this.polygon.addTo(map);
            return this;
        };
        LassoPolygon.prototype.onRemove = function () {
            this.polyline.remove();
            this.polygon.remove();
            return this;
        };
        LassoPolygon.prototype.addLatLng = function (latlng) {
            this.polyline.addLatLng(latlng);
            this.polygon.addLatLng(latlng);
            return this;
        };
        LassoPolygon.prototype.getLatLngs = function () {
            return this.polygon.getLatLngs()[0];
        };
        LassoPolygon.prototype.toGeoJSON = function () {
            return this.polygon.toGeoJSON();
        };
        return LassoPolygon;
    }(L.Layer));

    /* @preserve
    * @terraformer/spatial - v2.0.6 - MIT
    * Copyright (c) 2012-2020 Environmental Systems Research Institute, Inc.
    * Mon May 18 2020 14:30:36 GMT-0700 (Pacific Daylight Time)
    */

    /* Copyright (c) 2012-2019 Environmental Systems Research Institute, Inc.
     * Apache-2.0 */
    var isNumber = function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };

    var edgeIntersectsEdge = function edgeIntersectsEdge(a1, a2, b1, b2) {
      var uaT = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
      var ubT = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
      var uB = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

      if (uB !== 0) {
        var ua = uaT / uB;
        var ub = ubT / uB;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
          return true;
        }
      }

      return false;
    };

    var arraysIntersectArrays = function arraysIntersectArrays(a, b) {
      if (isNumber(a[0][0])) {
        if (isNumber(b[0][0])) {
          for (var i = 0; i < a.length - 1; i++) {
            for (var j = 0; j < b.length - 1; j++) {
              if (edgeIntersectsEdge(a[i], a[i + 1], b[j], b[j + 1])) {
                return true;
              }
            }
          }
        } else {
          for (var k = 0; k < b.length; k++) {
            if (arraysIntersectArrays(a, b[k])) {
              return true;
            }
          }
        }
      } else {
        for (var l = 0; l < a.length; l++) {
          if (arraysIntersectArrays(a[l], b)) {
            return true;
          }
        }
      }

      return false;
    };
    var coordinatesContainPoint = function coordinatesContainPoint(coordinates, point) {
      var contains = false;

      for (var i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
        if ((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1] || coordinates[j][1] <= point[1] && point[1] < coordinates[i][1]) && point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0]) {
          contains = !contains;
        }
      }

      return contains;
    };
    var pointsEqual = function pointsEqual(a, b) {
      for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }

      return true;
    };

    /*
    Internal: used for sorting
    */

    var compSort = function compSort(p1, p2) {
      if (p1[0] > p2[0]) {
        return -1;
      } else if (p1[0] < p2[0]) {
        return 1;
      } else if (p1[1] > p2[1]) {
        return -1;
      } else if (p1[1] < p2[1]) {
        return 1;
      } else {
        return 0;
      }
    };
    /*
    Internal: Returns a copy of coordinates for a closed polygon
    */

    var closedPolygon = function closedPolygon(coordinates) {
      var outer = [];

      for (var i = 0; i < coordinates.length; i++) {
        var inner = coordinates[i].slice();

        if (pointsEqual(inner[0], inner[inner.length - 1]) === false) {
          inner.push(inner[0]);
        }

        outer.push(inner);
      }

      return outer;
    };
    /*
    Internal: safe warning
    */

    function warn() {
      var args = Array.prototype.slice.apply(arguments);

      if (typeof console !== 'undefined' && console.warn) {
        console.warn.apply(console, args);
      }
    }
    var coordinatesEqual = function coordinatesEqual(a, b) {
      if (a.length !== b.length) {
        return false;
      }

      var na = a.slice().sort(compSort);
      var nb = b.slice().sort(compSort);

      for (var i = 0; i < na.length; i++) {
        if (na[i].length !== nb[i].length) {
          return false;
        }

        for (var j = 0; j < na.length; j++) {
          if (na[i][j] !== nb[i][j]) {
            return false;
          }
        }
      }

      return true;
    };

    /*
    Internal: Calculate an bounding box from an nested array of positions
    [
      [
        [ [lng, lat],[lng, lat],[lng, lat] ]
      ]
      [
        [lng, lat],[lng, lat],[lng, lat]
      ]
      [
        [lng, lat],[lng, lat],[lng, lat]
      ]
    ]
    */
    var calculateBoundsFromNestedArrays = function calculateBoundsFromNestedArrays(array) {
      var x1 = null;
      var x2 = null;
      var y1 = null;
      var y2 = null;

      for (var i = 0; i < array.length; i++) {
        var inner = array[i];

        for (var j = 0; j < inner.length; j++) {
          var lonlat = inner[j];
          var lon = lonlat[0];
          var lat = lonlat[1];

          if (x1 === null) {
            x1 = lon;
          } else if (lon < x1) {
            x1 = lon;
          }

          if (x2 === null) {
            x2 = lon;
          } else if (lon > x2) {
            x2 = lon;
          }

          if (y1 === null) {
            y1 = lat;
          } else if (lat < y1) {
            y1 = lat;
          }

          if (y2 === null) {
            y2 = lat;
          } else if (lat > y2) {
            y2 = lat;
          }
        }
      }

      return [x1, y1, x2, y2];
    };
    /*
    Internal: Calculate a bounding box from an array of arrays of arrays
    [
      [ [lng, lat],[lng, lat],[lng, lat] ]
      [ [lng, lat],[lng, lat],[lng, lat] ]
      [ [lng, lat],[lng, lat],[lng, lat] ]
    ]
    */


    var calculateBoundsFromNestedArrayOfArrays = function calculateBoundsFromNestedArrayOfArrays(array) {
      var x1 = null;
      var x2 = null;
      var y1 = null;
      var y2 = null;

      for (var i = 0; i < array.length; i++) {
        var inner = array[i]; // return calculateBoundsFromNestedArrays(inner); // more DRY?

        for (var j = 0; j < inner.length; j++) {
          var innerinner = inner[j];

          for (var k = 0; k < innerinner.length; k++) {
            var lonlat = innerinner[k];
            var lon = lonlat[0];
            var lat = lonlat[1];

            if (x1 === null) {
              x1 = lon;
            } else if (lon < x1) {
              x1 = lon;
            }

            if (x2 === null) {
              x2 = lon;
            } else if (lon > x2) {
              x2 = lon;
            }

            if (y1 === null) {
              y1 = lat;
            } else if (lat < y1) {
              y1 = lat;
            }

            if (y2 === null) {
              y2 = lat;
            } else if (lat > y2) {
              y2 = lat;
            }
          }
        }
      }

      return [x1, y1, x2, y2];
    };
    /*
    Internal: Calculate a bounding box from an array of positions
    [
      [lng, lat],[lng, lat],[lng, lat]
    ]
    */


    var calculateBoundsFromArray = function calculateBoundsFromArray(array) {
      var x1 = null;
      var x2 = null;
      var y1 = null;
      var y2 = null;

      for (var i = 0; i < array.length; i++) {
        var lonlat = array[i];
        var lon = lonlat[0];
        var lat = lonlat[1];

        if (x1 === null) {
          x1 = lon;
        } else if (lon < x1) {
          x1 = lon;
        }

        if (x2 === null) {
          x2 = lon;
        } else if (lon > x2) {
          x2 = lon;
        }

        if (y1 === null) {
          y1 = lat;
        } else if (lat < y1) {
          y1 = lat;
        }

        if (y2 === null) {
          y2 = lat;
        } else if (lat > y2) {
          y2 = lat;
        }
      }

      return [x1, y1, x2, y2];
    };
    /*
    Internal: Calculate an bounding box for a feature collection
    */


    var calculateBoundsForFeatureCollection = function calculateBoundsForFeatureCollection(featureCollection) {
      var extents = [];

      for (var i = featureCollection.features.length - 1; i >= 0; i--) {
        var extent = calculateBounds(featureCollection.features[i].geometry);
        extents.push([extent[0], extent[1]]);
        extents.push([extent[2], extent[3]]);
      }

      return calculateBoundsFromArray(extents);
    };
    /*
    Internal: Calculate an bounding box for a geometry collection
    */


    var calculateBoundsForGeometryCollection = function calculateBoundsForGeometryCollection(geometryCollection) {
      var extents = [];

      for (var i = geometryCollection.geometries.length - 1; i >= 0; i--) {
        var extent = calculateBounds(geometryCollection.geometries[i]);
        extents.push([extent[0], extent[1]]);
        extents.push([extent[2], extent[3]]);
      }

      return calculateBoundsFromArray(extents);
    };

    var calculateBounds = function calculateBounds(geojson) {
      if (geojson.type) {
        switch (geojson.type) {
          case 'Point':
            return [geojson.coordinates[0], geojson.coordinates[1], geojson.coordinates[0], geojson.coordinates[1]];

          case 'MultiPoint':
            return calculateBoundsFromArray(geojson.coordinates);

          case 'LineString':
            return calculateBoundsFromArray(geojson.coordinates);

          case 'MultiLineString':
            return calculateBoundsFromNestedArrays(geojson.coordinates);

          case 'Polygon':
            return calculateBoundsFromNestedArrays(geojson.coordinates);

          case 'MultiPolygon':
            return calculateBoundsFromNestedArrayOfArrays(geojson.coordinates);

          case 'Feature':
            return geojson.geometry ? calculateBounds(geojson.geometry) : null;

          case 'FeatureCollection':
            return calculateBoundsForFeatureCollection(geojson);

          case 'GeometryCollection':
            return calculateBoundsForGeometryCollection(geojson);

          default:
            throw new Error('Unknown type: ' + geojson.type);
        }
      }

      return null;
    };

    var polygonContainsPoint = function polygonContainsPoint(polygon, point) {
      if (polygon && polygon.length) {
        if (polygon.length === 1) {
          // polygon with no holes
          return coordinatesContainPoint(polygon[0], point);
        } else {
          // polygon with holes
          if (coordinatesContainPoint(polygon[0], point)) {
            for (var i = 1; i < polygon.length; i++) {
              if (coordinatesContainPoint(polygon[i], point)) {
                return false; // found in hole
              }
            }

            return true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    };

    var within = function within(geoJSON, comparisonGeoJSON) {
      var coordinates, i, contains; // if we are passed a feature, use the polygon inside instead

      if (comparisonGeoJSON.type === 'Feature') {
        comparisonGeoJSON = comparisonGeoJSON.geometry;
      } // point.within(point) :: equality


      if (comparisonGeoJSON.type === 'Point') {
        if (geoJSON.type === 'Point') {
          return pointsEqual(geoJSON.coordinates, comparisonGeoJSON.coordinates);
        }
      } // point.within(multilinestring)


      if (comparisonGeoJSON.type === 'MultiLineString') {
        if (geoJSON.type === 'Point') {
          for (i = 0; i < geoJSON.coordinates.length; i++) {
            var linestring = {
              type: 'LineString',
              coordinates: comparisonGeoJSON.coordinates[i]
            };

            if (within(geoJSON, linestring)) {
              return true;
            }
          }
        }
      } // point.within(linestring), point.within(multipoint)


      if (comparisonGeoJSON.type === 'LineString' || comparisonGeoJSON.type === 'MultiPoint') {
        if (geoJSON.type === 'Point') {
          for (i = 0; i < comparisonGeoJSON.coordinates.length; i++) {
            if (geoJSON.coordinates.length !== comparisonGeoJSON.coordinates[i].length) {
              return false;
            }

            if (pointsEqual(geoJSON.coordinates, comparisonGeoJSON.coordinates[i])) {
              return true;
            }
          }
        }
      }

      if (comparisonGeoJSON.type === 'Polygon') {
        // polygon.within(polygon)
        if (geoJSON.type === 'Polygon') {
          // check for equal polygons
          if (comparisonGeoJSON.coordinates.length === geoJSON.coordinates.length) {
            for (i = 0; i < geoJSON.coordinates.length; i++) {
              if (coordinatesEqual(geoJSON.coordinates[i], comparisonGeoJSON.coordinates[i])) {
                return true;
              }
            }
          }

          if (geoJSON.coordinates.length && polygonContainsPoint(comparisonGeoJSON.coordinates, geoJSON.coordinates[0][0])) {
            return !arraysIntersectArrays(closedPolygon(geoJSON.coordinates), closedPolygon(comparisonGeoJSON.coordinates));
          } else {
            return false;
          } // point.within(polygon)

        } else if (geoJSON.type === 'Point') {
          return polygonContainsPoint(comparisonGeoJSON.coordinates, geoJSON.coordinates); // linestring/multipoint withing polygon
        } else if (geoJSON.type === 'LineString' || geoJSON.type === 'MultiPoint') {
          if (!geoJSON.coordinates || geoJSON.coordinates.length === 0) {
            return false;
          }

          for (i = 0; i < geoJSON.coordinates.length; i++) {
            if (polygonContainsPoint(comparisonGeoJSON.coordinates, geoJSON.coordinates[i]) === false) {
              return false;
            }
          }

          return true; // multilinestring.within(polygon)
        } else if (geoJSON.type === 'MultiLineString') {
          for (i = 0; i < geoJSON.coordinates.length; i++) {
            var ls = {
              type: 'LineString',
              coordinates: geoJSON.coordinates[i]
            };

            if (within(ls, comparisonGeoJSON) === false) {
              contains++;
              return false;
            }
          }

          return true; // multipolygon.within(polygon)
        } else if (geoJSON.type === 'MultiPolygon') {
          for (i = 0; i < geoJSON.coordinates.length; i++) {
            var p1 = {
              type: 'Polygon',
              coordinates: geoJSON.coordinates[i]
            };

            if (within(p1, comparisonGeoJSON) === false) {
              return false;
            }
          }

          return true;
        }
      }

      if (comparisonGeoJSON.type === 'MultiPolygon') {
        // point.within(multipolygon)
        if (geoJSON.type === 'Point') {
          if (comparisonGeoJSON.coordinates.length) {
            for (i = 0; i < comparisonGeoJSON.coordinates.length; i++) {
              coordinates = comparisonGeoJSON.coordinates[i];

              if (polygonContainsPoint(coordinates, geoJSON.coordinates) && arraysIntersectArrays([geoJSON.coordinates], comparisonGeoJSON.coordinates) === false) {
                return true;
              }
            }
          }

          return false; // polygon.within(multipolygon)
        } else if (geoJSON.type === 'Polygon') {
          for (i = 0; i < geoJSON.coordinates.length; i++) {
            if (comparisonGeoJSON.coordinates[i].length === geoJSON.coordinates.length) {
              for (var j = 0; j < geoJSON.coordinates.length; j++) {
                if (coordinatesEqual(geoJSON.coordinates[j], comparisonGeoJSON.coordinates[i][j])) {
                  return true;
                }
              }
            }
          }

          if (arraysIntersectArrays(geoJSON.coordinates, comparisonGeoJSON.coordinates) === false) {
            if (comparisonGeoJSON.coordinates.length) {
              for (i = 0; i < comparisonGeoJSON.coordinates.length; i++) {
                coordinates = comparisonGeoJSON.coordinates[i];

                if (polygonContainsPoint(coordinates, geoJSON.coordinates[0][0]) === false) {
                  contains = false;
                } else {
                  contains = true;
                }
              }

              return contains;
            }
          } // linestring.within(multipolygon), multipoint.within(multipolygon)

        } else if (geoJSON.type === 'LineString' || geoJSON.type === 'MultiPoint') {
          for (i = 0; i < comparisonGeoJSON.coordinates.length; i++) {
            var poly = {
              type: 'Polygon',
              coordinates: comparisonGeoJSON.coordinates[i]
            };

            if (within(geoJSON, poly)) {
              return true;
            }

            return false;
          } // multilinestring.within(multipolygon)

        } else if (geoJSON.type === 'MultiLineString') {
          for (i = 0; i < geoJSON.coordinates.length; i++) {
            var _ls = {
              type: 'LineString',
              coordinates: geoJSON.coordinates[i]
            };

            if (within(_ls, comparisonGeoJSON) === false) {
              return false;
            }
          }

          return true; // multipolygon.within(multipolygon)
        } else if (geoJSON.type === 'MultiPolygon') {
          for (i = 0; i < comparisonGeoJSON.coordinates.length; i++) {
            var mpoly = {
              type: 'Polygon',
              coordinates: comparisonGeoJSON.coordinates[i]
            };

            if (within(geoJSON, mpoly) === false) {
              return false;
            }
          }

          return true;
        }
      } // default to false


      return false;
    };

    var contains = function contains(geoJSON, comparisonGeoJSON) {
      return within(comparisonGeoJSON, geoJSON);
    };

    var intersects = function intersects(geoJSON, comparisonGeoJSON) {
      // if we are passed a feature, use the polygon inside instead
      if (comparisonGeoJSON.type === 'Feature') {
        comparisonGeoJSON = comparisonGeoJSON.geometry;
      }

      if (within(geoJSON, comparisonGeoJSON) || within(comparisonGeoJSON, geoJSON)) {
        return true;
      }

      if (geoJSON.type !== 'Point' && geoJSON.type !== 'MultiPoint' && comparisonGeoJSON.type !== 'Point' && comparisonGeoJSON.type !== 'MultiPoint') {
        return arraysIntersectArrays(geoJSON.coordinates, comparisonGeoJSON.coordinates);
      } else if (geoJSON.type === 'Feature') {
        // in the case of a Feature, use the internal geometry for intersection
        var inner = geoJSON.geometry;
        return intersects(inner, comparisonGeoJSON);
      }

      warn('Type ' + geoJSON.type + ' to ' + comparisonGeoJSON.type + ' intersection is not supported by intersects');
      return false;
    };

    var VINCENTY = {
      a: 6378137,
      b: 6356752.3142,
      f: 1 / 298.257223563
    };
    var toCircle = function toCircle(center, radius, interpolate) {
      var steps = interpolate || 64;
      var rad = radius || 250;

      if (!center || center.length < 2 || !rad || !steps) {
        throw new Error('Terraformer: missing parameter for Terraformer.Circle');
      }

      return {
        type: 'Feature',
        geometry: createGeodesicCircle(center, rad, steps),
        properties: {
          radius: rad,
          center: center,
          steps: steps
        }
      };
    };
    /* cribbed from
      http://stackoverflow.com/questions/24145205/writing-a-function-to-convert-a-circle-to-a-polygon-using-leaflet-js
    */

    var createGeodesicCircle = function createGeodesicCircle(center, radius, interpolate) {
      var steps = interpolate || 64;
      var polygon = {
        type: 'Polygon',
        coordinates: [[]]
      };
      var angle;

      for (var i = 0; i < steps; i++) {
        angle = i * 360 / steps;
        polygon.coordinates[0].push(destinationVincenty(center, angle, radius));
      }

      polygon.coordinates = closedPolygon(polygon.coordinates);
      return polygon;
    };

    var destinationVincenty = function destinationVincenty(coords, brng, dist) {
      var cos2SigmaM, sinSigma, cosSigma, deltaSigma;
      var a = VINCENTY.a;
      var b = VINCENTY.b;
      var f = VINCENTY.f;
      var lon1 = coords[0];
      var lat1 = coords[1];
      var s = dist;
      var pi = Math.PI;
      var alpha1 = brng * pi / 180; // converts brng degrees to radius

      var sinAlpha1 = Math.sin(alpha1);
      var cosAlpha1 = Math.cos(alpha1);
      var tanU1 = (1 - f) * Math.tan(lat1 * pi / 180
      /* converts lat1 degrees to radius */
      );
      var cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
      var sinU1 = tanU1 * cosU1;
      var sigma1 = Math.atan2(tanU1, cosAlpha1);
      var sinAlpha = cosU1 * sinAlpha1;
      var cosSqAlpha = 1 - sinAlpha * sinAlpha;
      var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
      var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
      var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
      var sigma = s / (b * A);
      var sigmaP = 2 * Math.PI;

      while (Math.abs(sigma - sigmaP) > 1e-12) {
        cos2SigmaM = Math.cos(2 * sigma1 + sigma);
        sinSigma = Math.sin(sigma);
        cosSigma = Math.cos(sigma);
        deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;
      }

      var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
      var lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
      var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
      var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      var lam = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
      var lamFunc = lon1 + lam * 180 / pi; // converts lam radius to degrees

      var lat2a = lat2 * 180 / pi; // converts lat2a radius to degrees

      return [lamFunc, lat2a];
    };

    function geoJSONGeometryToBounds(geometry) {
        var bounds = calculateBounds(geometry);
        var leafletBounds = L.latLngBounds([bounds[1], bounds[0]], [bounds[3], bounds[2]]);
        return leafletBounds;
    }
    function getCircleMarkerRadius(circleMarker, crs, zoom) {
        var latLng = circleMarker.getLatLng();
        var point = crs.latLngToPoint(latLng, zoom);
        var delta = circleMarker.getRadius() / Math.SQRT2;
        var topLeftPoint = L.point([point.x - delta, point.y - delta]);
        var topLeftLatLng = crs.pointToLatLng(topLeftPoint, zoom);
        var radius = crs.distance(latLng, topLeftLatLng);
        return radius;
    }
    function circleToGeoJSONGeometry(latLng, radius) {
        return toCircle(L.GeoJSON.latLngToCoords(latLng), radius).geometry;
    }
    function layerToGeoJSONGeometry(layer, options) {
        if (options === void 0) { options = {}; }
        if (layer instanceof L.Circle) {
            var latLng = layer.getLatLng();
            var radius = layer.getRadius();
            return circleToGeoJSONGeometry(latLng, radius);
        }
        else if (layer instanceof L.CircleMarker) {
            if (options.zoom != undefined && options.crs != undefined) {
                var latLng = layer.getLatLng();
                var radius = getCircleMarkerRadius(layer, options.crs, options.zoom);
                return circleToGeoJSONGeometry(latLng, radius);
            }
            else {
                console.warn("Zoom and CRS is required for calculating CircleMarker polygon, falling back to center point only");
                return layer.toGeoJSON().geometry;
            }
        }
        else if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            return layer.toGeoJSON().geometry;
        }
    }
    function polygonContains(polygon, layerGeometry) {
        return contains(polygon, layerGeometry);
    }
    function polygonIntersects(polygon, layerGeometry) {
        if (layerGeometry.type === "Point") {
            return contains(polygon, layerGeometry);
        }
        // try contains first (fast), then intersects (slower)
        return contains(polygon, layerGeometry) || intersects(polygon, layerGeometry);
    }
    function getLayersInPolygon(polygon, layers, options) {
        if (options === void 0) { options = {}; }
        var polygonGeometry = polygon.toGeoJSON().geometry;
        var polygonBounds = polygon.getBounds();
        var selectedLayers = layers.filter(function (layer) {
            // check bounds first (fast)
            var layerGeometry;
            var layerBounds;
            if (layer instanceof L.Polyline) {
                layerBounds = layer.getBounds();
            }
            else {
                layerGeometry = layerToGeoJSONGeometry(layer, options);
                layerBounds = geoJSONGeometryToBounds(layerGeometry);
            }
            if (!polygonBounds.intersects(layerBounds)) {
                return false;
            }
            // check full geometry (slower)
            if (!layerGeometry) {
                layerGeometry = layerToGeoJSONGeometry(layer, options);
            }
            return options.intersect ?
                polygonIntersects(polygonGeometry, layerGeometry) :
                polygonContains(polygonGeometry, layerGeometry);
        });
        return selectedLayers;
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = ".leaflet-lasso-active {\r\n    cursor: crosshair;\r\n    -webkit-user-select: none;\r\n       -moz-user-select: none;\r\n        -ms-user-select: none;\r\n            user-select: none;\r\n}\r\n\r\n.leaflet-lasso-active .leaflet-interactive {\r\n    cursor: crosshair;\r\n    pointer-events: none;\r\n}";
    styleInject(css_248z);

    var ENABLED_EVENT = 'lasso.enabled';
    var DISABLED_EVENT = 'lasso.disabled';
    var FINISHED_EVENT = 'lasso.finished';
    var ACTIVE_CLASS = 'leaflet-lasso-active';
    var LassoHandler = /** @class */ (function (_super) {
        __extends(LassoHandler, _super);
        function LassoHandler(map, options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, map) || this;
            _this.options = {
                polygon: {
                    color: '#00C3FF',
                    weight: 2,
                },
                intersect: false,
            };
            _this.onDocumentMouseMoveBound = _this.onDocumentMouseMove.bind(_this);
            _this.onDocumentMouseUpBound = _this.onDocumentMouseUp.bind(_this);
            _this.onDocumentTouchStartBound = _this.onDocumentTouchStart.bind(_this);
            _this.onDocumentTouchMoveBound = _this.onDocumentTouchMove.bind(_this);
            _this.onDocumentTouchEndBound = _this.onDocumentTouchEnd.bind(_this);
            _this.map = map;
            L.Util.setOptions(_this, options);
            return _this;
        }
        LassoHandler.prototype.setOptions = function (options) {
            this.options = __assign(__assign({}, this.options), options);
        };
        LassoHandler.prototype.toggle = function () {
            if (this.enabled()) {
                this.disable();
            }
            else {
                this.enable();
            }
        };
        LassoHandler.prototype.addHooks = function () {
            this.map.getPane('mapPane');
            this.map.on('mousedown', this.onMapMouseDown, this);
            document.addEventListener('touchstart', this.onDocumentTouchStartBound);
            var mapContainer = this.map.getContainer();
            mapContainer.classList.add(ACTIVE_CLASS);
            this.map.dragging.disable();
            this.map.fire(ENABLED_EVENT);
        };
        LassoHandler.prototype.removeHooks = function () {
            if (this.polygon) {
                this.map.removeLayer(this.polygon);
                this.polygon = undefined;
            }
            this.map.off('mousedown', this.onMapMouseDown, this);
            document.removeEventListener('mousemove', this.onDocumentMouseMoveBound);
            document.removeEventListener('mouseup', this.onDocumentMouseUpBound);
            document.removeEventListener('touchstart', this.onDocumentTouchStartBound);
            document.removeEventListener('touchmove', this.onDocumentTouchMoveBound);
            document.removeEventListener('touchend', this.onDocumentTouchEndBound);
            this.map.getContainer().classList.remove(ACTIVE_CLASS);
            document.body.classList.remove(ACTIVE_CLASS);
            this.map.dragging.enable();
            this.map.fire(DISABLED_EVENT);
        };
        LassoHandler.prototype.onMapMouseDown = function (event) {
            var event2 = event;
            // ignore leaflet simulated event
            if (event2.originalEvent.buttons === 0) {
                return;
            }
            // activate lasso only for left mouse button click
            if (event2.originalEvent.buttons !== 1) {
                this.disable();
                return;
            }
            // skip clicks on controls
            if (event2.originalEvent.target.closest('.leaflet-control-container')) {
                return;
            }
            this.polygon = new LassoPolygon([event2.latlng], this.options.polygon).addTo(this.map);
            document.body.classList.add(ACTIVE_CLASS);
            document.addEventListener('mousemove', this.onDocumentMouseMoveBound);
            document.addEventListener('mouseup', this.onDocumentMouseUpBound);
        };
        LassoHandler.prototype.onDocumentMouseMove = function (event) {
            if (!this.polygon) {
                return;
            }
            var event2 = event;
            // ignore leaflet simulated event
            if (event2.buttons === 0) {
                return;
            }
            // keep lasso active only if left mouse button is hold
            if (event2.buttons !== 1) {
                console.warn('mouseup event was missed');
                this.finish();
                return;
            }
            this.polygon.addLatLng(this.map.mouseEventToLatLng(event2));
        };
        LassoHandler.prototype.onDocumentMouseUp = function () {
            this.finish();
        };
        LassoHandler.prototype.onDocumentTouchStart = function (event) {
            var _a;
            if (event.touches.length !== 1) {
                this.disable();
                return;
            }
            (_a = event.target) === null || _a === void 0 ? void 0 : _a.dispatchEvent(this.convertTouchEventToMouseEvent(event, 'mousedown'));
            document.addEventListener('touchmove', this.onDocumentTouchMoveBound);
            document.addEventListener('touchend', this.onDocumentTouchEndBound);
        };
        LassoHandler.prototype.onDocumentTouchMove = function (event) {
            var _a;
            if (event.touches.length !== 1) {
                this.finish();
                return;
            }
            (_a = event.target) === null || _a === void 0 ? void 0 : _a.dispatchEvent(this.convertTouchEventToMouseEvent(event, 'mousemove'));
        };
        LassoHandler.prototype.onDocumentTouchEnd = function () {
            this.finish();
        };
        LassoHandler.prototype.convertTouchEventToMouseEvent = function (event, mouseEventType) {
            var touches = event.changedTouches;
            var touch = touches[0];
            var mouseEvent = new MouseEvent(mouseEventType, {
                bubbles: true,
                cancelable: true,
                view: window,
                detail: 1,
                screenX: touch.screenX,
                screenY: touch.screenY,
                clientX: touch.clientX,
                clientY: touch.clientY,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: null,
                buttons: 1,
            });
            return mouseEvent;
        };
        LassoHandler.prototype.finish = function () {
            var _this = this;
            if (!this.polygon) {
                return;
            }
            var layers = [];
            this.map.eachLayer(function (layer) {
                if (layer === _this.polygon || layer === _this.polygon.polyline || layer === _this.polygon.polygon) {
                    return;
                }
                if (layer instanceof L.Marker || layer instanceof L.Path) {
                    layers.push(layer);
                }
                else if (L.MarkerCluster && layer instanceof L.MarkerCluster) {
                    layers.push.apply(layers, layer.getAllChildMarkers());
                }
            });
            var selectedFeatures = getLayersInPolygon(this.polygon.polygon, layers, {
                zoom: this.map.getZoom(),
                crs: this.map.options.crs,
                intersect: this.options.intersect,
            });
            this.map.fire(FINISHED_EVENT, {
                latLngs: this.polygon.getLatLngs(),
                layers: selectedFeatures,
            });
            this.disable();
        };
        return LassoHandler;
    }(L.Handler));

    var css_248z$1 = ".leaflet-control-lasso {\r\n    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsSAAALEgHS3X78AAAD6UlEQVR4nO1b7XHbMAwFfP0fdYKqE8QbRJ0gGUEjaAR3A4/gbuBOUHWCKhs4E1SegD06jzmYpWhJpiRKNu58Tix+AA8gCQIQK6Xolml109LfAbgDcAfg5gH4NPQEzJwSkf4kRLR2NKmJqNLfSqlqaH7+4y/0McjML0SUQdinHkO8ApCSiPZKqToogxYFAQBC50T03NDkN74raFzSGtahreSLo+9PALG7mlEXaQD6fMD0BgIp8TkQ0ZaINChpl7ExZoZxK2vcGr8nfXl2ztm5g1twI/Q6KHPvVlFg/DMgJgEAWpWCay3lIYX2zJ1bQFQhAO+i9b2l8VEEd/BSWEooBgUAm5REPvg67AGCrZDdIABgQ6qF1oOu8QBAbK4FwTd4bq23SbXeks/OIPg0f7V5TQRCpz3BNdhamH30wgu+CwFC66VqD5IIByRas/eAYDbGqi8AW+FszEp4ocC6y1KQneW6z+YmvJDDLIVDVwBKdNzPVXghi/FbLjprp4AIM2fi6loMcusal8zN8eXirOp885jNrn/BAlKxnL17GWPj+As8viqlDguwAG3V+hR7JKJvSqmyqd1KmMnrUoQHGaEzX6OVaLAfg6sRyUSeUt+UKxGobDSTmZKR5yIAj/h79IhsDPSRFxg6+ho9AAukpI1IgydGxiY4dSRON+/SXgwAyE1sHbkF79JmeEuaPs91H4DWf+Ffk1nSgDwQ0RH5iUbZqgXcAI0MG/FbKn7f+i5DZo14PabISR/lb0qpjWETXq252LmSsidaCYfh8s0pbnKZuFHuEzNvmNl5MiR9YmmRLYHaxb8VJ3SG+UzD3ZyvwyI/UEPozMoZFE2xTjOADId1yuhGBMLO0raSUSE74HsGgDoPiZULsIISPkFqtUlEuOx0YsiHadeIakTC57bGPW0zAVRiP+yVXJhY+M6JHLFcCtfDvUAoahCseoXW0Wz0Oy1310O5WUQLgmX2ZddEzkffhoc2CJMUQ3h4kzt+v7S4ke/CRKWYaBtBYURmF2tcMda7bC0absWEk5TG4ISyS3Suury1BqAB+XIMIDCv7eAEsUTvHtDQoak8bhPSexSlcXadYBlqHu8p0BMIZRVIti9QeD/Hc/S1hVawgKDuufQDriqVZeYcAjeVyL4BGBc1lcaSKY8dolaYmTXgf0ykKFStcCIKpM33Q8vuR1EcXeEuMkhoDnyWCKB81wGUQV+aEhFaJ/mSlgPwYvyHZ8QN9SlS38RbY3hnYQ/NHyH8KVq0+DdGdCgMS+sRe1ImX8xYvAUw8wGb7Q9c88/2l1sAIEPBlPM0ur85GgEPk9IdgAh4mJTuAETAw3RERP8Ab2Uzgrad13wAAAAASUVORK5CYII=');\r\n    background-size: 22px;\r\n}";
    styleInject(css_248z$1);

    var LassoControl = /** @class */ (function (_super) {
        __extends(LassoControl, _super);
        function LassoControl(options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this) || this;
            _this.options = {
                position: 'topright',
            };
            L.Util.setOptions(_this, options);
            return _this;
        }
        LassoControl.prototype.setOptions = function (options) {
            this.options = __assign(__assign({}, this.options), options);
            if (this.lasso) {
                this.lasso.setOptions(this.options);
            }
        };
        LassoControl.prototype.onAdd = function (map) {
            this.lasso = new LassoHandler(map, this.options);
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            var button = L.DomUtil.create('a', 'leaflet-control-lasso', container);
            button.href = '#';
            button.title = 'Toggle Lasso';
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', button.title);
            L.DomEvent.addListener(button, 'click', this.toggle, this);
            L.DomEvent.disableClickPropagation(button);
            return container;
        };
        LassoControl.prototype.enabled = function () {
            if (!this.lasso) {
                return false;
            }
            return this.lasso.enabled();
        };
        LassoControl.prototype.enable = function () {
            if (!this.lasso) {
                return;
            }
            this.lasso.enable();
        };
        LassoControl.prototype.disable = function () {
            if (!this.lasso) {
                return;
            }
            this.lasso.disable();
        };
        LassoControl.prototype.toggle = function () {
            if (!this.lasso) {
                return;
            }
            this.lasso.toggle();
        };
        return LassoControl;
    }(L.Control));

    if (typeof window.L !== 'undefined') {
        window.L.Lasso = LassoHandler;
        window.L.lasso = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (LassoHandler.bind.apply(LassoHandler, __spreadArrays([void 0], args)))();
        };
        window.L.Control.Lasso = LassoControl;
        window.L.control.lasso = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (LassoControl.bind.apply(LassoControl, __spreadArrays([void 0], args)))();
        };
    }

    exports.ACTIVE_CLASS = ACTIVE_CLASS;
    exports.DISABLED_EVENT = DISABLED_EVENT;
    exports.ENABLED_EVENT = ENABLED_EVENT;
    exports.FINISHED_EVENT = FINISHED_EVENT;
    exports.LassoControl = LassoControl;
    exports.LassoHandler = LassoHandler;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=leaflet-lasso.umd.js.map
