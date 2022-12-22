import { createContext, componentQrl, inlinedQrl, useContext, jsx, SkipRender, withLocale, noSerialize, useEnvData, useStore, useSignal, useLexicalScope, useContextProvider, useTaskQrl, getLocale, Slot, useOnDocument, implicit$FirstArg, untrack, _wrapSignal } from "@builder.io/qwik";
import { jsx as jsx$1 } from "@builder.io/qwik/jsx-runtime";
import { isServer, isBrowser } from "@builder.io/qwik/build";
import swRegister from "@qwik-city-sw-register";
const RouteStateContext = /* @__PURE__ */ createContext("qc-s");
const ContentContext = /* @__PURE__ */ createContext("qc-c");
const ContentInternalContext = /* @__PURE__ */ createContext("qc-ic");
const DocumentHeadContext = /* @__PURE__ */ createContext("qc-h");
const RouteLocationContext = /* @__PURE__ */ createContext("qc-l");
const RouteNavigateContext = /* @__PURE__ */ createContext("qc-n");
const RouteActionContext = /* @__PURE__ */ createContext("qc-a");
const RouterOutlet = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const { contents } = useContext(ContentInternalContext);
  if (contents && contents.length > 0) {
    const contentsLen = contents.length;
    let cmp = null;
    for (let i = contentsLen - 1; i >= 0; i--)
      cmp = jsx(contents[i].default, {
        children: cmp
      });
    return cmp;
  }
  return SkipRender;
}, "RouterOutlet_component_AKetNByE5TM"));
const Content = RouterOutlet;
const MODULE_CACHE = /* @__PURE__ */ new WeakMap();
const POPSTATE_FALLBACK_INITIALIZED = /* @__PURE__ */ Symbol();
const CLIENT_HISTORY_INITIALIZED = /* @__PURE__ */ Symbol();
const CLIENT_DATA_CACHE = /* @__PURE__ */ new Map();
const QACTION_KEY = "qaction";
const loadRoute = async (routes, menus, cacheModules, pathname) => {
  if (Array.isArray(routes))
    for (const route of routes) {
      const match = route[0].exec(pathname);
      if (match) {
        const loaders = route[1];
        const params = getPathParams(route[2], match);
        const routeBundleNames = route[4];
        const mods = new Array(loaders.length);
        const pendingLoads = [];
        const menuLoader = getMenuLoader(menus, pathname);
        let menu = void 0;
        loaders.forEach((moduleLoader, i) => {
          loadModule(moduleLoader, pendingLoads, (routeModule) => mods[i] = routeModule, cacheModules);
        });
        loadModule(menuLoader, pendingLoads, (menuModule) => menu = menuModule?.default, cacheModules);
        if (pendingLoads.length > 0)
          await Promise.all(pendingLoads);
        return [
          params,
          mods,
          menu,
          routeBundleNames
        ];
      }
    }
  return null;
};
const loadModule = (moduleLoader, pendingLoads, moduleSetter, cacheModules) => {
  if (typeof moduleLoader === "function") {
    const loadedModule = MODULE_CACHE.get(moduleLoader);
    if (loadedModule)
      moduleSetter(loadedModule);
    else {
      const l = moduleLoader();
      if (typeof l.then === "function")
        pendingLoads.push(l.then((loadedModule2) => {
          if (cacheModules !== false)
            MODULE_CACHE.set(moduleLoader, loadedModule2);
          moduleSetter(loadedModule2);
        }));
      else if (l)
        moduleSetter(l);
    }
  }
};
const getMenuLoader = (menus, pathname) => {
  if (menus) {
    pathname = pathname.endsWith("/") ? pathname : pathname + "/";
    const menu = menus.find((m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith("/") ? "" : "/")));
    if (menu)
      return menu[1];
  }
};
const getPathParams = (paramNames, match) => {
  const params = {};
  let i;
  let param;
  if (paramNames)
    for (i = 0; i < paramNames.length; i++) {
      param = match ? match[i + 1] : "";
      params[paramNames[i]] = param.endsWith("/") ? param.slice(0, -1) : param;
    }
  return params;
};
const resolveHead = async (endpoint, routeLocation, contentModules, locale) => {
  const head = createDocumentHead();
  const getData = (loader) => endpoint?.loaders[loader.__qrl.getHash()];
  const headProps = {
    head,
    withLocale: (fn) => withLocale(locale, fn),
    getData,
    ...routeLocation
  };
  for (let i = contentModules.length - 1; i >= 0; i--) {
    const contentModuleHead = contentModules[i] && contentModules[i].head;
    if (contentModuleHead) {
      if (typeof contentModuleHead === "function")
        resolveDocumentHead(head, withLocale(locale, () => contentModuleHead(headProps)));
      else if (typeof contentModuleHead === "object")
        resolveDocumentHead(head, contentModuleHead);
    }
  }
  return headProps.head;
};
const resolveDocumentHead = (resolvedHead, updatedHead) => {
  if (typeof updatedHead.title === "string")
    resolvedHead.title = updatedHead.title;
  mergeArray(resolvedHead.meta, updatedHead.meta);
  mergeArray(resolvedHead.links, updatedHead.links);
  mergeArray(resolvedHead.styles, updatedHead.styles);
  Object.assign(resolvedHead.frontmatter, updatedHead.frontmatter);
};
const mergeArray = (existingArr, newArr) => {
  if (Array.isArray(newArr))
    for (const newItem of newArr) {
      if (typeof newItem.key === "string") {
        const existingIndex = existingArr.findIndex((i) => i.key === newItem.key);
        if (existingIndex > -1) {
          existingArr[existingIndex] = newItem;
          continue;
        }
      }
      existingArr.push(newItem);
    }
};
const createDocumentHead = () => ({
  title: "",
  meta: [],
  links: [],
  styles: [],
  frontmatter: {}
});
const useContent = () => useContext(ContentContext);
const useDocumentHead = () => useContext(DocumentHeadContext);
const useLocation = () => useContext(RouteLocationContext);
const useNavigate = () => useContext(RouteNavigateContext);
const useAction = () => useContext(RouteActionContext);
const useQwikCityEnv = () => noSerialize(useEnvData("qwikcity"));
const toPath = (url) => url.pathname + url.search + url.hash;
const toUrl = (url, baseUrl) => new URL(url, baseUrl.href);
const isSameOrigin = (a, b) => a.origin === b.origin;
const isSamePath = (a, b) => a.pathname + a.search === b.pathname + b.search;
const isSamePathname = (a, b) => a.pathname === b.pathname;
const isSameOriginDifferentPathname = (a, b) => isSameOrigin(a, b) && !isSamePath(a, b);
const getClientDataPath = (pathname, pageSearch, action) => {
  let search = pageSearch ?? "";
  if (action)
    search += (search ? "&" : "?") + QACTION_KEY + "=" + encodeURIComponent(action.id);
  return pathname + (pathname.endsWith("/") ? "" : "/") + "q-data.json" + search;
};
const getClientNavPath = (props, baseUrl) => {
  const href = props.href;
  if (typeof href === "string" && href.trim() !== "" && typeof props.target !== "string")
    try {
      const linkUrl = toUrl(href, baseUrl);
      const currentUrl = toUrl("", baseUrl);
      if (isSameOrigin(linkUrl, currentUrl))
        return toPath(linkUrl);
    } catch (e) {
      console.error(e);
    }
  return null;
};
const getPrefetchDataset = (props, clientNavPath, currentLoc) => {
  if (props.prefetch === true && clientNavPath) {
    const prefetchUrl = toUrl(clientNavPath, currentLoc);
    if (!isSamePathname(prefetchUrl, toUrl("", currentLoc)))
      return "";
  }
  return null;
};
const clientNavigate = (win, pathname, routeNavigate) => {
  const currentUrl = win.location;
  const newUrl = toUrl(pathname, currentUrl);
  if (isSameOriginDifferentPathname(currentUrl, newUrl)) {
    handleScroll(win, currentUrl, newUrl);
    win.history.pushState("", "", toPath(newUrl));
  }
  if (!win[CLIENT_HISTORY_INITIALIZED]) {
    win[CLIENT_HISTORY_INITIALIZED] = 1;
    win.addEventListener("popstate", () => {
      const currentUrl2 = win.location;
      const previousUrl = toUrl(routeNavigate.value, currentUrl2);
      if (isSameOriginDifferentPathname(currentUrl2, previousUrl)) {
        handleScroll(win, previousUrl, currentUrl2);
        routeNavigate.value = toPath(currentUrl2);
      }
    });
    win.removeEventListener("popstate", win[POPSTATE_FALLBACK_INITIALIZED]);
  }
};
const handleScroll = async (win, previousUrl, newUrl) => {
  const doc = win.document;
  const newHash = newUrl.hash;
  if (isSamePath(previousUrl, newUrl)) {
    if (previousUrl.hash !== newHash) {
      await domWait();
      if (newHash)
        scrollToHashId(doc, newHash);
      else
        win.scrollTo(0, 0);
    }
  } else {
    if (newHash)
      for (let i = 0; i < 24; i++) {
        await domWait();
        if (scrollToHashId(doc, newHash))
          break;
      }
    else {
      await domWait();
      win.scrollTo(0, 0);
    }
  }
};
const domWait = () => new Promise((resolve) => setTimeout(resolve, 12));
const scrollToHashId = (doc, hash) => {
  const elmId = hash.slice(1);
  const elm = doc.getElementById(elmId);
  if (elm)
    elm.scrollIntoView();
  return elm;
};
const dispatchPrefetchEvent = (prefetchData) => {
  if (typeof document !== "undefined")
    document.dispatchEvent(new CustomEvent("qprefetch", {
      detail: prefetchData
    }));
};
const loadClientData = async (href, clearCache, action) => {
  const url = new URL(href);
  const pagePathname = url.pathname;
  const pageSearch = url.search;
  const clientDataPath = getClientDataPath(pagePathname, pageSearch, action);
  let qData = action ? void 0 : CLIENT_DATA_CACHE.get(clientDataPath);
  dispatchPrefetchEvent({
    links: [
      pagePathname
    ]
  });
  if (!qData) {
    const options = action ? {
      method: "POST",
      body: action.data
    } : void 0;
    qData = fetch(clientDataPath, options).then((rsp) => {
      if ((rsp.headers.get("content-type") || "").includes("json")) {
        const redirectedURL = new URL(rsp.url);
        if (redirectedURL.origin !== location.origin || !isQDataJson(redirectedURL.pathname)) {
          location.href = redirectedURL.href;
          return;
        }
        return rsp.text().then((text) => {
          const clientData = parseData(text);
          if (clearCache)
            CLIENT_DATA_CACHE.delete(clientDataPath);
          if (action) {
            const actionData = clientData.loaders[action.id];
            action.resolve({
              status: rsp.status,
              result: actionData
            });
          }
          return clientData;
        });
      } else
        CLIENT_DATA_CACHE.delete(clientDataPath);
    });
    if (!action)
      CLIENT_DATA_CACHE.set(clientDataPath, qData);
  }
  return qData;
};
function parseData(str) {
  return JSON.parse(str, (_, value) => {
    if (value && typeof value === "object" && value.__brand === "formdata")
      return formDataFromArray(value.value);
    return value;
  });
}
function formDataFromArray(array) {
  const formData = new FormData();
  for (const [key, value] of array)
    formData.append(key, value);
  return formData;
}
const isQDataJson = (pathname) => {
  return pathname.endsWith(QDATA_JSON);
};
const QDATA_JSON = "/q-data.json";
const QwikCityProvider = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const env = useQwikCityEnv();
  if (!env?.params)
    throw new Error(`Missing Qwik City Env Data`);
  const urlEnv = useEnvData("url");
  if (!urlEnv)
    throw new Error(`Missing Qwik URL Env Data`);
  const url = new URL(urlEnv);
  const routeLocation = useStore({
    href: url.href,
    pathname: url.pathname,
    query: url.searchParams,
    params: env.params,
    isPending: false
  });
  const loaderState = useStore(env.response.loaders);
  const navPath = useSignal(toPath(url));
  const goto = inlinedQrl(async (path) => {
    const [navPath2, routeLocation2] = useLexicalScope();
    const value = navPath2.value;
    if (path) {
      if (value === path)
        return;
      navPath2.value = path;
    } else {
      navPath2.value = "";
      navPath2.value = value;
    }
    routeLocation2.isPending = true;
  }, "QwikCityProvider_component_goto_fX0bDjeJa0E", [
    navPath,
    routeLocation
  ]);
  const documentHead = useStore(createDocumentHead);
  const content = useStore({
    headings: void 0,
    menu: void 0
  });
  const contentInternal = useStore({
    contents: void 0
  });
  const currentActionId = env.response.action;
  const currentAction = currentActionId ? env.response.loaders[currentActionId] : void 0;
  const actionState = useSignal(currentAction ? {
    id: currentActionId,
    data: void 0,
    output: {
      result: currentAction,
      status: env.response.status
    }
  } : void 0);
  useContextProvider(ContentContext, content);
  useContextProvider(ContentInternalContext, contentInternal);
  useContextProvider(DocumentHeadContext, documentHead);
  useContextProvider(RouteLocationContext, routeLocation);
  useContextProvider(RouteNavigateContext, goto);
  useContextProvider(RouteStateContext, loaderState);
  useContextProvider(RouteActionContext, actionState);
  useTaskQrl(inlinedQrl(async ({ track }) => {
    const [actionState2, content2, contentInternal2, documentHead2, env2, loaderState2, navPath2, routeLocation2] = useLexicalScope();
    const path = track(() => navPath2.value);
    const action = track(() => actionState2.value);
    const locale = getLocale("");
    const { routes, menus, cacheModules, trailingSlash } = await import("@qwik-city-plan");
    let url2 = new URL(path, routeLocation2.href);
    let loadRoutePromise = loadRoute(routes, menus, cacheModules, url2.pathname);
    let clientPageData;
    if (isServer)
      clientPageData = env2.response;
    else {
      const pageData = clientPageData = await loadClientData(url2.href, true, action);
      const newHref = pageData?.href;
      if (newHref) {
        const newURL = new URL(newHref, url2.href);
        if (newURL.pathname !== url2.pathname) {
          url2 = newURL;
          loadRoutePromise = loadRoute(routes, menus, cacheModules, url2.pathname);
        }
      }
    }
    if (url2.pathname.endsWith("/")) {
      if (!trailingSlash)
        url2.pathname = url2.pathname.slice(0, -1);
    } else if (trailingSlash)
      url2.pathname += "/";
    const pathname = url2.pathname;
    const loadedRoute = await loadRoutePromise;
    if (loadedRoute) {
      const [params, mods, menu] = loadedRoute;
      const contentModules = mods;
      const pageModule = contentModules[contentModules.length - 1];
      const resolvedHead = await resolveHead(clientPageData, routeLocation2, contentModules, locale);
      routeLocation2.href = url2.href;
      routeLocation2.pathname = pathname;
      routeLocation2.params = {
        ...params
      };
      routeLocation2.query = url2.searchParams;
      content2.headings = pageModule.headings;
      content2.menu = menu;
      contentInternal2.contents = noSerialize(contentModules);
      documentHead2.links = resolvedHead.links;
      documentHead2.meta = resolvedHead.meta;
      documentHead2.styles = resolvedHead.styles;
      documentHead2.title = resolvedHead.title;
      documentHead2.frontmatter = resolvedHead.frontmatter;
      if (isBrowser) {
        const loaders = clientPageData?.loaders;
        if (loaders)
          Object.assign(loaderState2, loaders);
        CLIENT_DATA_CACHE.clear();
        clientNavigate(window, pathname, navPath2);
        routeLocation2.isPending = false;
      }
    }
  }, "QwikCityProvider_component_useTask_02wMImzEAbk", [
    actionState,
    content,
    contentInternal,
    documentHead,
    env,
    loaderState,
    navPath,
    routeLocation
  ]));
  return /* @__PURE__ */ jsx$1(Slot, {}, "qY_0");
}, "QwikCityProvider_component_TxCFOy819ag"));
const QwikCity = QwikCityProvider;
const Html = QwikCity;
const QwikCityMockProvider = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  const urlEnv = props.url ?? "http://localhost/";
  const url = new URL(urlEnv);
  const routeLocation = useStore({
    href: url.href,
    pathname: url.pathname,
    query: url.searchParams,
    params: props.params ?? {},
    isPending: false
  });
  const loaderState = useSignal({});
  const goto = inlinedQrl(async (path) => {
    throw new Error("Not implemented");
  }, "QwikCityMockProvider_component_goto_BUbtvTyvVRE");
  const documentHead = useStore(createDocumentHead);
  const content = useStore({
    headings: void 0,
    menu: void 0
  });
  const contentInternal = useStore({
    contents: void 0
  });
  useContextProvider(ContentContext, content);
  useContextProvider(ContentInternalContext, contentInternal);
  useContextProvider(DocumentHeadContext, documentHead);
  useContextProvider(RouteLocationContext, routeLocation);
  useContextProvider(RouteNavigateContext, goto);
  useContextProvider(RouteStateContext, loaderState);
  return /* @__PURE__ */ jsx$1(Slot, {}, "qY_1");
}, "QwikCityMockProvider_component_WmYC5H00wtI"));
const Link = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  const nav = useNavigate();
  const loc = useLocation();
  const originalHref = props.href;
  const linkProps = {
    ...props
  };
  const clientNavPath = getClientNavPath(linkProps, loc);
  const prefetchDataset = getPrefetchDataset(props, clientNavPath, loc);
  linkProps["preventdefault:click"] = !!clientNavPath;
  linkProps.href = clientNavPath || originalHref;
  useOnDocument("qinit", inlinedQrl(() => {
    if (!window[POPSTATE_FALLBACK_INITIALIZED]) {
      window[POPSTATE_FALLBACK_INITIALIZED] = () => {
        if (!window[CLIENT_HISTORY_INITIALIZED])
          location.reload();
      };
      setTimeout(() => {
        addEventListener("popstate", window[POPSTATE_FALLBACK_INITIALIZED]);
      }, 0);
    }
  }, "Link_component_useOnDocument_u0YVoxt2aTY"));
  return /* @__PURE__ */ jsx$1("a", {
    ...linkProps,
    onClick$: inlinedQrl(() => {
      const [clientNavPath2, linkProps2, nav2] = useLexicalScope();
      if (clientNavPath2)
        nav2(linkProps2.href);
    }, "Link_component_a_onClick_kzjavhDI3L0", [
      clientNavPath,
      linkProps,
      nav
    ]),
    "data-prefetch": prefetchDataset,
    onMouseOver$: inlinedQrl((_, elm) => prefetchLinkResources(elm), "Link_component_a_onMouseOver_yiXwCC0m3jY"),
    onFocus$: inlinedQrl((_, elm) => prefetchLinkResources(elm), "Link_component_a_onFocus_PrXIxv2vNXY"),
    onQVisible$: inlinedQrl((_, elm) => prefetchLinkResources(elm, true), "Link_component_a_onQVisible_EpaZ5qQ4Lg4"),
    children: /* @__PURE__ */ jsx$1(Slot, {}, "AD_0")
  });
}, "Link_component_8gdLBszqbaM"));
const prefetchLinkResources = (elm, isOnVisible) => {
  if (elm && elm.href && elm.hasAttribute("data-prefetch")) {
    if (!windowInnerWidth)
      windowInnerWidth = innerWidth;
    if (!isOnVisible || isOnVisible && windowInnerWidth < 520)
      loadClientData(elm.href);
  }
};
let windowInnerWidth = 0;
const ServiceWorkerRegister = () => jsx("script", {
  dangerouslySetInnerHTML: swRegister
});
class ServerActionImpl {
  constructor(__qrl) {
    this.__qrl = __qrl;
    this.__brand = "server_action";
  }
  use() {
    const loc = useLocation();
    const currentAction = useAction();
    const initialState = {
      status: void 0,
      isPending: false
    };
    const state = useStore(() => {
      return untrack(() => {
        const id = this.__qrl.getHash();
        if (currentAction.value?.output) {
          const { status, result } = currentAction.value.output;
          initialState.status = status;
          initialState.value = result;
        } else {
          initialState.status = void 0;
          initialState.value = void 0;
        }
        initialState.id = id;
        initialState.actionPath = `${loc.pathname}?${QACTION_KEY}=${id}`;
        initialState.isPending = false;
        return initialState;
      });
    });
    initialState.execute = inlinedQrl((input) => {
      const [currentAction2, loc2, state2] = useLexicalScope();
      let data;
      if (input instanceof SubmitEvent)
        data = new FormData(input.target);
      else if (input instanceof FormData)
        data = input;
      else
        data = formDataFromObject(input);
      return new Promise((resolve) => {
        state2.isPending = true;
        loc2.isPending = true;
        currentAction2.value = {
          data,
          id: state2.id,
          resolve: noSerialize(resolve)
        };
      }).then((value) => {
        state2.isPending = false;
        state2.status = value.status;
        state2.value = value.result;
      });
    }, "ServerActionImpl_13yflRrKOuk", [
      currentAction,
      loc,
      state
    ]);
    return state;
  }
}
const actionQrl = (actionQrl2) => {
  return new ServerActionImpl(actionQrl2);
};
const action$ = implicit$FirstArg(actionQrl);
class ServerLoaderImpl {
  constructor(__qrl) {
    this.__qrl = __qrl;
    this.__brand = "server_loader";
  }
  use() {
    const state = useContext(RouteStateContext);
    const hash = this.__qrl.getHash();
    untrack(() => {
      if (!(hash in state))
        throw new Error(`Loader not found: ${hash}`);
    });
    return _wrapSignal(state, hash);
  }
}
const loaderQrl = (loaderQrl2) => {
  return new ServerLoaderImpl(loaderQrl2);
};
const loader$ = implicit$FirstArg(loaderQrl);
function formDataFromObject(obj) {
  const formData = new FormData();
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value))
      for (const item of value)
        formData.append(key, item);
    else
      formData.append(key, value);
  }
  return formData;
}
const Form = ({ action, ...rest }) => {
  return jsx("form", {
    action: action.actionPath,
    "preventdefault:submit": true,
    onSubmit$: action.execute,
    ...rest,
    method: "post"
  });
};
export {
  Content,
  Form,
  Html,
  Link,
  QwikCity,
  QwikCityMockProvider,
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
  action$,
  actionQrl,
  loader$,
  loaderQrl,
  useContent,
  useDocumentHead,
  useLocation,
  useNavigate
};
