/** @internal */
export interface IWeeklySchedulerFilterService extends angular.IFilterService {
    (name: 'brWeeklySchedulerSecondsAsText'): (minutes: number) => string;
}
