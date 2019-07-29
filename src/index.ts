export * from './ng-weekly-scheduler/adapter/IWeeklySchedulerAdapter';
export * from './ng-weekly-scheduler/resize/IResizeServiceProvider';
export * from './ng-weekly-scheduler/restriction-explanations/RestrictionExplanations';
export * from './ng-weekly-scheduler/schedule-count/ScheduleCountOptions';
export * from './ng-weekly-scheduler/weekly-scheduler-config/Days';
export * from './ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerOptions';
export * from './ng-weekly-scheduler/weekly-scheduler-item/IWeeklySchedulerItem';
export * from './ng-weekly-scheduler/weekly-scheduler-range/IWeeklySchedulerRange';

import * as angular from 'angular';
import AppModule from './ng-weekly-scheduler/app/module';

function application() {
    angular.module('br.weeklyScheduler', [AppModule]);
}

application();
