"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPathParser = exports.urlToPathAndParams = exports.getParamsFromPath = void 0;

var _pathToRegexp = _interopRequireWildcard(require("path-to-regexp"));

var NavigationActions = _interopRequireWildcard(require("../NavigationActions"));

var _invariant = _interopRequireDefault(require("../utils/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint-disable import/no-commonjs */
const queryString = require('query-string');

const getParamsFromPath = (inputParams, pathMatch, pathMatchKeys) => {
  const params = pathMatch.slice(1).reduce( // iterate over matched path params
  (paramsOut, matchResult, i) => {
    const key = pathMatchKeys[i];

    if (!key || key.asterisk) {
      return paramsOut;
    }

    const paramName = key.name;
    let decodedMatchResult;

    if (matchResult) {
      try {
        decodedMatchResult = decodeURIComponent(matchResult);
      } catch (e) {// ignore `URIError: malformed URI`
      }
    }

    paramsOut[paramName] = decodedMatchResult || matchResult;
    return paramsOut;
  }, { // start with the input(query string) params, which will get overridden by path params
    ...inputParams
  });
  return params;
};

exports.getParamsFromPath = getParamsFromPath;

const getRestOfPath = (pathMatch, pathMatchKeys) => {
  const rest = pathMatch[pathMatchKeys.findIndex(k => k.asterisk) + 1];
  return rest;
};

const determineDelimiter = (uri, uriPrefix) => {
  if (Array.isArray(uriPrefix)) {
    if (uriPrefix.length === 1) return uriPrefix[0];

    for (let prefix of uriPrefix) {
      if (uri.startsWith(prefix)) return prefix;
    }

    return null;
  }

  return uriPrefix;
};

const urlToPathAndParams = (url, uriPrefix) => {
  const searchMatch = url.match(/^(.*)\?(.*)$/);
  const [, urlWithoutQuery, query] = searchMatch || [null, url, {}];
  const params = queryString.parse(query);
  const delimiter = determineDelimiter(urlWithoutQuery, uriPrefix) || '://';
  let path = urlWithoutQuery.split(delimiter)[1];

  if (path === undefined) {
    path = urlWithoutQuery;
  }

  if (path === '/') {
    path = '';
  }

  if (path[path.length - 1] === '/') {
    path = path.slice(0, -1);
  }

  return {
    path,
    params
  };
};

exports.urlToPathAndParams = urlToPathAndParams;

const createPathParser = (childRouters, routeConfigs, {
  paths: pathConfigs = {},
  disableRouteNamePaths
}) => {
  const pathsByRouteNames = {};
  let paths = []; // Build pathsByRouteNames, which includes a regex to match paths for each route. Keep in mind, the regex will pass for the route and all child routes. The code that uses pathsByRouteNames will need to also verify that the child router produces an action, in the case of isPathMatchable false (a null path).

  Object.keys(childRouters).forEach(routeName => {
    let pathPattern; // First check for paths on the router, then check the route config

    if (pathConfigs[routeName] !== undefined) {
      pathPattern = pathConfigs[routeName];
    } else {
      pathPattern = routeConfigs[routeName].path;
    }

    if (pathPattern === undefined) {
      // If the user hasn't specified a path at all nor disableRouteNamePaths, then we assume the routeName is an appropriate path
      pathPattern = disableRouteNamePaths ? null : routeName;
    }

    (0, _invariant.default)(pathPattern === null || typeof pathPattern === 'string', "Route path for ".concat(routeName, " must be specified as a string, or null.")); // the path may be specified as null, which is similar to empty string because it allows child routers to handle the action, but it will not match empty paths

    const isPathMatchable = pathPattern !== null; // pathPattern is a string with inline params, such as people/:id/*foo

    const exactReKeys = [];
    const exactRe = isPathMatchable ? (0, _pathToRegexp.default)(pathPattern, exactReKeys) : null;
    const extendedPathReKeys = [];
    const isWildcard = pathPattern === '' || !isPathMatchable;
    const extendedPathRe = (0, _pathToRegexp.default)(isWildcard ? '*' : "".concat(pathPattern, "/*"), extendedPathReKeys);
    pathsByRouteNames[routeName] = {
      exactRe,
      exactReKeys,
      extendedPathRe,
      extendedPathReKeys,
      isWildcard,
      toPath: pathPattern === null ? () => '' : (0, _pathToRegexp.compile)(pathPattern)
    };
  });
  paths = Object.entries(pathsByRouteNames);

  const getActionForPathAndParams = (pathToResolve = '', inputParams = {}) => {
    // Attempt to match `pathToResolve` with a route in this router's routeConfigs, deferring to child routers
    for (const [routeName, path] of paths) {
      const {
        exactRe,
        exactReKeys,
        extendedPathRe,
        extendedPathReKeys
      } = path;
      const childRouter = childRouters[routeName];
      const exactMatch = exactRe && exactRe.exec(pathToResolve);

      if (exactMatch && exactMatch.length) {
        const extendedMatch = extendedPathRe && extendedPathRe.exec(pathToResolve);
        let childAction = null;

        if (extendedMatch && childRouter) {
          const restOfPath = getRestOfPath(extendedMatch, extendedPathReKeys);
          childAction = childRouter.getActionForPathAndParams(restOfPath, inputParams);
        }

        return NavigationActions.navigate({
          routeName,
          params: getParamsFromPath(inputParams, exactMatch, exactReKeys),
          action: childAction
        });
      }
    }

    for (const [routeName, path] of paths) {
      const {
        extendedPathRe,
        extendedPathReKeys
      } = path;
      const childRouter = childRouters[routeName];
      const extendedMatch = extendedPathRe && extendedPathRe.exec(pathToResolve);

      if (extendedMatch && extendedMatch.length) {
        const restOfPath = getRestOfPath(extendedMatch, extendedPathReKeys);
        let childAction = null;

        if (childRouter) {
          childAction = childRouter.getActionForPathAndParams(restOfPath, inputParams);
        }

        if (!childAction) {
          continue;
        }

        return NavigationActions.navigate({
          routeName,
          params: getParamsFromPath(inputParams, extendedMatch, extendedPathReKeys),
          action: childAction
        });
      }
    }

    return null;
  };

  const getPathAndParamsForRoute = route => {
    const {
      routeName,
      params
    } = route;
    const childRouter = childRouters[routeName];
    const {
      toPath,
      exactReKeys
    } = pathsByRouteNames[routeName];
    const subPath = toPath(params);
    const nonPathParams = {};

    if (params) {
      Object.keys(params).filter(paramName => !exactReKeys.find(k => k.name === paramName)).forEach(paramName => {
        nonPathParams[paramName] = params[paramName];
      });
    }

    if (childRouter) {
      // If it has a router it's a navigator.
      // If it doesn't have router it's an ordinary React component.
      const child = childRouter.getPathAndParamsForState(route);
      return {
        path: subPath ? "".concat(subPath, "/").concat(child.path) : child.path,
        params: child.params ? { ...nonPathParams,
          ...child.params
        } : nonPathParams
      };
    }

    return {
      path: subPath,
      params: nonPathParams
    };
  };

  return {
    getActionForPathAndParams,
    getPathAndParamsForRoute
  };
};

exports.createPathParser = createPathParser;
//# sourceMappingURL=pathUtils.js.map