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

    public drag(event: MouseEvent) {
        this.multiSliderCtrl.adjustGhost(event);
    }

    public startDrag() {
        // Don't do anything
    }

    public stopDrag() {
        // Don't do anything, the ng-click handler should handle this
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
        <div br-handle
             ondragstart="ghostSlotCtrl.startDrag()"
             ondrag="ghostSlotCtrl.drag(event)"
             ondragend="ghostSlotCtrl.stopDrag()"
        >
        +
        </div>
    `;
}


angular.module('br.weeklyScheduler')
    .controller(GhostSlotController.$name, GhostSlotController)
    .component(GhostSlotComponent.$name, new GhostSlotComponent());
