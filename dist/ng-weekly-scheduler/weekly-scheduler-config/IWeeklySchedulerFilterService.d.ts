/** @internal */
export interface IWeeklySchedulerFilterService extends angular.IFilterService {
    (name: 'rrWeeklySchedulerSecondsAsText'): (minutes: number) => string;
}
