export interface IntervalGenerationOptions {
    interval: number;
    intervalsInTick: number;
    getRel(options: IntervalGenerationOptions, tick: number, subtick: number): number;
}
