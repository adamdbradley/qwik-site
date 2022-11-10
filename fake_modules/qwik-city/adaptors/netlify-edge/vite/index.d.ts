import type { StaticGenerateRenderOptions } from '@builder.io/qwik-city/static';

/**
 * @alpha
 */
export declare function netifyEdgeAdaptor(opts?: NetlifyEdgeAdaptorOptions): any;

/**
 * @alpha
 */
export declare interface NetlifyEdgeAdaptorOptions {
    /**
     * Determines if the adaptor should also run Static Site Generation (SSG).
     */
    staticGenerate?: StaticGenerateRenderOptions | true;
}

export { StaticGenerateRenderOptions }

export { }
