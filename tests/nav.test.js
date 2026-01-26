/**
 * Tests for shared/nav.js
 */

describe('Layout', () => {

    it('should expose global Layout object', () => {
        expect(!!window.Layout).toBeTruthy();
    });

    it('should have an init function', () => {
        expect(typeof window.Layout.init).toBe('function');
    });

    // We can't easily test DOM injection in this simple environment
    // without more complex mocking, but we can verify the API surface.
});
