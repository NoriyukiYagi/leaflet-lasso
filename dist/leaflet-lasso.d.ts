import { PolylineOptions, LeafletEvent, Handler, Map, LatLng, Layer, ControlOptions, Control } from 'leaflet';

interface LassoHandlerOptions {
    polygon?: PolylineOptions;
    intersect?: boolean;
}
interface LassoHandlerFinishedEventData {
    latLngs: LatLng[];
    layers: Layer[];
}
declare type LassoHandlerFinishedEvent = LeafletEvent & LassoHandlerFinishedEventData;
declare const ENABLED_EVENT = "lasso.enabled";
declare const DISABLED_EVENT = "lasso.disabled";
declare const FINISHED_EVENT = "lasso.finished";
declare const ACTIVE_CLASS = "leaflet-lasso-active";
declare class LassoHandler extends Handler {
    options: LassoHandlerOptions;
    private map;
    private polygon?;
    private onDocumentMouseMoveBound;
    private onDocumentMouseUpBound;
    private onDocumentTouchStartBound;
    private onDocumentTouchMoveBound;
    private onDocumentTouchEndBound;
    constructor(map: Map, options?: LassoHandlerOptions);
    setOptions(options: LassoHandlerOptions): void;
    toggle(): void;
    addHooks(): void;
    removeHooks(): void;
    private onMapMouseDown;
    private onDocumentMouseMove;
    private onDocumentMouseUp;
    private onDocumentTouchStart;
    private onDocumentTouchMove;
    private onDocumentTouchEnd;
    private convertTouchEventToMouseEvent;
    private finish;
}

declare type LassoControlOptions = LassoHandlerOptions & ControlOptions;
declare class LassoControl extends Control {
    options: LassoControlOptions;
    private lasso?;
    constructor(options?: LassoControlOptions);
    setOptions(options: LassoControlOptions): void;
    onAdd(map: Map): HTMLDivElement;
    enabled(): boolean;
    enable(): void;
    disable(): void;
    toggle(): void;
}

declare module 'leaflet' {
    type Lasso = LassoHandler;
    let Lasso: typeof LassoHandler;
    let lasso: (...args: ConstructorParameters<typeof LassoHandler>) => LassoHandler;
    namespace Control {
        type Lasso = LassoControl;
        let Lasso: typeof LassoControl;
    }
    namespace control {
        let lasso: (...args: ConstructorParameters<typeof LassoControl>) => LassoControl;
    }
}

export { ACTIVE_CLASS, DISABLED_EVENT, ENABLED_EVENT, FINISHED_EVENT, LassoControl, LassoControlOptions, LassoHandler, LassoHandlerFinishedEvent, LassoHandlerOptions };
