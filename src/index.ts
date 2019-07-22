import * as angular from 'angular';
import './ng-weekly-scheduler.less';

import AdapterModule from './ng-weekly-scheduler/adapter/module';
import ConfigurationModule from './ng-weekly-scheduler/configuration/module';
import ConflictingOptionsModule from './ng-weekly-scheduler/conflicting-options/module';
import DragModule from './ng-weekly-scheduler/drag/module';
import ElementOffsetModule from './ng-weekly-scheduler/element-offset/module';
import EndAdjusterModule from './ng-weekly-scheduler/end-adjuster/module';
import FillEmptyWithDefaultModule from './ng-weekly-scheduler/fill-empty-with-default/module';
import FullCalendarModule from './ng-weekly-scheduler/full-calendar/module';
import GhostSlotModule from './ng-weekly-scheduler/ghost-slot/module';
import GroupByModule from './ng-weekly-scheduler/group-by/module';
import HandleModule from './ng-weekly-scheduler/handle/module';
import HourlyGridModule from './ng-weekly-scheduler/hourly-grid/module';
import LastGhostDayModule from './ng-weekly-scheduler/last-ghost-day/module';
import MaxTimeSlotModule from './ng-weekly-scheduler/max-time-slot/module';
import MultiSliderModule from './ng-weekly-scheduler/multislider/module';
import NullEndModule from './ng-weekly-scheduler/null-end/module';
import OverlapModule from './ng-weekly-scheduler/overlap/module';
import ScheduleAreaContainerModule from './ng-weekly-scheduler/schedule-area-container/module';
import ScheduleValidationModule from './ng-weekly-scheduler/schedule-validator/module';
import TimeModule from './ng-weekly-scheduler/time/module';
import WeeklySchedulerConfigModule from './ng-weekly-scheduler/weekly-scheduler-config/module';
import WeeklySchedulerModule from './ng-weekly-scheduler/weekly-scheduler/module';
import WeeklySchedulerItemModule from './ng-weekly-scheduler/weekly-scheduler-item/module';
import WeeklySchedulerRangeModule from './ng-weekly-scheduler/weekly-scheduler-range/module';
import WeeklySlotModule from './ng-weekly-scheduler/weekly-slot/module';
import ZoomModule from './ng-weekly-scheduler/zoom/module';

import { IWeeklySchedulerAdapter as WeeklySchedulerAdapter } from './ng-weekly-scheduler/adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerOptions as WeeklySchedulerOptions } from './ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerOptions';

export namespace weeklyScheduler {
    export type IWeeklySchedulerAdapter<TCustom, TValue> = WeeklySchedulerAdapter<TCustom, TValue>;
    export type IWeeklySchedulerOptions<T> = WeeklySchedulerOptions<T>;
}

angular.module('br.weeklyScheduler', [
    AdapterModule,
    ConfigurationModule,
    ConflictingOptionsModule,
    DragModule,
    ElementOffsetModule,
    EndAdjusterModule,
    FillEmptyWithDefaultModule,
    FullCalendarModule,
    GroupByModule,
    GhostSlotModule,
    HandleModule,
    HourlyGridModule,
    LastGhostDayModule,
    MaxTimeSlotModule,
    MultiSliderModule,
    NullEndModule,
    OverlapModule,
    ScheduleAreaContainerModule,
    ScheduleValidationModule,
    TimeModule,
    WeeklySchedulerConfigModule,
    WeeklySchedulerModule,
    WeeklySchedulerItemModule,
    WeeklySchedulerRangeModule,
    WeeklySlotModule,
    ZoomModule
]);
