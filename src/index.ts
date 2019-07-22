import * as angular from 'angular';
import './ng-weekly-scheduler.less';

import AdapterModule from './ng-weekly-scheduler/adapter/module';
import ConfigurationModule from './ng-weekly-scheduler/configuration/module';
import ConflictingOptionsModule from './ng-weekly-scheduler/conflicting-options/module';
import DragModule from './ng-weekly-scheduler/drag/module';
import ElementOffsetModule from './ng-weekly-scheduler/element-offset/module';
import EndAdjusterModule from './ng-weekly-scheduler/end-adjuster/module';
import GhostSlotModule from './ng-weekly-scheduler/ghost-slot/module';
import HandleModule from './ng-weekly-scheduler/handle/module';
import MultiSliderModule from './ng-weekly-scheduler/multislider/module';
import NullEndModule from './ng-weekly-scheduler/null-end/module';
import OverlapModule from './ng-weekly-scheduler/overlap/module';
import ScheduleAreaContainerModule from './ng-weekly-scheduler/schedule-area-container/module';
import ScheduleValidationModule from './ng-weekly-scheduler/schedule-validator/module';
import TimeModule from './ng-weekly-scheduler/time/module';
import WeeklySchedulerModule from './ng-weekly-scheduler/weekly-scheduler/module';
import WeeklySchedulerItemModule from './ng-weekly-scheduler/weekly-scheduler-item/module';
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
    GhostSlotModule,
    HandleModule,
    MultiSliderModule,
    NullEndModule,
    OverlapModule,
    ScheduleAreaContainerModule,
    ScheduleValidationModule,
    TimeModule,
    WeeklySchedulerModule,
    WeeklySchedulerItemModule,
    ZoomModule
]);
