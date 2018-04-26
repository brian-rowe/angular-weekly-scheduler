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

    public initialize() {
        if (this.initialized) {
            return;
        }

        this.$window.addEventListener('resize', () => {
            this.$rootScope.$broadcast(WeeklySchedulerEvents.RESIZED);
        });

        this.initialized = true;
    }
}

angular
    .module('weeklyScheduler')
    .service(ResizeService.$name, ResizeService)
    .run([ResizeService.$name, (resizeService: ResizeService) => resizeService.initialize()]);
