/** @internal */
class GhostSlotController implements angular.IComponentController {
    static $name = 'brGhostSlotController';
    static $controllerAs = 'ghostSlotCtrl';

    static $inject = [
        '$element'
    ];

    constructor(
        private $element: angular.IAugmentedJQuery
    ) {
    }

    private multiSliderCtrl: MultiSliderController;
}

/** @internal */
class GhostSlotComponent implements angular.IComponentOptions {
    static $name = 'brGhostSlot';

    controller = GhostSlotController.$name;
    controllerAs = GhostSlotController.$controllerAs;

    require = {
        multiSliderCtrl: '^brMultiSlider'
    };

    template = `
        <ng-transclude class="fullWidth"></ng-transclude>
    `;

    transclude = true;
}


angular.module('br.weeklyScheduler')
    .controller(GhostSlotController.$name, GhostSlotController)
    .component(GhostSlotComponent.$name, new GhostSlotComponent());
