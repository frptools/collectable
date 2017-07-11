// ## DEV [[
var __logCallback: Function;
export function log(...args: any[]): void;
export function log(): void {
  if(__logCallback) __logCallback(Array.from(arguments));
}
export function setCallback(callback: Function): void {
  __logCallback = callback;
}

declare var window: any;
if(typeof window !== 'undefined') {
  window.addEventListener('error', (ev: any) => {
    log(ev.error);
  });
}
// ]] ##