import { X2jOptions, XMLParser } from "fast-xml-parser";

//#region Types

/** The line that appears at the top of XML files. */
const DEFAULT_XML_DECLARATION = () => ({
  version: "1.0",
  encoding: "utf-8"
});

/** Generic interface that can support any attributes. */
type Attributes = { [key: string]: any; };

/** Types that may appear in a value node. */
type XmlValue = number | bigint | boolean | string;

/** Options to use when writing a node as an XML string. */
interface XmlFormattingOptions extends Partial<{
  /**
   * Number of times to indent this node. This will increase by 1 for each
   * recursive call, unless minify = true. (Default = 0)
   */
  indents: number;

  /**
   * Whether or not the output XML should be minified (i.e. have all of its
   * unneeded whitespace removed). If true, then `indents` and `spacesPerIndent`
   * will be ignored, and the output will appear on one line. (Default = false)
   */
  minify: boolean;

  /**
   * Number of spaces to use per indent. (Default = 2)
   */
  spacesPerIndent: number;

  /**
   * Whether or not to include comments. If minifying, this option is ignored.
   * (Default = true)
   */
  // writeComments: boolean;

  /**
   * Whether or not to include any XML processing instructions other than the
   * XML declaration at the top of the file. If minifying, this option is
   * ignored. (Default = true)
   */
  writeProcessingInstructions: boolean;

  /**
   * Whether or not to include the XML declaration at the top of the file. Only
   * applicable to document nodes. (Default = true)
   */
  writeXmlDeclaration: boolean;
}> { };

/** Options to use when writing an element node as an XML string. */
type XmlElementFormattingOptions =
  Omit<XmlFormattingOptions, "writeXmlDeclaration">;

/** Options to use when writing a childless node as an XML string. */
type XmlValueFormattingOptions =
  Omit<XmlElementFormattingOptions, "writeProcessingInstructions">;

//#endregion Types

//#region Models

/** A node in an XML DOM. */
export interface XmlNode {
  //#region Properties

  /**
   * Object containing the attributes of this node. Guaranteed to be an object
   * if this node is able to have attributes, but if it cannot have attributes
   * (e.g. value nodes, comment nodes), it is undefined.
   */
  get attributes(): Attributes;

  /**
   * The first child of this node. If there are no children, it is undefined.
   * If this node cannot have children, then an exception is thrown when setting
   * this property.
   */
  get child(): XmlNode;
  set child(child: XmlNode);

  /**
   * The children of this node. This is guaranteed to be an array if this node
   * can have children (e.g. a document or an element), but is undefined if it
   * cannot (e.g. values or comments).
   */
  get children(): XmlNode[];

  /** Whether or not this node has an array for children. */
  get hasChildren(): boolean;

  /**
   * Shorthand for the `s` attribute. If this node cannot have attributes, an
   * exception is thrown when setting this property.
   */
  get id(): string | number | bigint;
  set id(id: string | number | bigint);

  /** 
   * The value of this node's first child, if it has one. If this node cannot
   * have children, or if its first child cannot have a value, an exception is
   * thrown when setting this property.
   */
  get innerValue(): XmlValue;
  set innerValue(value: XmlValue);

  /**
   * Shorthand for the `n` attribute. If this node cannot have attributes, an
   * exception is thrown when setting this property.
   */
  get name(): string;
  set name(name: string);

  /** The number of children on this node. */
  get numChildren(): number;

  /**
   * The tag of this node. If this node is not an element or if the given tag is
   * not a non-empty string, an exception is thrown when setting this property.
   */
  get tag(): string;
  set tag(tag: string);

  /**
   * Shorthand for the `t` attribute. If this node cannot have attributes, an
   * exception is thrown when setting this property.
   */
  get type(): string;
  set type(type: string);

  /**
   * The value of this node. If this node cannot have a value (i.e. it has
   * children instead), an exception is thrown when setting this property.
   */
  get value(): XmlValue;
  set value(value: XmlValue);

  //#endregion Properties

  //#region Methods

  /**
   * Adds the given children to this node by object reference. If you are adding
   * these children to multiple nodes and plan on mutating them, it is
   * recommended that you use `addClones()` instead.
   * 
   * @param children Child nodes to append to this one
   * @throws If this node cannot have children
   */
  addChildren(...children: XmlNode[]): void;

