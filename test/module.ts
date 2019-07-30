import * as angular from 'angular';
import 'angular-mocks';
import DemoModule from '../src/ng-weekly-scheduler/demo/module';

import { DemoTests } from './spec/demo_test';
import { FillEmptyWithDefaultServiceTests } from './spec/fill_empty_with_default_service_test';
import { FullCalendarValidatorServiceTests } from './spec/full_calendar_validator_service_test';
import { LastGhostDayServiceTests } from './spec/last_ghost_day_service_test';
import { MaxTimeSlotValidatorServiceTests } from './spec/max_time_slot_validator_service_test';
import { MinimumSeparationValidatorServiceTests } from './spec/minimum_separation_validator_service_test';
import { MonoScheduleValidatorServiceTests } from './spec/mono_schedule_validator_service_test';
import { NullEndValidatorServiceTests } from './spec/null_end_validator_service_test';
import { OverlapServiceTests } from './spec/overlap_service_test';
import { OverlapValidatorServiceTests } from './spec/overlap_validator_service_test';
import { PurgeDefaultServiceTests } from './spec/purge_default_service_test';
import { ScheduleCountValidatorServiceTests } from './spec/schedule_count_validator_service_test';
import { SecondsAsTextFilterTests } from './spec/seconds_as_text_filter_test';
import { TimeOfDayFilterTests } from './spec/time_of_day_filter_test';
import { WeeklySchedulerTests } from './spec/weekly_scheduler_test';

class TestModule {
    static run() {
        beforeEach(angular.mock.module(DemoModule));

        var tests = [
            DemoTests,
            FillEmptyWithDefaultServiceTests,
            FullCalendarValidatorServiceTests,
            LastGhostDayServiceTests,
            MaxTimeSlotValidatorServiceTests,
            MinimumSeparationValidatorServiceTests,
            MonoScheduleValidatorServiceTests,
            NullEndValidatorServiceTests,
            OverlapServiceTests,
            OverlapValidatorServiceTests,
            PurgeDefaultServiceTests,
            ScheduleCountValidatorServiceTests,
            SecondsAsTextFilterTests,
            TimeOfDayFilterTests,
            WeeklySchedulerTests
        ];

        tests.forEach(test => test.run());
    }
}

TestModule.run();
