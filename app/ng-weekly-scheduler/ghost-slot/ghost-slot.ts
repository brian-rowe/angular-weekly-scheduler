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

    public $postLink() {
        this.$element.addClass('slot');
        this.multiSliderCtrl.$hoverElement = this.$element;
    }
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
        +
    `;
}


angular.module('br.weeklyScheduler')
    .controller(GhostSlotController.$name, GhostSlotController)
    .component(GhostSlotComponent.$name, new GhostSlotComponent());