  /**
   * Adds the given children to this node by value. All children are cloned
   * prior to being added.
   * 
   * @param children Child nodes to append to this one
   * @throws If this node cannot have children
   */
  addClones(...children: XmlNode[]): void;

  /**
   * Returns a deep copy of this node.
   */
  clone(): XmlNode;

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

  /**
   * Finds and returns the first child that has the given name. If no children
   * have this name, undefined is returned. If this node cannot have children,
   * an exception is thrown.
   * 
   * @param name Name attribute of child to find
   * @throws If this node cannot have children
   */
  findChild(name: string): XmlNode;

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

  /**
   * Serializes this node and all of its descendants as XML code.
   * 
   * @param options Object containing options for serializing
   */
  toXml(options?: XmlFormattingOptions): string;

  //#endregion Methods
}

/** A base implementation of XmlNode. */
abstract class XmlNodeBase implements XmlNode {
  protected _attributes?: Attributes;
  protected _children?: XmlNode[];
  protected _tag?: string;
  protected _value?: XmlValue;

  constructor({ attributes, children, tag, value }: {
    attributes?: Attributes;
    children?: XmlNode[];
    tag?: string;
    value?: XmlValue;
  }) {
    this._attributes = attributes;
    this._children = children;
    this._tag = tag;
    this._value = value;
  }

  //#region Getters

  get attributes(): Attributes {
    return this._attributes;
  }

  get child(): XmlNode {
    return this.children?.[0];
  }

  get children(): XmlNode[] {
    return this._children;
  }

  get hasChildren(): boolean {
    return this.children !== undefined;
  }

  get id(): string | number | bigint {
    return this._attributes?.s;
  }

  get innerValue(): XmlValue {
    return this.child?.value;
  }

  get name(): string {
    return this.attributes?.n;
  }

  get numChildren(): number {
    return this.children?.length || 0;
  }

  get tag(): string {
    return this._tag;
  }

  get type(): string {
    return this.attributes?.t;
  }

  get value(): XmlValue {
    return this._value;
  }

  //#endregion Getters

  //#region Setters

  set child(child: XmlNode) {
    if (!this.hasChildren)
      throw new Error("Cannot set child of childless node.");
    this.children[0] = child;
  }

  set id(id: string | number | bigint) {
    this._setAttribute('s', id);
  }

  set innerValue(value: XmlValue) {
    this._ensureChildren();
    if (this.numChildren === 0) {
      this.addChildren(new XmlValueNode(value));
    } else {
      this.child.value = value; // might throw, that's OK
    }
  }

  set name(name: string) {
    this._setAttribute('n', name);
  }

  set tag(tag: string) {
    if (!this.tag) throw new Error("Cannot set tag of non-element node.");
    if (!tag) throw new Error("Tag must be a non-empty string.");
    this._tag = tag;
  }

  set type(type: string) {
    this._setAttribute('t', type);
  }

  set value(value: XmlValue) {
    if (this.hasChildren)
      throw new Error("Cannot set value of node with children.");
    this._value = value;
  }

  //#endregion Setters

  //#region Methods

  addChildren(...children: XmlNode[]): void {
    this._ensureChildren();
    this.children.push(...children);
  }

  addClones(...children: XmlNode[]): void {
    this._ensureChildren();
    this.children.push(...(children.map(child => child.clone())));
  }

  abstract clone(): XmlNode;

  deepSort(compareFn?: (a: XmlNode, b: XmlNode) => number): void {
    this._ensureChildren();
    this.sort(compareFn);
    this.children.forEach(child => {
      if (child.children) child.deepSort(compareFn);
    });
  }

  findChild(name: string): XmlNode {
    if (!this.hasChildren)
      throw new Error("Cannot find child for childless node.");
    return this.children.find(child => child.name === name);
  }

  sort(compareFn?: (a: XmlNode, b: XmlNode) => number): void {
    this._ensureChildren();
    this.children.sort(compareFn || ((a, b) => {
      const aName = a.attributes.n;
      const bName = b.attributes.n;
      if (aName) {
        if (bName) {
          if (aName < bName) return -1;
          if (aName > bName) return 1;
          return 0;
        }
        return -1;
      }
      return bName ? 1 : 0;
    }));
  }

  abstract toXml(options?: XmlFormattingOptions): string;

  //#endregion Methods

  //#region Private Methods

  private _setAttribute(key: string, value: any) {
    if (this.attributes === undefined)
      throw new Error("Cannot set attribute of non-element node.")
    this.attributes[key] = value;
  }

