/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

'use strict';

const _require = require('../utils.js'),
  getValueFromTypes = _require.getValueFromTypes;
function buildCommandSchema(property, types) {
  var _firstParam$typeAnnot, _firstParam$typeAnnot2;
  const name = property.key.name;
  const optional = property.optional || false;
  const value = getValueFromTypes(
    property.typeAnnotation.typeAnnotation,
    types,
  );
  const firstParam = value.parameters[0].typeAnnotation;
  if (
    !(
      firstParam.typeAnnotation != null &&
      firstParam.typeAnnotation.type === 'TSTypeReference' &&
      ((_firstParam$typeAnnot = firstParam.typeAnnotation.typeName.left) ===
        null || _firstParam$typeAnnot === void 0
        ? void 0
        : _firstParam$typeAnnot.name) === 'React' &&
      ((_firstParam$typeAnnot2 = firstParam.typeAnnotation.typeName.right) ===
        null || _firstParam$typeAnnot2 === void 0
        ? void 0
        : _firstParam$typeAnnot2.name) === 'ElementRef'
    )
  ) {
    throw new Error(
      `The first argument of method ${name} must be of type React.ElementRef<>`,
    );
  }
  const params = value.parameters.slice(1).map(param => {
    const paramName = param.name;
    const paramValue = getValueFromTypes(
      param.typeAnnotation.typeAnnotation,
      types,
    );
    const type =
      paramValue.type === 'TSTypeReference'
        ? paramValue.typeName.name
        : paramValue.type;
    let returnType;
    switch (type) {
      case 'RootTag':
        returnType = {
          type: 'ReservedTypeAnnotation',
          name: 'RootTag',
        };
        break;
      case 'TSBooleanKeyword':
        returnType = {
          type: 'BooleanTypeAnnotation',
        };
        break;
      case 'Int32':
        returnType = {
          type: 'Int32TypeAnnotation',
        };
        break;
      case 'Double':
        returnType = {
          type: 'DoubleTypeAnnotation',
        };
        break;
      case 'Float':
        returnType = {
          type: 'FloatTypeAnnotation',
        };
        break;
      case 'TSStringKeyword':
        returnType = {
          type: 'StringTypeAnnotation',
        };
        break;
      default:
        type;
        throw new Error(
          `Unsupported param type for method "${name}", param "${paramName}". Found ${type}`,
        );
    }
    return {
      name: paramName,
      typeAnnotation: returnType,
    };
  });
  return {
    name,
    optional,
    typeAnnotation: {
      type: 'FunctionTypeAnnotation',
      params,
      returnTypeAnnotation: {
        type: 'VoidTypeAnnotation',
      },
    },
  };
}
function getCommands(commandTypeAST, types) {
  return commandTypeAST
    .filter(property => property.type === 'TSPropertySignature')
    .map(property => buildCommandSchema(property, types))
    .filter(Boolean);
}
module.exports = {
  getCommands,
};
