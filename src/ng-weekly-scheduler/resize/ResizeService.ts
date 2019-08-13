import * as angular from 'angular';
import { IResizeServiceProvider } from './IResizeServiceProvider';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { IResizeService } from './IResizeService';

/** @internal */
export class ResizeServiceProvider implements IResizeServiceProvider {
    public static $name = 'rr.weeklyScheduler.resizeService';

    constructor() {
        this.$get.$inject = [
            '$rootScope',
            '$window'
        ]
    }

    private customResizeEvents: string[] = [];

    private serviceInitialized: boolean = false;

    public setCustomResizeEvents(events: string[]) {
        this.customResizeEvents = events;
    }

    public $get(
        $rootScope: angular.IRootScopeService,
        $window: angular.IWindowService
    ): IResizeService {
        return {
            initialize: () => {
                if (this.serviceInitialized) {
                    return;
                }
        
                $window.addEventListener('resize', () => {
                    // addEventListener exists outside of angular so we have to $apply the change
                    $rootScope.$apply(() => {
                        $rootScope.$broadcast(WeeklySchedulerEvents.RESIZED);
                    });
                });
        
                if (this.customResizeEvents) {
                    this.customResizeEvents.forEach((event) => {
                        $rootScope.$on(event, () => {
                            $rootScope.$broadcast(WeeklySchedulerEvents.RESIZED);
                        })
                    })
                }
        
                this.serviceInitialized = true; 
            }
        };
    }
}
