/**
 * Tests for shared/detector-utils.js
 */

describe('DetectorUtils', () => {
    
    it('should expose global DetectorUtils object', () => {
        expect(!!window.DetectorUtils).toBeTruthy();
    });

    it('should have correct days of the week', () => {
        const days = window.DetectorUtils.DAYS;
        expect(days.length).toBe(7);
        expect(days[0]).toBe('Sunday');
        expect(days[1]).toBe('Monday');
        expect(days[6]).toBe('Saturday');
    });

    it('should pick a random item from an array', () => {
        const items = ['a', 'b', 'c'];
        const item = window.DetectorUtils.getRandom(items);
        expect(items).toContain(item);
    });

    it('should not fail on empty array (returns undefined)', () => {
        const item = window.DetectorUtils.getRandom([]);
        expect(item).toBe(undefined);
    });

    // Test init logic by mocking document/Date
    // This is tricky in a simple runner, so we'll test the side effects we can control
    it('should have an init function', () => {
        expect(typeof window.DetectorUtils.init).toBe('function');
    });
});
