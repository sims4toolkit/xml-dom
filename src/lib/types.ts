import type { XmlNode, XmlElementNode, XmlCommentNode, XmlValueNode, XmlWrapperNode } from "./nodes";

/** Generic interface that can support any attributes. */
export type Attributes = { [key: string]: any; };

/** Non-optional version of XmlFormattingOptions. */
export interface CompleteXmlFormattingOptions extends Required<XmlFormattingOptions> {
  __isComplete: true;
}

/** An object that references a specific recycled node. */
export interface RecycledNodeRef<T extends XmlNode> {
  /** The globally unique ID for this node. */
  id: number;

  /** The actual node object. */
  node: T;

  /** The number of references there are to this node. */
  refs: number;
}

/** Object containing recyled nodes. */
export interface RecycledNodesCache {
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
   * - `<V t="type"> ... </V>` w/ id 5 => `"V&t=type&5"`
   * - `<L> ... </L>` w/ ids 5 + 10 => `"L&5,10"`
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
   * A redundant mapping of all IDs to the nodes they belong to.
   */
  idMap: Map<number, RecycledNodeRef<XmlNode>>;

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
   * - `<?ignore ... ?>` w/ id 5  => `"ignore&5"`
   * - `<?ignore ... ?>` w/ ids 5 + 10  => `"ignore&5,10"`
   */
  wrappers: Map<string, RecycledNodeRef<XmlWrapperNode>>
}

/** Options to use when reading XML from a string/buffer. */
export interface XmlParsingOptions extends Partial<{
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

/** The result of parsing XML. */
export interface XmlParsingResult {
  /**
   * The attributes to use in the XML declaration.
   */
  declaration: Attributes;

  /**
   * The child nodes of the XML document.
   */
  nodes: XmlNode[];

  /**
   * The cache that was used to recycle nodes. Guaranteed to be defined if
   * `recycleNodes = true` was true when parsing.
   */
  recylingCache?: RecycledNodesCache;
}

/** Options to use when writing a node as an XML string. */
export interface XmlFormattingOptions extends Partial<{
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
export type XmlElementFormattingOptions =
  Omit<XmlFormattingOptions, "writeXmlDeclaration">;

/** Types that may appear in a value node. */
export type XmlValue = number | bigint | boolean | string;

/** Options to use when writing a childless node as an XML string. */
export type XmlValueFormattingOptions =
  Omit<XmlElementFormattingOptions, "writeProcessingInstructions">;