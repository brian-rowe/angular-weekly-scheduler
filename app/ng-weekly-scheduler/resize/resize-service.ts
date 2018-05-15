/** @internal */
class ResizeService {
    static $name = 'resizeService';

    static $inject = [
        '$rootScope',
        '$window'
    ];

    private initialized: boolean = false;

    private constructor(
        private $rootScope: angular.IRootScopeService,
        private $window: angular.IWindowService
    ) {
    }

    public initialize(config: IWeeklySchedulerConfig<any>) {
        if (this.initialized) {
            return;
        }

        this.$window.addEventListener('resize', () => {
            // addEventListener exists outside of angular so we have to $apply the change
            this.$rootScope.$apply(() => {
                this.broadcastResizedEvent();
            });
        });

        if (config.customResizeEvents) {
            config.customResizeEvents.forEach((event) => {
                this.$rootScope.$on(event, () => {
                    this.broadcastResizedEvent();
                })
            })
        }

        this.initialized = true;
    }

    private broadcastResizedEvent() {
        this.$rootScope.$broadcast(WeeklySchedulerEvents.RESIZED);
    }
}

angular
    .module('weeklyScheduler')
    .service(ResizeService.$name, ResizeService);
