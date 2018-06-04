/** @internal */
class GhostSlotController implements angular.IComponentController {
    static $name = 'brGhostSlotController';
    static $controllerAs = 'ghostSlotCtrl';

    static $inject = [
        '$element',
        '$timeout'
    ];

    constructor(
        private $element: angular.IAugmentedJQuery,
        private $timeout: angular.ITimeoutService
    ) {
    }

    private isDragging: boolean = false;
    private multiSliderCtrl: MultiSliderController;
    private dragTimeout: angular.IPromise<void>;

    public $postLink() {
        this.$element.addClass('slot');
        this.multiSliderCtrl.$hoverElement = this.$element;
    }

    public drag(event: MouseEvent) {
        if (this.isDragging) {
            this.multiSliderCtrl.adjustGhost(event);
        }
    }

    public startDrag() {
        // Delay start of drag
        this.dragTimeout = this.$timeout(() => {
            this.isDragging = true;
            this.$element.addClass('active');
        }, 250);
    }

    public stopDrag() {
        // Cancel timeout if applicable
        this.$timeout.cancel(this.dragTimeout);
        this.isDragging = false;
        this.$element.removeClass('active');

        this.multiSliderCtrl.onHoverElementClick();
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
             ondragstop="ghostSlotCtrl.stopDrag()"
        >
        +
        </div>
    `;
}


angular.module('br.weeklyScheduler')
    .controller(GhostSlotController.$name, GhostSlotController)
    .component(GhostSlotComponent.$name, new GhostSlotComponent());