  private _ensureChildren() {
    if (!this.hasChildren)
      throw new Error("Cannot mutate children of childless node.");
  }

  //#endregion Private Methods
}

/** A complete XML document with children. */
export class XmlDocumentNode extends XmlNodeBase {
  protected _declaration?: Attributes;

  /** The attributes that should appear in the XML declaration. */
  get declaration(): Attributes {
    return this._declaration;
  }

  /**
   * Creates a new XmlDocumentNode from the given root node. If no root node
   * is given, then this document is empty.
   * 
   * Options
   * - `declaration`: Object of attributes to use in the XML declaration. Value
   *   is `{ version: "1.0", encoding: "utf-8" }` by default.
   * 
   * @param root Optional node to use at the root of this document
   * @param options Optional arguments
   */
  constructor(root?: XmlNode, options?: {
    declaration?: Attributes
  }) {
    super({ children: (root ? [root] : []) })
    this._declaration = options?.declaration ?? DEFAULT_XML_DECLARATION();
  }

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
  static from(xml: string | Buffer, {
    allowMultipleRoots = false,
    ignoreComments = false,
    ignoreProcessingInstructions = false,
  }: {
    allowMultipleRoots?: boolean;
    ignoreComments?: boolean;
    ignoreProcessingInstructions?: boolean;
  } = {}): XmlDocumentNode {
    const { nodes, declaration } =
      parseXml(xml, !ignoreComments, !ignoreProcessingInstructions);

    if (nodes.length <= 1) return new XmlDocumentNode(nodes[0], {
      declaration
    });

    if (allowMultipleRoots) {
      const doc = new XmlDocumentNode(null, { declaration });
      doc.children.push(...nodes);
      return doc;
    } else {
      throw new Error("XML document should only have one root node.");
    }
  }

  addChildren(...children: XmlNode[]): void {
    if (this.numChildren + children.length > 1)
      throw new Error("XML document should only have one root node.");
    super.addChildren(...children);
  }

  addClones(...children: XmlNode[]): void {
    if (this.numChildren + children.length > 1)
      throw new Error("XML document should only have one root node.");
    super.addClones(...children);
  }

  clone(): XmlDocumentNode {
    return new XmlDocumentNode(...(this.children.map(child => child.clone())));
  }

  toXml({
    indents = 0,
    minify = false,
    spacesPerIndent = 2,
    // writeComments = true,
    writeProcessingInstructions = true,
    writeXmlDeclaration = true
  }: XmlFormattingOptions = {}): string {
    const spaces = minify ? "" : " ".repeat(indents * spacesPerIndent);
    const lines: string[] = [];
    if (writeXmlDeclaration)
      lines.push(`${spaces}<?xml${getAttrsString(this.declaration)}?>`);

    this.children.forEach(child => {
      if (writeProcessingInstructions || !(child instanceof XmlWrapperNode))
        lines.push(child.toXml({
          indents,
          minify,
          spacesPerIndent,
          writeProcessingInstructions,
        }));
    });

    return lines.join(minify ? "" : "\n");
  }
}

/** A node with a tag, attributes, and children. */
export class XmlElementNode extends XmlNodeBase {
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
  constructor({ tag, attributes = {}, children = [] }: {
    tag: string;
    attributes?: Attributes;
    children?: XmlNode[];
  }) {
    if (!tag) throw new Error("Element tag must be a non-empty string.");
    super({ tag, attributes, children });
  }

  clone(): XmlElementNode {
    return new XmlElementNode({
      tag: this.tag,
      attributes: Object.assign({}, this.attributes),
      children: this.children.map(child => child.clone())
    });
  }

  toXml({
    indents = 0,
    minify = false,
    spacesPerIndent = 2,
    writeProcessingInstructions = true
  }: XmlElementFormattingOptions = {}): string {
    const spaces = minify ? "" : " ".repeat(indents * spacesPerIndent);
    const lines: string[] = [];
    const attrString = getAttrsString(this.attributes);

    if (this.numChildren === 0) {
      lines.push(`${spaces}<${this.tag}${attrString}/>`);
    } else {
      const shouldWriteChild = (child: XmlNode) =>
        (writeProcessingInstructions || !(child instanceof XmlWrapperNode));

      if (this.numChildren <= 2 && !this.child.hasChildren) {
        const value = this.children.map(child => {
          return shouldWriteChild(child)
            ? child.toXml()
            : "";
        }).join('');
        lines.push(`${spaces}<${this.tag}${attrString}>${value}</${this.tag}>`);
      } else {
        lines.push(`${spaces}<${this.tag}${attrString}>`);
        const childIndents = minify ? indents : indents + 1;
        this.children.forEach(child => {
          if (shouldWriteChild(child)) lines.push(child.toXml({
            indents: childIndents,
            minify,
            spacesPerIndent,
            writeProcessingInstructions
          }));
        });
        lines.push(`${spaces}</${this.tag}>`);
      }
    }

    return lines.join(minify ? "" : "\n");
  }
}

