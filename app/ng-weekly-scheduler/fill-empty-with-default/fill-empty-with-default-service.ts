/** When using the 'fillEmptyWithDefault' option, this service will be used to construct the correct calendar for server submission */
/** @internal */
class FillEmptyWithDefaultService {
    static $name = 'brWeeklySchedulerFillEmptyWithDefaultService';

    static $inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];

    private constructor(
        private endAdjusterService: EndAdjusterService
    ) {
    }

    fill(item: br.weeklyScheduler.IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): br.weeklyScheduler.IWeeklySchedulerRange<any>[] {
        let schedules = item.schedules;

        if (!schedules.length) {
            return [this.getEmptySchedule(item, config)];
        }

        if (schedules.length === 1) {
            let schedule = schedules[0];
            return [schedule, this.getEndSchedule(schedule, config)];
        }

        return this.getFilledSchedules(schedules, config);
    }

    private getEmptySchedule(item: br.weeklyScheduler.IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: item.day,
            start: 0,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        }
    }

    private getEndSchedule(lastSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: lastSchedule.day,
            start: lastSchedule.end,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        }
    }

    private getStartSchedule(firstSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: firstSchedule.day,
            start: 0,
            end: firstSchedule.start,
            value: config.defaultValue
        };
    }

    private getFilledSchedules(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>) {
        schedules = this.getSortedSchedules(schedules);

        let len = schedules.length - 1;
        
        // 2 at a time
        for (let i = 0; i < len; i++) {
            let currentSchedule = schedules[i];
            let nextSchedule = schedules[i + 1];

            let isFirstLoop = i == 0;

            if (isFirstLoop && !this.scheduleTouchesStart(currentSchedule, config)) {
                let startSchedule = this.getStartSchedule(currentSchedule, config);

                schedules.push(startSchedule);
            }

            if (currentSchedule.end !== nextSchedule.start) {
                let newSchedule = this.getNewSchedule(currentSchedule, nextSchedule, config);

                schedules.push(newSchedule);
            }

            let isLastLoop = i == len - 1;

            if (isLastLoop && !this.scheduleTouchesEnd(nextSchedule, config)) {
                let endSchedule = this.getEndSchedule(nextSchedule, config);

                schedules.push(endSchedule);
                break;
            }
        }

        return this.getSortedSchedules(schedules);
    }

    private getNewSchedule(currentSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, nextSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: currentSchedule.day,
            start: currentSchedule.end,
            end: nextSchedule.start,
            value: config.defaultValue
        }
    }

    private getSortedSchedules(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[]) {
        return schedules.sort((a, b) => a.start - b.start);
    }

    private scheduleTouchesStart(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return schedule.start === 0;
    }
    
    private scheduleTouchesEnd(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return schedule.end === this.endAdjusterService.adjustEndForModel(config, config.maxValue);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(FillEmptyWithDefaultService.$name, FillEmptyWithDefaultService);
