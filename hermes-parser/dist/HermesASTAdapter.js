"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _visitorKeys = require("./generated/visitor-keys");

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

/*
This class does some very "javascripty" things in the name of
performance which are ultimately impossible to soundly type.

So instead of adding strict types and a large number of suppression
comments, instead it is left untyped and subclasses are strictly
typed via a separate flow declaration file.
*/

/**
 * The base class for transforming the Hermes AST to the desired output format.
 * Extended by concrete adapters which output an ESTree or Babel AST.
 */
class HermesASTAdapter {
  constructor(options) {
    this.sourceFilename = void 0;
    this.sourceType = void 0;
    this.sourceFilename = options.sourceFilename;
    this.sourceType = options.sourceType;
  }
  /**
   * Transform the input Hermes AST to the desired output format.
   * This modifies the input AST in place instead of constructing a new AST.
   */


  transform(program) {
    // Comments are not traversed via visitor keys
    const comments = program.comments;

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      this.fixSourceLocation(comment);
      comments[i] = this.mapComment(comment);
    } // The first comment may be an interpreter directive and is stored directly on the program node


    program.interpreter = comments.length > 0 && comments[0].type === 'InterpreterDirective' ? comments.shift() : null; // Tokens are not traversed via visitor keys

    const tokens = program.tokens;

    if (tokens) {
      for (let i = 0; i < tokens.length; i++) {
        this.fixSourceLocation(tokens[i]);
      }
    }

    return this.mapNode(program);
  }
  /**
   * Transform a Hermes AST node to the output AST format.
   *
   * This may modify the input node in-place and return that same node, or a completely
   * new node may be constructed and returned. Overriden in child classes.
   */


  mapNode(_node) {
    throw new Error('Implemented in subclasses');
  }

  mapNodeDefault(node) {
    const visitorKeys = _visitorKeys.HERMES_AST_VISITOR_KEYS[node.type];

    for (const key in visitorKeys) {
      const childType = visitorKeys[key];

      if (childType === _visitorKeys.NODE_CHILD) {
        const child = node[key];

        if (child != null) {
          node[key] = this.mapNode(child);
        }
      } else if (childType === _visitorKeys.NODE_LIST_CHILD) {
        const children = node[key];

        for (let i = 0; i < children.length; i++) {
          const child = children[i];

          if (child != null) {
            children[i] = this.mapNode(child);
          }
        }
      }
    }

    return node;
  }
  /**
   * Update the source location for this node depending on the output AST format.
   * This can modify the input node in-place. Overriden in child classes.
   */


  fixSourceLocation(_node) {
    throw new Error('Implemented in subclasses');
  }

  getSourceType() {
    var _this$sourceType;

    return (_this$sourceType = this.sourceType) != null ? _this$sourceType : 'script';
  }

  setModuleSourceType() {
    if (this.sourceType == null) {
      this.sourceType = 'module';
    }
  }

  mapComment(node) {
    return node;
  }

  mapEmpty(_node) {
    // $FlowExpectedError
    return null;
  }

  mapImportDeclaration(node) {
    if (node.importKind === 'value') {
      this.setModuleSourceType();
    }

    return this.mapNodeDefault(node);
  }

  mapImportSpecifier(node) {
    if (node.importKind === 'value') {
      node.importKind = null;
    }

    return this.mapNodeDefault(node);
  }

  mapExportDefaultDeclaration(node) {
    this.setModuleSourceType();
    return this.mapNodeDefault(node);
  }

  mapExportNamedDeclaration(node) {
    if (node.exportKind === 'value') {
      this.setModuleSourceType();
    }

    return this.mapNodeDefault(node);
  }

  mapExportAllDeclaration(node) {
    if (node.exportKind === 'value') {
      this.setModuleSourceType();
    }

    return this.mapNodeDefault(node);
  }

  formatError(node, message) {
    return `${message} (${node.loc.start.line}:${node.loc.start.column})`;
  }

}

exports.default = HermesASTAdapter;