import { RequestEvent } from '@builder.io/qwik-city/middleware/request-handler';
import type { ServerRenderOptions } from '@builder.io/qwik-city/middleware/request-handler';

/**
 * @alpha
 */
export declare function createQwikCity(opts: QwikCityVercelEdgeOptions): (request: Request) => Promise<Response | QwikCityRun<Response>>;

declare interface QwikCityRun<T> {
    response: Promise<T | null>;
    requestEv: RequestEvent;
    completion: Promise<RequestEvent>;
}

/**
 * @alpha
 */
export declare interface QwikCityVercelEdgeOptions extends ServerRenderOptions {
}

export { }
