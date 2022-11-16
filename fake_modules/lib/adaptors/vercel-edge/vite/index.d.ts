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
     * Determines if the build should auto-generate the `.vercel/output/config.json` config.
     *
     * Defaults to `true`.
     */
    outputConfig?: boolean;
    /**
     * The `entrypoint` property in the `.vc-config.json` file.
     * Indicates the initial file where code will be executed for the Edge Function.
     *
     * Defaults to `entry.vercel-edge.js`.
     */
    vcConfigEntryPoint?: string;
    /**
     * The `envVarsInUse` property in the `.vc-config.json` file.
     * List of environment variable names that will be available for the Edge Function to utilize.
     *
     * Defaults to `undefined`.
     */
    vcConfigEnvVarsInUse?: string[];
    /**
     * Determines if the adaptor should also run Static Site Generation (SSG).
     */
    staticGenerate?: StaticGenerateRenderOptions | true;
}

export { }