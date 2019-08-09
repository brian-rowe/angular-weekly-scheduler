import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { TimeConstantsService } from '../time/TimeConstantsService';

export class MultisliderGridComponent implements angular.IComponentOptions {
    static $name = 'rrMultisliderGrid';

    bindings = {
        config: '<',
        items: '<'
    };

    controller = MultisliderGridController;
    controllerAs = 'multiSliderGridCtrl';

    restrict = 'E';

    require = {
        schedulerCtrl: '^brWeeklyScheduler'
    }

    template = `
        <div class="repeat" ng-repeat="item in multiSliderGridCtrl.items" ng-style="{ 
            'display': 'inline-block',
            'width': multiSliderGridCtrl.width 
        }">
            <br-daily-grid></br-daily-grid>
            <br-multi-slider config="multiSliderGridCtrl.config"
                             br-full-calendar="{{ multiSliderGridCtrl.config.fullCalendar }}"
                             br-max-time-slot="{{ multiSliderGridCtrl.config.maxTimeSlot }}"
                             br-minimum-separation="{{ multiSliderGridCtrl.config.minimumSeparation }}"
                             br-mono-schedule="{{ multiSliderGridCtrl.config.monoSchedule }}"
                             br-null-end="{{ multiSliderGridCtrl.config.nullEnds }}"
                             br-schedule-count="{{ multiSliderGridCtrl.config.scheduleCountOptions && multiSliderGridCtrl.config.scheduleCountOptions.count }}"
                             br-overlap
                             br-revalidate
                             drag-schedule="multiSliderGridCtrl.schedulerCtrl.dragSchedule"
                             ghost-values="multiSliderGridCtrl.schedulerCtrl.ghostValues"
                             ng-model="item"
                             ng-model-options="{allowInvalid: true}"
                             set-ghost-values="multiSliderGridCtrl.schedulerCtrl.setGhostValues(ghostValues)"
                             class="vertical"
                             ng-style="{ 'width': multiSliderGridCtrl.width }"
            ></br-multi-slider>
        </div>
    `;
}

class MultisliderGridController implements angular.IComponentController {
    static $inject = [
        TimeConstantsService.$name
    ];

    private items: WeeklySchedulerItem<any>[];

    private width: string;

    constructor(
        private timeConstants: TimeConstantsService
    ) {
    }

    $onInit() {
        this.width = 100 / this.timeConstants.DAYS_IN_WEEK + '%';
    }
}
