import type { StaticGenerateRenderOptions } from '@builder.io/qwik-city/static';

export { StaticGenerateRenderOptions }

/**
 * @alpha
 */
export declare function vercelEdgeAdaptor(opts?: VercelEdgeAdaptorOptions): any;

/**
 * @alpha
 */
export declare interface VercelEdgeAdaptorOptions {
    /**
     * Determines if the adaptor should also run Static Site Generation (SSG).
     */
    staticGenerate?: StaticGenerateRenderOptions | true;
}

export { }
