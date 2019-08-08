export interface IntervalGenerationOptions {
    cssDimensionProperty: 'height' | 'width';
    interval: number;
    intervalsInTick: number;
    getRel(options: IntervalGenerationOptions, tick: number, subtick: number): number;
}
