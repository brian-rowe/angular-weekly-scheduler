/// <reference types="angular" />
/// <reference types="angular-mocks" />
import * as angular from 'angular';
import { AdapterService } from '../adapter/AdapterService';
import { ConfigurationService } from '../configuration/ConfigurationService';
import { ConflictingOptionsService } from '../conflicting-options/ConflictingOptionsService';
import { LastGhostDayService } from '../last-ghost-day/LastGhostDayService';
import { MissingDaysService } from '../missing-days/MissingDaysService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { HourTextService } from '../hour-text/HourTextService';
/** @internal */
export declare class WeeklySchedulerController implements angular.IController {
    private $element;
    private $scope;
    private $timeout;
    private adapterService;
    private configurationService;
    private conflictingOptionsService;
    private hourTextService;
    private lastGhostDayService;
    private missingDaysService;
    static $controllerAs: string;
    static $name: string;
    static $inject: string[];
    constructor($element: angular.IAugmentedJQuery, $scope: angular.IScope, $timeout: angular.ITimeoutService, adapterService: AdapterService, configurationService: ConfigurationService, conflictingOptionsService: ConflictingOptionsService, hourTextService: HourTextService, lastGhostDayService: LastGhostDayService, missingDaysService: MissingDaysService);
    private _originalItems;
    private adapter;
    invalidMessage: string;
    private dragSchedule;
    private ghostValues;
    /** this is required to be part of a form for dirty/valid checks */
    formController: angular.IFormController;
    hoverClass: string;
    config: IWeeklySchedulerConfig<any>;
    items: WeeklySchedulerItem<any>[];
    options: IWeeklySchedulerOptions<any>;
    private verticalTickCount;
    private verticalTicks;
    $onInit(): void;
    $postLink(): void;
    getInvalidMessage(): string;
    hasInvalidSchedule(): boolean;
    private buildItems(items);
    private buildItemsFromAdapter();
    private getDayText(item);
    private getHourText(item);
    private purgeItems(items);
    private prepareItems(items);
    private setGhostValues(ghostValues);
    private resetZoom();
    private zoomIn();
    private rollback();
    private rotate();
    private save();
    private watchAdapter();
    private watchHoverClass();
}
/** @internal */
export declare class WeeklySchedulerComponent implements angular.IComponentOptions {
    static $name: string;
    bindings: {
        adapter: string;
        hoverClass: string;
        options: string;
    };
    controller: string;
    controllerAs: string;
    require: {
        formController: string;
    };
    template: any;
}
