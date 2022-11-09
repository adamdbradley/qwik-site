var __require = /* @__PURE__ */ ((x) =>
  typeof require !== "undefined"
    ? require
    : typeof Proxy !== "undefined"
    ? new Proxy(x, {
        get: (a, b) => (typeof require !== "undefined" ? require : a)[b],
      })
    : x)(function (x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// packages/qwik-city/static/index.ts
async function generate(opts) {
  console.log("generate mjs", opts);
  const ssgPlatform = await getEntryModule();
  const result = await ssgPlatform.generate(opts);
  return result;
}
function getEntryModulePath() {
  if (isDeno()) {
    return "./deno.mjs";
  }
  if (isNode()) {
    if (isCjs()) {
      return "./node.cjs";
    }
    return "../../fake_modules/qwik-city/static/node.mjs";
  }
  throw new Error(`Unsupported platform`);
}
function getEntryModule() {
  const entryModule = getEntryModulePath();
  if (isCjs()) {
    return __require(entryModule);
  }
  return import(entryModule);
}
function isDeno() {
  return typeof Deno !== "undefined";
}
function isNode() {
  return (
    !isDeno() && typeof process !== "undefined" && !!process.versions?.node
  );
}
function isCjs() {
  const req = "require";
  return isNode() && typeof globalThis[req] === "function";
}
export { generate };
