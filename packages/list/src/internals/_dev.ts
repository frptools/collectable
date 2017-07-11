// ## DEV [[
export function log(...args: any[]): void;
export function log(): void {
  // (<any>console).log(...arguments);
  publish(Array.from(arguments));
}

var __publishCallback: Function;
export function publish(...args: any[]): void;
export function publish(): void {
  if(__publishCallback) __publishCallback.apply(null, arguments);
}
export function setCallback(callback: Function): void {
  __publishCallback = callback;
}

declare var window: any;
if(typeof window !== 'undefined') {
  window.addEventListener('error', (ev: any) => {
    log(ev.error);
  });
}
// ]] ##