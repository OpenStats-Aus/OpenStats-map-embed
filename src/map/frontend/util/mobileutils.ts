export function isTouchOnly() {
    return window.matchMedia("(pointer: coarse)").matches;
}