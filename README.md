# Sims 4 Toolkit - XML DOM (@s4tk/xml-dom)

## Overview

This package contains an XML DOM that is tailored for use with Sims 4 tuning files. This XML DOM is general enough to be reused for non-tuning resources, such as ASMs or XML-represented SimData, but is not general enough for uses outside of The Sims 4 modding.

**PLEASE NOTE**: Proper documentation for this package will be provided when the Sims 4 Toolkit website has been completed. For now, please reference this README's Documentation section, where the TS declaration file stubs are provided.

## Installation

Install the package as a dependency from npm with the following command:

```sh
npm i @s4tk/xml-dom
```

## Disclaimer

Sims 4 Toolkit (S4TK) is a collection of creator-made modding tools for [The Sims 4](https://www.ea.com/games/the-sims). "The Sims" is a registered trademark of [Electronic Arts, Inc](https://www.ea.com/). (EA). Sims 4 Toolkit is not affiliated with or endorsed by EA.

All S4TK software is currently considered to be in its pre-release stage. Use at your own risk, knowing that breaking changes are likely to happen.

## Documentation

### Index

- [interface XmlNode](#interface-xmlnode)
- [class XmlDocumentNode](#class-xmldocumentnode)
- [class XmlElementNode](#class-xmlelementnode)
- [class XmlValueNode](#class-xmlvaluenode)
- [class XmlCommentNode](#class-xmlcommentnode)

### interface XmlNode

An interface for all XML nodes.

#### Importing 

```ts
import type { XmlNode } from "@s4tk/xml-dom"; // ESM (TypeScript only)
```

#### Properties

```ts
/**
 * Object containing the attributes of this node. Guaranteed to be an object
 * if this node is able to have attributes, but if it cannot have attributes
 * (e.g. value nodes, comment nodes), it is undefined.
 */
get attributes(): Attributes;
```

```ts
/**
 * The first child of this node. If there are no children, it is undefined.
 * If this node cannot have children, then an exception is thrown when setting
 * this property.
 */
get child(): XmlNode;
set child(child: XmlNode);
```

```ts
/**
 * The children of this node. This is guaranteed to be an array if this node
 * can have children (e.g. a document or an element), but is undefined if it
 * cannot (e.g. values or comments).
 */
get children(): XmlNode[];
```

```ts
/** Whether or not this node has an array for children. */
get hasChildren(): boolean;
```

```ts
/**
 * Shorthand for the `s` attribute. If this node cannot have attributes, an
 * exception is thrown when setting this property.
 */
get id(): string | number | bigint;
set id(id: string | number | bigint);
```

```ts
/** 
 * The value of this node's first child, if it has one. If this node cannot
 * have children, or if its first child cannot have a value, an exception is
 * thrown when setting this property.
 */
get innerValue(): XmlValue;
set innerValue(value: XmlValue);
```

```ts
/**
 * Shorthand for the `n` attribute. If this node cannot have attributes, an
 * exception is thrown when setting this property.
 */
get name(): string;
set name(name: string);
```

```ts
/** The number of children on this node. */
get numChildren(): number;
```

```ts
/**
 * The tag of this node. If this node is not an element or if the given tag is
 * not a non-empty string, an exception is thrown when setting this property.
 */
get tag(): string;
set tag(tag: string);
```

```ts
/**
 * Shorthand for the `t` attribute. If this node cannot have attributes, an
 * exception is thrown when setting this property.
 */
get type(): string;
set type(type: string);
```

```ts
/**
 * The value of this node. If this node cannot have a value (i.e. it has
 * children instead), an exception is thrown when setting this property.
 */
get value(): XmlValue;
set value(value: XmlValue);
```

#### Methods

```ts
/**
 * Adds the given children to this node by object reference. If you are adding
 * these children to multiple nodes and plan on mutating them, it is
 * recommended that you use `addClones()` instead.
 * 
 * @param children Child nodes to append to this one
 * @throws If this node cannot have children
 */
addChildren(...children: XmlNode[]): void;
```

```ts
/**
 * Adds the given children to this node by value. All children are cloned
 * prior to being added.
 * 
 * @param children Child nodes to append to this one
 * @throws If this node cannot have children
 */
addClones(...children: XmlNode[]): void;
```

```ts
/**
 * Returns a deep copy of this node.
 */
clone(): XmlNode;
```

```ts
/**
 * Calls the `sort()` method on this node and all of its descendants.
 * 
 * @param compareFn Function used to determine the order of the elements. It
 * is expected to return a negative value if first argument is less than
 * second argument, zero if they're equal and a positive value otherwise. If
 * omitted, the elements are sorted in ascending, ASCII character order.
 * [Copied from `Array.sort()` documentation]
 * @throws If this node cannot have children
 */
deepSort(compareFn?: (a: XmlNode, b: XmlNode) => number): void;
```

```ts
/**
 * Sorts the children of this node using the provided function. If no function
 * is given, they are sorted in ascending alphanumeric order by their `n`
 * attribute (their name). Children without names will retain their order
 * relative to one another and will appear at the end.
 * 
 * @param compareFn Function used to determine the order of the elements. It
 * is expected to return a negative value if first argument is less than
 * second argument, zero if they're equal and a positive value otherwise. If
 * omitted, the elements are sorted in ascending, ASCII character order.
 * [Copied from `Array.sort()` documentation]
 * @throws If this node cannot have children
 */
sort(compareFn?: (a: XmlNode, b: XmlNode) => number): void;
```

```ts
/**
 * Serializes this node and all of its descendants as XML code.
 * 
 * Options
 * - `indents`: Number of times to indent this node. This will increase by 1
 * for each recursive call. (Default = 0)
 * - `spacesPerIndent`: Number of spaces to use per indent. (Default = 2)
 * 
 * @param options Object containing options for serializing
 */
toXml(options?: { indents?: number; spacesPerIndent?: number; }): string;
```

### class XmlDocumentNode 

A node for an entire XML document. This document _can_ have multiple children, but one is recommended.

See [XmlNode](#interface-xmlnode) for properties and methods.

#### Importing

```ts
import { XmlDocumentNode } from "@s4tk/xml-dom"; // ESM
const { XmlDocumentNode } = require("@s4tk/xml-dom"); // CJS
```

#### Initialization

```ts
/**
 * Creates a new XmlDocumentNode from the given root node. If no root node
 * is given, then this document is empty.
 * 
 * @param root Optional node to use at the root of this document
 */
constructor(root?: XmlNode);
```

```ts
/**
 * Parses and returns either a string or a buffer containing XML code as a
 * XmlDocumentNode, if possible.
 * 
 * Options
 * - `allowMultipleRoots`: Whether or not the document should still be created
 * if it will have multiple roots. If false, an exception will be thrown if
 * there is more than one root element. (Default = false)
 * - `ignoreComments`: Whether or not comments should be ignored. If false,
 * comments will be parsed. (Default = false)
 * 
 * @param xml XML document to parse as a node
 * @param options Optional object containing options
 */
static from(xml: string | Buffer, options?: {
  allowMultipleRoots?: boolean;
  ignoreComments?: boolean;
}): XmlDocumentNode;
```

### class XmlElementNode

A node that can have a tag, attributes, and children.

See [XmlNode](#interface-xmlnode) for properties and methods.

#### Importing

```ts
import { XmlElementNode } from "@s4tk/xml-dom"; // ESM
const { XmlElementNode } = require("@s4tk/xml-dom"); // CJS
```

#### Initialization

```ts
/**
 * Creates a new XmlElementNode with the given tag, attributes, and children.
 * 
 * Arguments:
 * - `tag`: Required. The tag to use for this node.
 * - `attributes`: An object for the attributes of this node. (Default = {})
 * - `children`: An array for the children of this node. (Default = [])
 * 
 * @param args Arguments for construction 
 */
constructor(args: {
  tag: string;
  attributes?: Attributes;
  children?: XmlNode[];
});
```

### class XmlValueNode

A node that can have an inner value.

See [XmlNode](#interface-xmlnode) for properties and methods.

#### Importing

```ts
import { XmlValueNode } from "@s4tk/xml-dom"; // ESM
const { XmlValueNode } = require("@s4tk/xml-dom"); // CJS
```

#### Initialization

```ts
/**
 * Creates a new XmlValueNode with the given value.
 * 
 * @param value Optional value of this node.
 */
constructor(value?: XmlValue);
```

### class XmlCommentNode

A node that can have a comment value.

See [XmlNode](#interface-xmlnode) for properties and methods.

#### Importing

```ts
import { XmlCommentNode } from "@s4tk/xml-dom"; // ESM
const { XmlCommentNode } = require("@s4tk/xml-dom"); // CJS
```

#### Initialization

```ts
/**
 * Creates a new XmlCommentNode with the given value.
 * 
 * @param value Optional value of this comment node.
 */
constructor(value?: string);
```
