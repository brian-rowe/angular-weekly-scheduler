/** @internal */
class ConfigurationService {
    static $name = 'brWeeklySchedulerConfigurationService';

    public getConfiguration(options: br.weeklyScheduler.IWeeklySchedulerOptions<any>) {
        var interval = options.interval || 15; // minutes
        var hoursInDay = 24;
        var minutesInDay = hoursInDay * 60;
        var intervalCount = minutesInDay / interval;

        const defaultOptions = this.getDefaultOptions();

        var userOptions = angular.extend(defaultOptions, options);

        var result = angular.extend(userOptions, {
            interval: interval,
            maxValue: minutesInDay,
            hourCount: hoursInDay,
            intervalCount: intervalCount,
        });

        return result;
    }

    private getDefaultOptions(): br.weeklyScheduler.IWeeklySchedulerOptions<any> {
        return {
            createItem: (day, schedules) => { return { day: day, schedules: schedules } },
            monoSchedule: false,
            onChange: () => angular.noop(),
            onRemove: () => angular.noop(),
            restrictionExplanations: {
                maxTimeSlot: (value) => `Max time slot length: ${value}`,
                fullCalendar: 'For this calendar, every day must be completely full of schedules.',
                monoSchedule: 'This calendar may only have one time slot per day',
                nullEnds: 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.'
            },
            scheduleCountOptions: {
                count: null,
                exact: false
            }
        };
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ConfigurationService.$name, ConfigurationService);
