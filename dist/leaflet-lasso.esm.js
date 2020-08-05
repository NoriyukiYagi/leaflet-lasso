import { polyline, polygon, Layer, Polyline, latLngBounds, Circle, GeoJSON, CircleMarker, Marker, point, Path, MarkerCluster, Util, Handler, DomUtil, DomEvent, Control } from 'leaflet';
import { contains, calculateBounds, toCircle, intersects } from '@terraformer/spatial';

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
        _this.polyline = polyline(latlngs, options);
        _this.polygon = polygon(latlngs, __assign(__assign({}, options), { weight: 0 }));
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
}(Layer));

function geoJSONGeometryToBounds(geometry) {
    var bounds = calculateBounds(geometry);
    var leafletBounds = latLngBounds([bounds[1], bounds[0]], [bounds[3], bounds[2]]);
    return leafletBounds;
}
function getCircleMarkerRadius(circleMarker, crs, zoom) {
    var latLng = circleMarker.getLatLng();
    var point$1 = crs.latLngToPoint(latLng, zoom);
    var delta = circleMarker.getRadius() / Math.SQRT2;
    var topLeftPoint = point([point$1.x - delta, point$1.y - delta]);
    var topLeftLatLng = crs.pointToLatLng(topLeftPoint, zoom);
    var radius = crs.distance(latLng, topLeftLatLng);
    return radius;
}
function circleToGeoJSONGeometry(latLng, radius) {
    return toCircle(GeoJSON.latLngToCoords(latLng), radius).geometry;
}
function layerToGeoJSONGeometry(layer, options) {
    if (options === void 0) { options = {}; }
    if (layer instanceof Circle) {
        var latLng = layer.getLatLng();
        var radius = layer.getRadius();
        return circleToGeoJSONGeometry(latLng, radius);
    }
    else if (layer instanceof CircleMarker) {
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
    else if (layer instanceof Marker || layer instanceof Polyline) {
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
        if (layer instanceof Polyline) {
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
        Util.setOptions(_this, options);
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
    LassoHandler.prototype.onDocumentTouchEnd = function (event) {
        var _a;
        if (event.touches.length !== 1) {
            this.finish();
            return;
        }
        (_a = event.target) === null || _a === void 0 ? void 0 : _a.dispatchEvent(this.convertTouchEventToMouseEvent(event, 'mouseup'));
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
            if (layer instanceof Marker || layer instanceof Path) {
                layers.push(layer);
            }
            else if (MarkerCluster && layer instanceof MarkerCluster) {
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
}(Handler));

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
        Util.setOptions(_this, options);
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
        var container = DomUtil.create('div', 'leaflet-bar leaflet-control');
        var button = DomUtil.create('a', 'leaflet-control-lasso', container);
        button.href = '#';
        button.title = 'Toggle Lasso';
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', button.title);
        DomEvent.addListener(button, 'click', this.toggle, this);
        DomEvent.disableClickPropagation(button);
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
}(Control));

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

export { ACTIVE_CLASS, DISABLED_EVENT, ENABLED_EVENT, FINISHED_EVENT, LassoControl, LassoHandler };
//# sourceMappingURL=leaflet-lasso.esm.js.map
