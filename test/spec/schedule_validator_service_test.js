describe('schedule validator service', function () {
    var $service;

    beforeEach(module('demoApp'));

    beforeEach(inject(function(_scheduleValidatorService_) {
        $service = _scheduleValidatorService_;
    }));

    function getTestItem(schedules) {
        return {
            defaultValue: true,
            label: 'test',
            editable: true,
            schedules: schedules
        }
    }

    describe('should validate', function() {
        it('non-touching schedules as valid', function () {
            let item = getTestItem([
                { start: 0, end: 60, value: true },
                { start: 75, end: 120, value: true }
            ]);

            expect($service.areSchedulesValid(item)).toBeTruthy();
        });
    });
});