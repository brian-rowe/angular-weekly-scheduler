import { MultiSliderController } from '../multislider/multislider';

/** @internal */
export class GhostSlotController implements angular.IComponentController {
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
export class GhostSlotComponent implements angular.IComponentOptions {
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
