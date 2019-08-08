import * as angular from 'angular';
import '../../ng-weekly-scheduler.less';

import AdapterModule from '../adapter/module';
import ConfigurationModule from '../configuration/module';
import ConflictingOptionsModule from '../conflicting-options/module';
import DailyGridModule from '../daily-grid/module';
import DragModule from '../drag/module';
import ElementOffsetModule from '../element-offset/module';
import EndAdjusterModule from '../end-adjuster/module';
import FillEmptyWithDefaultModule from '../fill-empty-with-default/module';
import FullCalendarModule from '../full-calendar/module';
import GhostSlotModule from '../ghost-slot/module';
import GridGeneratorModule from '../grid-generator/module';
import GroupByModule from '../group-by/module';
import HandleModule from '../handle/module';
import HourlyGridModule from '../hourly-grid/module';
import HourTextModule from '../hour-text/module';
import IntervalGenerationModule from '../interval-generation/module';
import LastGhostDayModule from '../last-ghost-day/module';
import MaxTimeSlotModule from '../max-time-slot/module';
import MinimumSeparationModule from '../minimum-separation/module';
import MissingDaysModule from '../missing-days/module';
import MonoScheduleModule from '../mono-schedule/module';
import MouseTrackerModule from '../mouse-tracker/module';
import MultiSliderModule from '../multislider/module';
import NullEndModule from '../null-end/module';
import OverlapModule from '../overlap/module';
import PurgeDefaultModule from '../purge-default/module';
import ResizeModule from '../resize/module';
import RestrictionExplanationsModule from '../restriction-explanations/module';
import RevalidateModule from '../revalidate/module';
import ScheduleAreaContainerModule from '../schedule-area-container/module';
import ScheduleCountModule from '../schedule-count/module';
import ScheduleValidationModule from '../schedule-validator/module';
import ScrollModule from '../scroll/module';
import SlotStyleModule from '../slot-style/module';
import TimeModule from '../time/module';
import TimeRangeModule from '../time-range/module';
import TouchModule from '../touch/module';
import WeeklySchedulerConfigModule from '../weekly-scheduler-config/module';
import WeeklySchedulerModule from '../weekly-scheduler/module';
import WeeklySchedulerItemModule from '../weekly-scheduler-item/module';
import WeeklySchedulerRangeModule from '../weekly-scheduler-range/module';
import WeeklySlotModule from '../weekly-slot/module';
import ValueNormalizationModule from '../value-normalization/module';
import ZoomModule from '../zoom/module';

export default angular.module('br.weeklyScheduler.app', [
    AdapterModule,
    ConfigurationModule,
    ConflictingOptionsModule,
    DailyGridModule,
    DragModule,
    ElementOffsetModule,
    EndAdjusterModule,
    FillEmptyWithDefaultModule,
    FullCalendarModule,
    GridGeneratorModule,
    GroupByModule,
    GhostSlotModule,
    HandleModule,
    HourlyGridModule,
    HourTextModule,
    IntervalGenerationModule,
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
    SlotStyleModule,
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
])
.name;