/** A node that contains a single value. */
export class XmlValueNode extends XmlNodeBase {
  /**
   * Creates a new XmlValueNode with the given value.
   * 
   * @param value Optional value of this node.
   */
  constructor(value?: XmlValue) {
    super({ value });
  }

  clone(): XmlValueNode {
    return new XmlValueNode(this.value);
  }

  toXml({
    indents = 0,
    minify = false,
    spacesPerIndent = 2,
  }: XmlValueFormattingOptions = {}): string {
    if (this.value == undefined) return '';
    const spaces = minify ? "" : " ".repeat(indents * spacesPerIndent);
    return `${spaces}${formatValue(this.value)}`;
  }
}

/** A node that contains a comment. */
export class XmlCommentNode extends XmlNodeBase {
  constructor(value?: string) {
    super({ value })
  }

  clone(): XmlCommentNode {
    return new XmlCommentNode(this.value as string);
  }

  toXml({
    indents = 0,
    minify = false,
    spacesPerIndent = 2
  }: XmlValueFormattingOptions = {}): string {
    const spaces = minify ? "" : " ".repeat(indents * spacesPerIndent);
    const comment = this.value == undefined ? '' : formatValue(this.value);
    return `${spaces}<!--${comment}-->`;
  }
}

/** A processing instruction node that contains other XML. */
export class XmlWrapperNode extends XmlNodeBase {
  /**
   * Creates a new XmlWrappingNode with the given tag and children. If this is a
   * PI tag with attributes rather than actual nodes, the attributes should be
   * plain text in a value node. Note that the tag should NOT include the "?",
   * as it will be appended when the node is serialized.
   * 
   * Arguments:
   * - `tag`: Required. The tag to use for this node (do NOT include "?").
   * - `children`: An array for the children of this node. (Default = [])
   * 
   * @param args Arguments for construction 
   */
  constructor({ tag, children = [] }: {
    tag: string;
    children?: XmlNode[];
  }) {
    if (!tag) throw new Error("Element tag must be a non-empty string.");
    super({ tag, children });
  }

  clone(): XmlWrapperNode {
    return new XmlWrapperNode({
      tag: this.tag,
      children: this.children.map(child => child.clone())
    });
  }

  toXml({
    indents = 0,
    minify = false,
    spacesPerIndent = 2
  }: XmlValueFormattingOptions = {}): string {
    const spaces = minify ? "" : " ".repeat(indents * spacesPerIndent);
    const lines: string[] = [];

    // tags & children
    if (this.numChildren === 0) {
      lines.push(`${spaces}<?${this.tag}?>`);
    } else if (this.numChildren <= 2 && !this.child.hasChildren) {
      const value = this.children.map(child => child.toXml()).join('');
      lines.push(`${spaces}<?${this.tag} ${value} ?>`);
    } else {
      lines.push(`${spaces}<?${this.tag}`);
      if (minify) lines.push(" ");
      const childIndents = minify ? indents : indents + 1;
      this.children.forEach(child => {
        lines.push(child.toXml({
          indents: childIndents,
          minify,
          spacesPerIndent
        }));
      });
      if (minify) lines.push(" ");
      lines.push(`${spaces}?>`);
    }

    return lines.join(minify ? "" : "\n");
  }
}

//#endregion Models

//#region Helpers

const PI_NODE_TAG = "__PI_NODE";

class UnescapedProcessingInstructionsError extends Error { }

/**
 * Formats a value that may appear in XML as a string.
 * 
 * @param value Value to format for XML
 */
function formatValue(value: number | bigint | boolean | string): string {
  switch (typeof value) {
    case 'boolean':
      return value ? 'True' : 'False';
    case 'number':
    case 'bigint':
      return value.toString();
    default:
      return value;
  }
}

