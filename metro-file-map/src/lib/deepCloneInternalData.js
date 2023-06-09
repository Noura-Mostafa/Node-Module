"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = deepCloneInternalData;

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 *
 */
const mapMap = (map, mapFn) => {
  return new Map(Array.from(map.entries(), ([key, val]) => [key, mapFn(val)]));
}; // Benchmarked at ~260ms on an MBP2019, Node 16 with an input that
// v8-serializes to 50MB. This direct/manual approach is significantly faster
// than v8 deserialize(serialize) (~800ms) or a `structuredClone`
// implementation using worker_threads:
// https://github.com/nodejs/node/issues/39713#issuecomment-896884958 (700ms)

function deepCloneInternalData(data) {
  return {
    clocks: mapMap(data.clocks, (val) => JSON.parse(JSON.stringify(val))),
    duplicates: mapMap(data.duplicates, (v) =>
      mapMap(v, (v2) => new Map(v2.entries()))
    ),
    files: mapMap(data.files, (v) => [...v]),
    map: mapMap(data.map, (v) =>
      Object.assign(
        Object.create(null),
        Object.fromEntries(
          // $FlowFixMe[incompatible-call] Object.entries with { __proto__: null }
          // $FlowFixMe[incompatible-type] Spreading an unknown type due to above
          Array.from(Object.entries(v), ([key, val]) => [key, [...val]])
        )
      )
    ),
    mocks: new Map(data.mocks.entries()),
  };
}
