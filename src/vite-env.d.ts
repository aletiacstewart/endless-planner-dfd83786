/// <reference types="vite/client" />

declare const __BUILD_STAMP__: string;

declare module "virtual:build-stamp" {
  export const stamp: string;
}
