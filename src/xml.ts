import { X2jOptions, XMLParser } from "fast-xml-parser";

//#region Constants

const PI_NODE_TAG = "__PI_NODE";

/** The line that appears at the top of XML files. */
const DEFAULT_XML_DECLARATION = () => ({
  version: "1.0",
  encoding: "utf-8"
});

//#endregion Constants

//#region Types

/** Generic interface that can support any attributes. */
type Attributes = { [key: string]: any; };

/** Non-optional version of XmlFormattingOptions. */
interface CompleteXmlFormattingOptions extends Required<XmlFormattingOptions> {
  __isComplete: true;
}

/** An object that references a specific recycled node. */
interface RecycledNodeRef<T extends XmlNode> {
  ref: number;
  node: T;
}

/** Object containing recyled nodes. */
interface RecycledNodesCache {
  /**
   * Mapping of comment nodes.
   * 
   * ### Key
   * The content of the node, exactly as it appears in XML.
   * 
   * Example:
   * - `<!--Something-->` => `"Something"`
   */
  comments: Map<string, RecycledNodeRef<XmlCommentNode>>;

  /**
   * Mapping of element nodes.
   * 
   * ### First Key
   * The concatenation of this node's tag, attributes (except for `n`), and
   * child refs. Attribute key/values are joined with "=", attributes are sorted
   * by key and then joined with ",", and child refs are sorted and joined with
   * ",". The tag, attributes, and child refs are then joined with "&".
   * 
   * Examples:
   * - `<V n="name" t="type"/>` => `"V&t=type"`
   * - `<I s="12345" c="class" />` => `"I&c=class,s=12345"`
   * - `<V t="type"> ... </V>` w/ ref 5 => `"V&t=type&5"`
   * - `<L> ... </L>` w/ refs 5 + 10 => `"L&5,10"`
   * 
   * ### Second Key
   * The name (`n` attribute), if there is one. If the element does not have a
   * name, then an empty string is used.
   * 
   * Examples:
   * - `<V n="name" t="type"/>` => `"name"`
   * - `<V t="type" />` => `""`
   */
  elements: Map<string, Map<string, RecycledNodeRef<XmlElementNode>>>;

  /**
   * Mapping of value nodes.
   * 
   * ### Key
   * The string value of the node, exactly as it appears in XML.
   * 
   * Examples:
   * - `Something` => `"Something"`
   * - `12345` => `"12345"`
   */
  values: Map<string, RecycledNodeRef<XmlValueNode>>;

  /**
   * Mapping of wrapper nodes.
   * 
   * ### Key
   * The concatenation of this node's tag and its child refs. The child refs
   * are sorted and then joined with ",". The tag and refs are joined by "&".
   * 
   * Examples:
   * - `<?ignore?>` => `"ignore"`
   * - `<?ignore ... ?>` w/ ref 5  => `"ignore&5"`
   * - `<?ignore ... ?>` w/ refs 5 + 10  => `"ignore&5,10"`
   */
  wrappers: Map<string, RecycledNodeRef<XmlWrapperNode>>
}

/** An error to throw when a PI tag is detected. */
class UnescapedProcessingInstructionsError extends Error { }

/** Options to use when reading XML from a string/buffer. */
interface XmlParsingOptions extends Partial<{
  /**
   * Whether or not to ignore comments while parsing XML. If true, then comments
   * will be entirely left out. False by default.
   */
  ignoreComments: boolean;

  /**
   * Whether or not to ignore processing intructions while parsing XML. If true,
   * then PI tags (other than the XML declaration) will be entirely left out.
   * False by default.
   */
  ignoreProcessingInstructions: boolean;

  /**
   * An object that is used to keep track of recycled nodes. This does not need
   * to be provided by the user; it will be generated if `recycleNodes = true`.
   */
  recycledNodesCache: RecycledNodesCache;

