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

function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) ||
    _iterableToArrayLimit(arr, i) ||
    _unsupportedIterableToArray(arr, i) ||
    _nonIterableRest()
  );
}
function _nonIterableRest() {
  throw new TypeError(
    'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
  );
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit(arr, i) {
  var _i =
    arr == null
      ? null
      : (typeof Symbol !== 'undefined' && arr[Symbol.iterator]) ||
        arr['@@iterator'];
  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i['return'] != null) _i['return']();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
const _require = require('./Utils'),
  createAliasResolver = _require.createAliasResolver,
  getModules = _require.getModules;
const _require2 = require('../../parsers/flow/modules/utils'),
  unwrapNullable = _require2.unwrapNullable;
function FileTemplate(config) {
  const packageName = config.packageName,
    className = config.className,
    methods = config.methods,
    imports = config.imports;
  return `
/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * ${'@'}generated by codegen project: GenerateModuleJavaSpec.js
 *
 * ${'@'}nolint
 */

package ${packageName};

${imports}

public abstract class ${className} extends ReactContextBaseJavaModule implements ReactModuleWithSpec, TurboModule {
  public ${className}(ReactApplicationContext reactContext) {
    super(reactContext);
  }

${methods}
}
`;
}
function MethodTemplate(config) {
  const abstract = config.abstract,
    methodBody = config.methodBody,
    methodJavaAnnotation = config.methodJavaAnnotation,
    methodName = config.methodName,
    translatedReturnType = config.translatedReturnType,
    traversedArgs = config.traversedArgs;
  const methodQualifier = abstract ? 'abstract ' : '';
  const methodClosing = abstract
    ? ';'
    : methodBody != null && methodBody.length > 0
    ? ` { ${methodBody} }`
    : ' {}';
  return `  ${methodJavaAnnotation}
  public ${methodQualifier}${translatedReturnType} ${methodName}(${traversedArgs.join(
    ', ',
  )})${methodClosing}`;
}
function translateFunctionParamToJavaType(
  param,
  createErrorMessage,
  resolveAlias,
  imports,
) {
  const optional = param.optional,
    nullableTypeAnnotation = param.typeAnnotation;
  const _unwrapNullable = unwrapNullable(nullableTypeAnnotation),
    _unwrapNullable2 = _slicedToArray(_unwrapNullable, 2),
    typeAnnotation = _unwrapNullable2[0],
    nullable = _unwrapNullable2[1];
  const isRequired = !optional && !nullable;
  function wrapIntoNullableIfNeeded(generatedType) {
    if (!isRequired) {
      imports.add('javax.annotation.Nullable');
      return `@Nullable ${generatedType}`;
    }
    return generatedType;
  }
  let realTypeAnnotation = typeAnnotation;
  if (realTypeAnnotation.type === 'TypeAliasTypeAnnotation') {
    realTypeAnnotation = resolveAlias(realTypeAnnotation.name);
  }
  switch (realTypeAnnotation.type) {
    case 'ReservedTypeAnnotation':
      switch (realTypeAnnotation.name) {
        case 'RootTag':
          return !isRequired ? 'Double' : 'double';
        default:
          realTypeAnnotation.name;
          throw new Error(createErrorMessage(realTypeAnnotation.name));
      }
    case 'StringTypeAnnotation':
      return wrapIntoNullableIfNeeded('String');
    case 'NumberTypeAnnotation':
      return !isRequired ? 'Double' : 'double';
    case 'FloatTypeAnnotation':
      return !isRequired ? 'Double' : 'double';
    case 'DoubleTypeAnnotation':
      return !isRequired ? 'Double' : 'double';
    case 'Int32TypeAnnotation':
      return !isRequired ? 'Double' : 'double';
    case 'BooleanTypeAnnotation':
      return !isRequired ? 'Boolean' : 'boolean';
    case 'ObjectTypeAnnotation':
      imports.add('com.facebook.react.bridge.ReadableMap');
      if (typeAnnotation.type === 'TypeAliasTypeAnnotation') {
        // No class alias for args, so it still falls under ReadableMap.
        return 'ReadableMap';
      }
      return 'ReadableMap';
    case 'GenericObjectTypeAnnotation':
      // Treat this the same as ObjectTypeAnnotation for now.
      imports.add('com.facebook.react.bridge.ReadableMap');
      return 'ReadableMap';
    case 'ArrayTypeAnnotation':
      imports.add('com.facebook.react.bridge.ReadableArray');
      return 'ReadableArray';
    case 'FunctionTypeAnnotation':
      imports.add('com.facebook.react.bridge.Callback');
      return 'Callback';
    default:
      realTypeAnnotation.type;
      throw new Error(createErrorMessage(realTypeAnnotation.type));
  }
}
function translateFunctionReturnTypeToJavaType(
  nullableReturnTypeAnnotation,
  createErrorMessage,
  resolveAlias,
  imports,
) {
  const _unwrapNullable3 = unwrapNullable(nullableReturnTypeAnnotation),
    _unwrapNullable4 = _slicedToArray(_unwrapNullable3, 2),
    returnTypeAnnotation = _unwrapNullable4[0],
    nullable = _unwrapNullable4[1];
  function wrapIntoNullableIfNeeded(generatedType) {
    if (nullable) {
      imports.add('javax.annotation.Nullable');
      return `@Nullable ${generatedType}`;
    }
    return generatedType;
  }
  let realTypeAnnotation = returnTypeAnnotation;
  if (realTypeAnnotation.type === 'TypeAliasTypeAnnotation') {
    realTypeAnnotation = resolveAlias(realTypeAnnotation.name);
  }
  switch (realTypeAnnotation.type) {
    case 'ReservedTypeAnnotation':
      switch (realTypeAnnotation.name) {
        case 'RootTag':
          return nullable ? 'Double' : 'double';
        default:
          realTypeAnnotation.name;
          throw new Error(createErrorMessage(realTypeAnnotation.name));
      }
    case 'VoidTypeAnnotation':
      return 'void';
    case 'PromiseTypeAnnotation':
      return 'void';
    case 'StringTypeAnnotation':
      return wrapIntoNullableIfNeeded('String');
    case 'NumberTypeAnnotation':
      return nullable ? 'Double' : 'double';
    case 'FloatTypeAnnotation':
      return nullable ? 'Double' : 'double';
    case 'DoubleTypeAnnotation':
      return nullable ? 'Double' : 'double';
    case 'Int32TypeAnnotation':
      return nullable ? 'Double' : 'double';
    case 'BooleanTypeAnnotation':
      return nullable ? 'Boolean' : 'boolean';
    case 'ObjectTypeAnnotation':
      imports.add('com.facebook.react.bridge.WritableMap');
      return wrapIntoNullableIfNeeded('WritableMap');
    case 'GenericObjectTypeAnnotation':
      imports.add('com.facebook.react.bridge.WritableMap');
      return wrapIntoNullableIfNeeded('WritableMap');
    case 'ArrayTypeAnnotation':
      imports.add('com.facebook.react.bridge.WritableArray');
      return wrapIntoNullableIfNeeded('WritableArray');
    default:
      realTypeAnnotation.type;
      throw new Error(createErrorMessage(realTypeAnnotation.type));
  }
}
function getFalsyReturnStatementFromReturnType(
  nullableReturnTypeAnnotation,
  createErrorMessage,
  resolveAlias,
) {
  const _unwrapNullable5 = unwrapNullable(nullableReturnTypeAnnotation),
    _unwrapNullable6 = _slicedToArray(_unwrapNullable5, 2),
    returnTypeAnnotation = _unwrapNullable6[0],
    nullable = _unwrapNullable6[1];
  let realTypeAnnotation = returnTypeAnnotation;
  if (realTypeAnnotation.type === 'TypeAliasTypeAnnotation') {
    realTypeAnnotation = resolveAlias(realTypeAnnotation.name);
  }
  switch (realTypeAnnotation.type) {
    case 'ReservedTypeAnnotation':
      switch (realTypeAnnotation.name) {
        case 'RootTag':
          return 'return 0.0;';
        default:
          realTypeAnnotation.name;
          throw new Error(createErrorMessage(realTypeAnnotation.name));
      }
    case 'VoidTypeAnnotation':
      return '';
    case 'PromiseTypeAnnotation':
      return '';
    case 'NumberTypeAnnotation':
      return nullable ? 'return null;' : 'return 0;';
    case 'FloatTypeAnnotation':
      return nullable ? 'return null;' : 'return 0.0;';
    case 'DoubleTypeAnnotation':
      return nullable ? 'return null;' : 'return 0.0;';
    case 'Int32TypeAnnotation':
      return nullable ? 'return null;' : 'return 0;';
    case 'BooleanTypeAnnotation':
      return nullable ? 'return null;' : 'return false;';
    case 'StringTypeAnnotation':
      return nullable ? 'return null;' : 'return "";';
    case 'ObjectTypeAnnotation':
      return 'return null;';
    case 'GenericObjectTypeAnnotation':
      return 'return null;';
    case 'ArrayTypeAnnotation':
      return 'return null;';
    default:
      realTypeAnnotation.type;
      throw new Error(createErrorMessage(realTypeAnnotation.type));
  }
}

// Build special-cased runtime check for getConstants().
function buildGetConstantsMethod(method, imports) {
  const _unwrapNullable7 = unwrapNullable(method.typeAnnotation),
    _unwrapNullable8 = _slicedToArray(_unwrapNullable7, 1),
    methodTypeAnnotation = _unwrapNullable8[0];
  if (
    methodTypeAnnotation.returnTypeAnnotation.type === 'ObjectTypeAnnotation'
  ) {
    const requiredProps = [];
    const optionalProps = [];
    const rawProperties =
      methodTypeAnnotation.returnTypeAnnotation.properties || [];
    rawProperties.forEach(p => {
      if (p.optional || p.typeAnnotation.type === 'NullableTypeAnnotation') {
        optionalProps.push(p.name);
      } else {
        requiredProps.push(p.name);
      }
    });
    if (requiredProps.length === 0 && optionalProps.length === 0) {
      // Nothing to validate during runtime.
      return '';
    }
    imports.add('com.facebook.react.common.build.ReactBuildConfig');
    imports.add('java.util.Arrays');
    imports.add('java.util.HashSet');
    imports.add('java.util.Map');
    imports.add('java.util.Set');
    imports.add('javax.annotation.Nullable');
    const requiredPropsFragment =
      requiredProps.length > 0
        ? `Arrays.asList(
          ${requiredProps
            .sort()
            .map(p => `"${p}"`)
            .join(',\n          ')}
      )`
        : '';
    const optionalPropsFragment =
      optionalProps.length > 0
        ? `Arrays.asList(
          ${optionalProps
            .sort()
            .map(p => `"${p}"`)
            .join(',\n          ')}
      )`
        : '';
    return `  protected abstract Map<String, Object> getTypedExportedConstants();

  @Override
  @DoNotStrip
  public final @Nullable Map<String, Object> getConstants() {
    Map<String, Object> constants = getTypedExportedConstants();
    if (ReactBuildConfig.DEBUG || ReactBuildConfig.IS_INTERNAL_BUILD) {
      Set<String> obligatoryFlowConstants = new HashSet<>(${requiredPropsFragment});
      Set<String> optionalFlowConstants = new HashSet<>(${optionalPropsFragment});
      Set<String> undeclaredConstants = new HashSet<>(constants.keySet());
      undeclaredConstants.removeAll(obligatoryFlowConstants);
      undeclaredConstants.removeAll(optionalFlowConstants);
      if (!undeclaredConstants.isEmpty()) {
        throw new IllegalStateException(String.format("Native Module Flow doesn't declare constants: %s", undeclaredConstants));
      }
      undeclaredConstants = obligatoryFlowConstants;
      undeclaredConstants.removeAll(constants.keySet());
      if (!undeclaredConstants.isEmpty()) {
        throw new IllegalStateException(String.format("Native Module doesn't fill in constants: %s", undeclaredConstants));
      }
    }
    return constants;
  }`;
  }
  return '';
}
module.exports = {
  generate(libraryName, schema, packageName, assumeNonnull = false) {
    const files = new Map();
    const nativeModules = getModules(schema);
    const normalizedPackageName =
      packageName == null ? 'com.facebook.fbreact.specs' : packageName;
    const outputDir = `java/${normalizedPackageName.replace(/\./g, '/')}`;
    Object.keys(nativeModules).forEach(hasteModuleName => {
      const _nativeModules$hasteM = nativeModules[hasteModuleName],
        aliases = _nativeModules$hasteM.aliases,
        excludedPlatforms = _nativeModules$hasteM.excludedPlatforms,
        properties = _nativeModules$hasteM.spec.properties;
      if (excludedPlatforms != null && excludedPlatforms.includes('android')) {
        return;
      }
      const resolveAlias = createAliasResolver(aliases);
      const className = `${hasteModuleName}Spec`;
      const imports = new Set([
        // Always required.
        'com.facebook.react.bridge.ReactApplicationContext',
        'com.facebook.react.bridge.ReactContextBaseJavaModule',
        'com.facebook.react.bridge.ReactMethod',
        'com.facebook.react.bridge.ReactModuleWithSpec',
        'com.facebook.react.turbomodule.core.interfaces.TurboModule',
        'com.facebook.proguard.annotations.DoNotStrip',
      ]);
      const methods = properties.map(method => {
        if (method.name === 'getConstants') {
          return buildGetConstantsMethod(method, imports);
        }
        const _unwrapNullable9 = unwrapNullable(method.typeAnnotation),
          _unwrapNullable10 = _slicedToArray(_unwrapNullable9, 1),
          methodTypeAnnotation = _unwrapNullable10[0];

        // Handle return type
        const translatedReturnType = translateFunctionReturnTypeToJavaType(
          methodTypeAnnotation.returnTypeAnnotation,
          typeName =>
            `Unsupported return type for method ${method.name}. Found: ${typeName}`,
          resolveAlias,
          imports,
        );
        const returningPromise =
          methodTypeAnnotation.returnTypeAnnotation.type ===
          'PromiseTypeAnnotation';
        const isSyncMethod =
          methodTypeAnnotation.returnTypeAnnotation.type !==
            'VoidTypeAnnotation' && !returningPromise;

        // Handle method args
        const traversedArgs = methodTypeAnnotation.params.map(param => {
          const translatedParam = translateFunctionParamToJavaType(
            param,
            typeName =>
              `Unsupported type for param "${param.name}" in ${method.name}. Found: ${typeName}`,
            resolveAlias,
            imports,
          );
          return `${translatedParam} ${param.name}`;
        });
        if (returningPromise) {
          // Promise return type requires an extra arg at the end.
          imports.add('com.facebook.react.bridge.Promise');
          traversedArgs.push('Promise promise');
        }
        const methodJavaAnnotation = `@ReactMethod${
          isSyncMethod ? '(isBlockingSynchronousMethod = true)' : ''
        }\n  @DoNotStrip`;
        const methodBody = method.optional
          ? getFalsyReturnStatementFromReturnType(
              methodTypeAnnotation.returnTypeAnnotation,
              typeName =>
                `Cannot build falsy return statement for return type for method ${method.name}. Found: ${typeName}`,
              resolveAlias,
            )
          : null;
        return MethodTemplate({
          abstract: !method.optional,
          methodBody,
          methodJavaAnnotation,
          methodName: method.name,
          translatedReturnType,
          traversedArgs,
        });
      });
      files.set(
        `${outputDir}/${className}.java`,
        FileTemplate({
          packageName: normalizedPackageName,
          className,
          methods: methods.filter(Boolean).join('\n\n'),
          imports: Array.from(imports)
            .sort()
            .map(p => `import ${p};`)
            .join('\n'),
        }),
      );
    });
    return files;
  },
};
