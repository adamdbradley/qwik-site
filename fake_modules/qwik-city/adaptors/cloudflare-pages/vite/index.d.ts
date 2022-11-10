import type { StaticGenerateRenderOptions } from '@builder.io/qwik-city/static';

/**
 * @alpha
 */
export declare function cloudflarePagesAdaptor(opts?: CloudflarePagesAdaptorOptions): any;

/**
 * @alpha
 */
export declare interface CloudflarePagesAdaptorOptions {
    /**
     * Determines if the adaptor should also run Static Site Generation (SSG).
     */
    staticGenerate?: StaticGenerateRenderOptions | true;
}

export { StaticGenerateRenderOptions }

export { }