/* eslint-disable @typescript-eslint/no-require-imports */
const Module = require("node:module");

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  const loaded = originalLoad.call(this, request, parent, isMain);
  if (request === "balanced-match" && loaded && typeof loaded !== "function" && typeof loaded.balanced === "function") {
    return loaded.balanced;
  }
  return loaded;
};
