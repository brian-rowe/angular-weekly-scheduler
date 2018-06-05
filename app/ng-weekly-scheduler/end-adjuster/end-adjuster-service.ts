/** @internal */
class EndAdjusterService {
    static $name = 'brWeeklySchedulerEndAdjusterService';

    public adjustEndForModel(config: IWeeklySchedulerConfig<any>, end: number) {
        if (end === config.maxValue) {
            return 0;
        }

        return end;
    }

    public adjustEndForView(config: IWeeklySchedulerConfig<any>, end: number) {
        if (end === 0) {
            return config.maxValue;
        }

        return end;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(EndAdjusterService.$name, EndAdjusterService);