  /**
   * Whether or not nodes that share the exact same structure should be loaded
   * once and only once. This should never be true if you intend on modifying
   * the DOM at all, as doing so can lead to unintended side effects. False by
   * default.
   */
  recycleNodes: boolean;
}> { }

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
   * Whether or not to include comments. It is recommended to set this to false
   * when minify = true. (Default = true)
   */
  writeComments: boolean;

  /**
   * Whether or not to include any XML processing instructions other than the
   * XML declaration at the top of the file. It is recommended to set this to
   * false when minify = true. (Default = true)
   */
  writeProcessingInstructions: boolean;

  /**
   * Whether or not to include the XML declaration at the top of the file. Only
   * applicable to document nodes. (Default = true)
   */
  writeXmlDeclaration: boolean;
}> { }

/** Options to use when writing an element node as an XML string. */
type XmlElementFormattingOptions =
  Omit<XmlFormattingOptions, "writeXmlDeclaration">;

/** Types that may appear in a value node. */
type XmlValue = number | bigint | boolean | string;

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
   * @param xml XML document to parse as a node
   * @param options Object containing options
   */
  static from(xml: string | Buffer, options?: XmlParsingOptions): XmlDocumentNode {
    const { nodes, declaration } = parseXml(xml, options);
    const doc = new XmlDocumentNode(undefined, { declaration });
    doc.children.push(...nodes);
    return doc;
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
    const declaration = Object.assign({}, this.declaration);
    const clone = new XmlDocumentNode(null, { declaration });
    clone.addClones(...this.children);
    return clone;
  }

  toXml(options: XmlFormattingOptions = {}): string {
    const completeOptions = getCompleteOptions(options);
    const spaces = getSpaces(completeOptions);
    const lines: string[] = [];

    if (completeOptions.writeXmlDeclaration)
      lines.push(`${spaces}<?xml${getAttrsString(this.declaration)}?>`);

    this.children.forEach(child => {
      if (shouldWriteChild(child, completeOptions))
        lines.push(child.toXml(completeOptions));
    });

    return joinXmlLines(lines, completeOptions);
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

  toXml(options: XmlElementFormattingOptions = {}): string {
    const completeOptions = getCompleteOptions(options);
    const spaces = getSpaces(completeOptions);
    const lines: string[] = [];
    const attrString = getAttrsString(this.attributes);

    if (this.numChildren === 0) {
      lines.push(`${spaces}<${this.tag}${attrString}/>`);
    } else if (this.numChildren <= 2 && !this.child.hasChildren) {
      const value = this.children.map(child => {
        return shouldWriteChild(child, completeOptions)
          ? child.toXml()
          : "";
      }).join("");
      lines.push(`${spaces}<${this.tag}${attrString}>${value}</${this.tag}>`);
    } else {
      lines.push(`${spaces}<${this.tag}${attrString}>`);

      const childOptions = options.minify
        ? completeOptions
        : cloneOptionsWithOverrides(completeOptions, {
          indents: completeOptions.indents + 1
        });

      this.children.forEach(child => {
        if (shouldWriteChild(child, completeOptions)) {
          lines.push(child.toXml(childOptions));
        }
      });

      lines.push(`${spaces}</${this.tag}>`);
    }

    return joinXmlLines(lines, completeOptions);
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

  toXml(options: XmlValueFormattingOptions = {}): string {
    if (this.value == undefined) return "";
    const completeOptions = getCompleteOptions(options);
    const spaces = getSpaces(completeOptions);
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

  toXml(options: XmlValueFormattingOptions = {}): string {
    const completeOptions = getCompleteOptions(options);
    const spaces = getSpaces(completeOptions);
    const comment = this.value == undefined ? "" : formatValue(this.value);
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

  toXml(options: XmlValueFormattingOptions = {}): string {
    const completeOptions = getCompleteOptions(options);
    const spaces = getSpaces(completeOptions);
    const lines: string[] = [];

    // tags & children
    if (this.numChildren === 0) {
      lines.push(`${spaces}<?${this.tag}?>`);
    } else if (this.numChildren <= 2 && !this.child.hasChildren) {
      const value = this.children.map(child => child.toXml()).join("");
      lines.push(`${spaces}<?${this.tag} ${value} ?>`);
    } else {
      lines.push(`${spaces}<?${this.tag}`);
      if (completeOptions.minify) lines.push(" ");

      const childOptions = options.minify
        ? completeOptions
        : cloneOptionsWithOverrides(completeOptions, {
          indents: completeOptions.indents + 1
        });

      this.children.forEach(child => {
        lines.push(child.toXml(childOptions));
      });

      if (completeOptions.minify) lines.push(" ");
      lines.push(`${spaces}?>`);
    }

    return joinXmlLines(lines, completeOptions);
  }
}

//#endregion Models

//#region Helpers

/**
 * Parses a string or buffer containing XML as a list of nodes.
 * 
 * @param xml XML document to parse as a node
 * @param options Object of optional arguments
 */
function parseXml(
  xml: string | Buffer,
  options?: XmlParsingOptions
): {
  nodes: XmlNode[];
  declaration: Attributes;
} {
  try {
    const x2jOptions: Partial<X2jOptions> = {
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: false,
      parseTagValue: false,
      textNodeName: "value",
      preserveOrder: true,
    };

    if (!options?.ignoreComments) x2jOptions.commentPropName = "comment";
    const parser = new XMLParser(x2jOptions);

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
            if (options?.ignoreProcessingInstructions) return undefined;
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
          options
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
    attrNodes.push(""); // just for spacing
    attrKeys.forEach(key => {
      const value = formatValue(attrs[key]);
      attrNodes.push(`${key}="${value}"`);
    });
  }
  return attrNodes.join(' ');
}

/**
 * Fills in missing options with their default values.
 * 
 * @param options Options passed by user
 */
function getCompleteOptions(
  options?: Partial<CompleteXmlFormattingOptions>
): CompleteXmlFormattingOptions {
  if (options?.__isComplete) return options as CompleteXmlFormattingOptions;

  return {
    indents: options?.indents ?? 0,
    minify: options?.minify ?? false,
    spacesPerIndent: options?.spacesPerIndent ?? 2,
    writeComments: options?.writeComments ?? true,
    writeProcessingInstructions: options?.writeProcessingInstructions ?? true,
    writeXmlDeclaration: options?.writeXmlDeclaration ?? true,
    __isComplete: true
  };
}

/**
 * Creates a new options objects that is a clone with overrides.
 * 
 * @param options Options to clone
 * @param override Object of overrides
 */
function cloneOptionsWithOverrides(
  options: CompleteXmlFormattingOptions,
  override: XmlFormattingOptions
): CompleteXmlFormattingOptions {
  const clone: CompleteXmlFormattingOptions = { ...options };
  for (const prop in override) clone[prop] = override[prop];
  return clone;
}

/**
 * Returns a string with the number of spaces to use for the current indentation
 * level.
 * 
 * @param options Complete user options
 */
function getSpaces(options: CompleteXmlFormattingOptions): string {
  return options.minify
    ? ""
    : " ".repeat(options.indents * options.spacesPerIndent);
}

/**
 * Returns true if the child should be written with the given options, false if
 * it shouldn't be.
 * 
 * @param child Child node in question
 * @param options Complete user options
 */
function shouldWriteChild(
  child: XmlNode,
  options: CompleteXmlFormattingOptions
): boolean {
  if (child instanceof XmlWrapperNode) {
    return options.writeProcessingInstructions;
  } else if (child instanceof XmlCommentNode) {
    return options.writeComments;
  } else {
    return true;
  }
}

/**
 * Returns a string that is the concatenation of the given lines following the 
 * given user options.
 * 
 * @param lines Lines to join
 * @param options Complete user options
 */
function joinXmlLines(
  lines: string[],
  options: CompleteXmlFormattingOptions
): string {
  return lines.join(options.minify ? "" : "\n");
}

//#endregion Helpers
