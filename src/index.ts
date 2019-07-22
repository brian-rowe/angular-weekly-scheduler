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
import MinimumSeparationModule from './ng-weekly-scheduler/minimum-separation/module';
import MissingDaysModule from './ng-weekly-scheduler/missing-days/module';
import MonoScheduleModule from './ng-weekly-scheduler/mono-schedule/module';
import MouseTrackerModule from './ng-weekly-scheduler/mouse-tracker/module';
import MultiSliderModule from './ng-weekly-scheduler/multislider/module';
import NullEndModule from './ng-weekly-scheduler/null-end/module';
import OverlapModule from './ng-weekly-scheduler/overlap/module';
import PurgeDefaultModule from './ng-weekly-scheduler/purge-default/module';
import ResizeModule from './ng-weekly-scheduler/resize/module';
import RestrictionExplanationsModule from './ng-weekly-scheduler/restriction-explanations/module';
import RevalidateModule from './ng-weekly-scheduler/revalidate/module';
import ScheduleAreaContainerModule from './ng-weekly-scheduler/schedule-area-container/module';
import ScheduleCountModule from './ng-weekly-scheduler/schedule-count/module';
import ScheduleValidationModule from './ng-weekly-scheduler/schedule-validator/module';
import ScrollModule from './ng-weekly-scheduler/scroll/module';
import TimeModule from './ng-weekly-scheduler/time/module';
import TimeRangeModule from './ng-weekly-scheduler/time-range/module';
import TouchModule from './ng-weekly-scheduler/touch/module';
import WeeklySchedulerConfigModule from './ng-weekly-scheduler/weekly-scheduler-config/module';
import WeeklySchedulerModule from './ng-weekly-scheduler/weekly-scheduler/module';
import WeeklySchedulerItemModule from './ng-weekly-scheduler/weekly-scheduler-item/module';
import WeeklySchedulerRangeModule from './ng-weekly-scheduler/weekly-scheduler-range/module';
import WeeklySlotModule from './ng-weekly-scheduler/weekly-slot/module';
import ValueNormalizationModule from './ng-weekly-scheduler/value-normalization/module';
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
    MinimumSeparationModule,
    MonoScheduleModule,
    MouseTrackerModule,
    MissingDaysModule,
    MultiSliderModule,
    NullEndModule,
    OverlapModule,
    PurgeDefaultModule,
    ResizeModule,
    RestrictionExplanationsModule,
    RevalidateModule,
    ScheduleAreaContainerModule,
    ScheduleCountModule,
    ScheduleValidationModule,
    ScrollModule,
    TimeModule,
    TimeRangeModule,
    TouchModule,
    WeeklySchedulerConfigModule,
    WeeklySchedulerModule,
    WeeklySchedulerItemModule,
    WeeklySchedulerRangeModule,
    WeeklySlotModule,
    ValueNormalizationModule,
    ZoomModule
]);
