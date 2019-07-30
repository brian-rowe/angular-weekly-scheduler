import * as angular from 'angular';

class TestModule {
    static run() {
        describe('hmm', () => {
            it('should work', () => {
                expect(1).toBe(1);
            });
        });
    }
}

TestModule.run();