/**
 * Parses a string or buffer containing XML as a list of nodes.
 * 
 * @param xml XML document to parse as a node
 * @param parseComments Whether or not to parse comment nodes
 * @param parsePiTags Whether or not to parse PI nodes
 */
function parseXml(
  xml: string | Buffer,
  parseComments: boolean,
  parsePiTags: boolean,
): {
  nodes: XmlNode[];
  declaration: Attributes;
} {
  try {
    const options: Partial<X2jOptions> = {
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: false,
      parseTagValue: false,
      textNodeName: "value",
      preserveOrder: true,
    };

    if (parseComments) options.commentPropName = "comment";
    const parser = new XMLParser(options);

    interface NodeObj {
      value?: number | bigint | string;
      comment?: { value: string }[];
      attributes?: { [key: string]: string };
      [key: string]: any;
    }

    const nodeObjs: NodeObj[] = parser.parse(xml);
    let declaration: Attributes;

    function parseNodeObj(nodeObj: NodeObj): XmlNode {
      if (nodeObj.comment) {
        return new XmlCommentNode(nodeObj.comment[0].value);
      } else if (nodeObj.value) {
        return new XmlValueNode(nodeObj.value);
      } else {
        let tag: string;
        let children: XmlNode[];
        let attributes: Attributes = {};
        let isWrapper = false;
        let isDeclaration = false;

        for (const key in nodeObj) {
          if (key === ":@") {
            Object.assign(attributes, nodeObj[key]);
          } else if (key.startsWith("?xml")) {
            if (declaration) return undefined;
            isDeclaration = true;
          } else if (key === PI_NODE_TAG) {
            isWrapper = true;
            children = parseNodeObjArray(nodeObj[key]);
          } else if (key.startsWith("?")) {
            if (!parsePiTags) return undefined;
            throw new UnescapedProcessingInstructionsError();
          } else { // guaranteed to execute once and only once
            tag = key;
            children = parseNodeObjArray(nodeObj[key]);
          }
        }

        if (isDeclaration) {
          declaration = attributes;
        } else {
          return isWrapper
            ? new XmlWrapperNode({ tag: attributes.tag, children })
            : new XmlElementNode({ tag, children, attributes });
        }
      }
    }

    function parseNodeObjArray(nodeObjArr: NodeObj[]): XmlNode[] {
      return nodeObjArr.map(parseNodeObj).filter((n: any) => n);
    }

    try {
      return {
        nodes: parseNodeObjArray(nodeObjs),
        declaration
      };
    } catch (e) {
      if (e instanceof UnescapedProcessingInstructionsError) {
        return parseXml(
          replaceProcessingInstructions(xml),
          parseComments,
          false
        );
      } else {
        throw e;
      }
    }
  } catch (e) {
    throw new Error(`Could not parse XML as DOM: ${e}`);
  }
}

/**
 * Transforms all PI tags in the given XML string/Buffer to special element tags
 * that can be parsed as regular nodes.
 * 
 * @param xml XML content to replace all PI tags in
 */
function replaceProcessingInstructions(xml: string | Buffer): string {
  const piSpanRegex = /<\?\s*[^(xml)](?:(?!\?>).)*\?>/gis;
  const piOpenTagRegex = /^<\?\s*\S*/;
  const piCloseTagRegex = /\?>$/;
  const xmlString = (typeof xml === "string" ? xml : xml.toString());
  return xmlString.replace(piSpanRegex, (prev) => {
    const openTagResult = piOpenTagRegex.exec(prev);
    const tag = openTagResult![0].replace("<?", "").trim();
    const innerContent = prev
      .replace(piOpenTagRegex, "")
      .replace(piCloseTagRegex, "");
    return `<${PI_NODE_TAG} tag="${tag}">${innerContent}</${PI_NODE_TAG}>`;
  });
}

/**
 * Formats the given attributes into a string.
 * 
 * @param attrs Attributes to get string for
 */
function getAttrsString(attrs: Attributes): string {
  const attrKeys = Object.keys(attrs);
  const attrNodes: string[] = [];
  if (attrKeys.length > 0) {
    attrNodes.push(''); // just for spacing
    attrKeys.forEach(key => {
      const value = formatValue(attrs[key]);
      attrNodes.push(`${key}="${value}"`);
    });
  }
  return attrNodes.join(' ');
}

//#endregion Helpers
