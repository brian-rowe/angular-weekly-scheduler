import { MultiSliderController } from '../multislider/multislider';

/** @internal */
export class GhostSlotController implements angular.IComponentController {
    static $name = 'rrGhostSlotController';
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
export class GhostSlotComponent implements angular.IComponentOptions {
    static $name = 'rrGhostSlot';

    controller = GhostSlotController.$name;
    controllerAs = GhostSlotController.$controllerAs;

    require = {
        multiSliderCtrl: '^rrMultiSlider'
    };

    template = require('./ghost-slot.html');

    transclude = true;
}
