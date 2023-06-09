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

function unwrapNullable(x) {
  if (x.type === 'NullableTypeAnnotation') {
    return [x.typeAnnotation, true];
  }
  return [x, false];
}
function wrapNullable(nullable, typeAnnotation) {
  if (!nullable) {
    return typeAnnotation;
  }
  return {
    type: 'NullableTypeAnnotation',
    typeAnnotation,
  };
}
module.exports = {
  unwrapNullable,
  wrapNullable,
};
