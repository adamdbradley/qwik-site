import type { RequestHandler } from '@builder.io/qwik-city';
import type { ServerRenderOptions } from '@builder.io/qwik-city/middleware/request-handler';

/**
 * @alpha
 */
export declare function createQwikCity(opts: QwikCityCloudflarePagesOptions): ({ request, env, waitUntil, next }: EventPluginContext) => Promise<Response>;

/**
 * @alpha
 */
export declare interface EventPluginContext {
    request: Request;
    waitUntil: (promise: Promise<any>) => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: Record<string, any>;
}

/**
 * @alpha
 */
export declare interface QwikCityCloudflarePagesOptions extends ServerRenderOptions {
}

/**
 * @alpha
 */
export declare type RequestHandlerCloudflarePages = RequestHandler<{
    env: EventPluginContext['env'];
}>;

export { }
