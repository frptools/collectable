// ## DEBUG START
export function log(...args: any[])
export function log() {
  publish(Array.from(arguments));
}

var __publishCallback: Function;
export function publish(...args: any[]): void
export function publish(): void {
  if(__publishCallback) __publishCallback.apply(null, arguments);
}
export function setCallback(callback: Function): void {
  __publishCallback = callback;
}

declare var window;
if(typeof window !== 'undefined') {
  window.addEventListener('error', ev => {
    log(ev.error);
  });
}
// ## DEBUG END