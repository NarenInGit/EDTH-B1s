import * as L from 'leaflet';
import SimpleHeat, { Gradient } from 'simpleheat';
export { SimpleHeat, Gradient };
export declare type AggregateType = 'mean' | 'count' | 'sum' | 'distinct' | 'min' | 'max' | 'variance' | 'variancep' | 'stdev' | 'stdevp';
export declare type Aggregation = {
    data: {
        mean: number;
        sigma: number;
        count: number;
        sum: number;
        distinct: number;
        min: number;
        max: number;
        variance: number;
        variancep: number;
        stdev: number;
        stdevp: number;
    };
    same: Set<number>;
    seen: number;
};
export declare function computeAggregate(agg: Aggregation, intensity: number, aggregateType?: AggregateType): number;
export interface SimpleHeatOptions {
    opacity: number;
    minOpacity: number;
    maxZoom: number;
    radius: number;
    blur: number;
    max: number;
    gradient?: Gradient;
}
export interface HeatmapOptions<Point> extends L.LayerOptions, Partial<SimpleHeatOptions> {
    points: Point[];
    longitudeExtractor: (point: Point) => number;
    latitudeExtractor: (point: Point) => number;
    intensityExtractor: (point: Point) => number;
    fitBoundsOnLoad?: boolean;
    fitBoundsOnUpdate?: boolean;
    onStatsUpdate?: (stats: {
        min: number;
        max: number;
    }) => void;
    useLocalExtrema?: boolean;
    aggregateType?: AggregateType;
}
export default class Heatmap<Point> extends L.Layer {
    private __el?;
    private __heatmap?;
    private _frame?;
    options: HeatmapOptions<Point>;
    constructor(options?: HeatmapOptions<Point>);
    private get _heatmap();
    private get _el();
    getPane(): HTMLElement;
    onAdd(map: L.Map): this;
    onRemove(): this;
    getEvents(): {
        [name: string]: L.LeafletEventHandlerFn;
    };
    _animateZoom(e: L.LeafletEvent): void;
    fitBounds(): void;
    resize(): void;
    getMinOpacity(): number;
    getOpacity(): number;
    getMax(): number;
    getRadius(): number;
    getMaxZoom(): number;
    getBlur(): number;
    getSimpleHeatOptions(): SimpleHeatOptions;
    /**
     * Update various heatmap properties like radius, gradient, and max
     */
    updateSimpleHeat(options: Partial<SimpleHeatOptions>): void;
    /**
     * Update the heatmap's radius and blur (blur is optional)
     */
    updateHeatmapRadius(radius?: number, blur?: number): void;
    /**
     * Update the heatmap's gradient
     */
    updateHeatmapGradient(gradient?: Gradient): void;
    /**
     * Update the heatmap's maximum
     */
    updateHeatmapMax(maximum?: number): void;
    redraw(): void;
    reset(): void;
}
