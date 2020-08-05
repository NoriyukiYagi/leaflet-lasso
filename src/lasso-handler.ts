import * as L from 'leaflet';
import { LassoPolygon } from './lasso-polygon';
import { getLayersInPolygon } from './calc';
import './lasso-handler.css';

export interface LassoHandlerOptions {
    polygon?: L.PolylineOptions,
    intersect?: boolean;
}

interface LassoHandlerFinishedEventData {
    latLngs: L.LatLng[];
    layers: L.Layer[];
}

export type LassoHandlerFinishedEvent = L.LeafletEvent & LassoHandlerFinishedEventData;

export const ENABLED_EVENT = 'lasso.enabled';
export const DISABLED_EVENT = 'lasso.disabled';
export const FINISHED_EVENT = 'lasso.finished';

export const ACTIVE_CLASS = 'leaflet-lasso-active';

export class LassoHandler extends L.Handler {
    options: LassoHandlerOptions = {
        polygon: {
            color: '#00C3FF',
            weight: 2,
        },
        intersect: false,
    };

    private map: L.Map;

    private polygon?: LassoPolygon;

    private onDocumentMouseMoveBound = this.onDocumentMouseMove.bind(this);
    private onDocumentMouseUpBound = this.onDocumentMouseUp.bind(this);
    private onDocumentTouchStartBound = this.onDocumentTouchStart.bind(this);
    private onDocumentTouchMoveBound = this.onDocumentTouchMove.bind(this);
    private onDocumentTouchEndBound = this.onDocumentTouchEnd.bind(this);

    constructor(map: L.Map, options: LassoHandlerOptions = {}) {
        super(map);
        
        this.map = map;
        L.Util.setOptions(this, options);
    }

    setOptions(options: LassoHandlerOptions) {
        this.options = { ...this.options, ...options };
    }

    toggle() {
        if (this.enabled()) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    addHooks() {
        this.map.getPane('mapPane');
        this.map.on('mousedown', this.onMapMouseDown, this);
        document.addEventListener('touchstart', this.onDocumentTouchStartBound);

        const mapContainer = this.map.getContainer();
        mapContainer.classList.add(ACTIVE_CLASS);

        this.map.dragging.disable();
        this.map.fire(ENABLED_EVENT);
    }

    removeHooks() {
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
    }

    private onMapMouseDown(event: L.LeafletEvent) {
        const event2 = event as L.LeafletMouseEvent;

        // activate lasso only for left mouse button click
        if (event2.originalEvent.buttons !== 1) {
            this.disable();
            return;
        }

        // skip clicks on controls
        if ((event2.originalEvent.target as HTMLElement).closest('.leaflet-control-container')) {
            return;
        }

        this.polygon = new LassoPolygon([event2.latlng], this.options.polygon).addTo(this.map);

        document.body.classList.add(ACTIVE_CLASS);

        document.addEventListener('mousemove', this.onDocumentMouseMoveBound);
        document.addEventListener('mouseup', this.onDocumentMouseUpBound);
    }

    private onDocumentMouseMove(event: Event) {
        if (!this.polygon) {
            return;
        }

        const event2 = event as MouseEvent;

        // keep lasso active only if left mouse button is hold
        if (event2.buttons !== 1) {
            console.warn('mouseup event was missed');
            this.finish();
            return;
        }

        this.polygon.addLatLng(this.map.mouseEventToLatLng(event2));
    }

    private onDocumentMouseUp() {
        this.finish();
    }

    private onDocumentTouchStart(event: TouchEvent) {
        if (event.touches.length !== 1) {
            this.disable();
            return;
        }
        event.target?.dispatchEvent(this.convertTouchEventToMouseEvent(event, 'mousedown'));

        document.addEventListener('touchmove', this.onDocumentTouchMoveBound);
        document.addEventListener('touchend', this.onDocumentTouchEndBound);
    }

    private onDocumentTouchMove(event: TouchEvent) {
        if (event.touches.length !== 1) {
            this.finish();
            return;
        }
        event.target?.dispatchEvent(this.convertTouchEventToMouseEvent(event, 'mousemove'));
    }

    private onDocumentTouchEnd(event: TouchEvent) {
        if (event.touches.length !== 1) {
            this.finish();
            return;
        }
        event.target?.dispatchEvent(this.convertTouchEventToMouseEvent(event, 'mouseup'));
    }
    
    private convertTouchEventToMouseEvent(event: TouchEvent, mouseEventType: string): MouseEvent {
        const touches = event.changedTouches;
        const touch = touches[0];
        const mouseEvent = new MouseEvent(
            mouseEventType,
            {
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
            }
        );
        return mouseEvent;
    }

    private finish() {
        if (!this.polygon) {
            return;
        }

        const layers: L.Layer[] = [];
        this.map.eachLayer(layer => {
            if (layer === this.polygon || layer === this.polygon!.polyline || layer === this.polygon!.polygon) {
                return;
            }

            if (layer instanceof L.Marker || layer instanceof L.Path) {
                layers.push(layer);
            } else if (L.MarkerCluster && layer instanceof L.MarkerCluster) {
                layers.push(...layer.getAllChildMarkers());
            }
        });

        const selectedFeatures = getLayersInPolygon(this.polygon.polygon, layers, {
            zoom: this.map.getZoom(),
            crs: this.map.options.crs,
            intersect: this.options.intersect,
        });

        this.map.fire(FINISHED_EVENT, {
            latLngs: this.polygon.getLatLngs(),
            layers: selectedFeatures,
        } as LassoHandlerFinishedEventData);

        this.disable();
    }
}
