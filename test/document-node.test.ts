import { expect } from "chai";
import { XmlNode, XmlWrapperNode } from "../dst/xml";
import { XmlDocumentNode, XmlElementNode, XmlValueNode, XmlCommentNode } from "../dst/xml";

describe('XmlDocumentNode', function () {
  const newNode = (root?: XmlNode) => new XmlDocumentNode(root);

  describe('#constructor', function () {
    it('should not throw when no children are given', function () {
      expect(() => new XmlDocumentNode()).to.not.throw();
    });

    it('should add the root that is given', function () {
      const node = new XmlDocumentNode(new XmlValueNode(5));
      expect(node.numChildren).to.equal(1);
      expect(node.child.value).to.equal(5);
    });

    it("should use the XML declaration that is provided", () => {
      const doc = new XmlDocumentNode(undefined, {
        declaration: {
          version: "2.0",
          something: "idk"
        }
      });

      expect(doc.declaration).to.be.an("Object");
      expect(doc.declaration.version).to.equal("2.0");
      expect(doc.declaration.something).to.equal("idk");
      expect(doc.declaration.encoding).to.be.undefined;
    });

    it("should use the default XML declaration if there isn't one", () => {
      const doc = new XmlDocumentNode();
      expect(doc.declaration).to.be.an("Object");
      expect(doc.declaration.version).to.equal("1.0");
      expect(doc.declaration.encoding).to.equal("utf-8");
    });
  });

  describe('#from()', function () {
    it('should throw if the given XML contains multiple nodes at the root', function () {
      expect(() => XmlDocumentNode.from(`<T/><T/>`)).to.throw();
    });

    it('should not throw for multiple roots if told not to', function () {
      const doc = XmlDocumentNode.from(`<T/><T/>`, {
        allowMultipleRoots: true
      });

      expect(doc.numChildren).to.equal(2);
    });

    it('should parse comments', function () {
      const doc = XmlDocumentNode.from(`<!--This is a comment-->`);
      expect(doc.numChildren).to.equal(1);
      expect(doc.child.value).to.equal("This is a comment");
    });

    it('should not parse comments if told to ignore them', function () {
      const doc = XmlDocumentNode.from(`<T>50<!--This is a comment--></T>`, { ignoreComments: true });
      expect(doc.numChildren).to.equal(1);
      expect(doc.child.numChildren).to.equal(1);
      expect(doc.child.innerValue).to.equal("50");
    });

    it('should parse number values as strings', function () {
      const doc = XmlDocumentNode.from(`<T>50</T>`);
      expect(doc.child.innerValue).to.equal("50");
    });

    it('should parse boolean values as strings', function () {
      const doc = XmlDocumentNode.from(`<T>True</T>`);
      expect(doc.child.innerValue).to.equal("True");
    });

    it('should parse strings', function () {
      const doc = XmlDocumentNode.from(`<T>something</T>`);
      expect(doc.child.innerValue).to.equal("something");
    });

    it('should parse nodes that contain other nodes', function () {
      const doc = XmlDocumentNode.from(`<I>
        <L>
          <T>foo</T>
          <T>bar</T>
        </L>
      </I>`);

      expect(doc.numChildren).to.equal(1);
      expect(doc.child.numChildren).to.equal(1);
      const list = doc.child.child;
      expect(list.children[0].innerValue).to.equal("foo");
      expect(list.children[1].innerValue).to.equal("bar");
    });

    it('should parse attributes', function () {
      const doc = XmlDocumentNode.from(`<M n="module" s="12345">
        <C n="Class">
          <T n="TUNABLE">50</T>
          <V n="VARIANT" t="disabled"/>
        </C>
      </M>`);

      const mod = doc.child;
      expect(mod.name).to.equal("module");
      expect(mod.id).to.equal("12345");
      const cls = mod.child;
      expect(cls.name).to.equal("Class");
      const [tunable, variant] = cls.children;
      expect(tunable.name).to.equal("TUNABLE");
      expect(variant.name).to.equal("VARIANT");
      expect(variant.type).to.equal("disabled");
    });

    it('should parse tags', function () {
      const doc = XmlDocumentNode.from(`<M n="module" s="12345">
        <C n="Class">
          <T n="TUNABLE">50</T>
          <V n="VARIANT" t="disabled"/>
        </C>
      </M>`);

      const mod = doc.child;
      expect(mod.tag).to.equal("M");
      const cls = mod.child;
      expect(cls.tag).to.equal("C");
      const [tunable, variant] = cls.children;
      expect(tunable.tag).to.equal("T");
      expect(variant.tag).to.equal("V");
    });

    it('should preserve order of nodes', function () {
      const doc = XmlDocumentNode.from(`<L>
        <T>5</T>
        <T>3</T>
        <T>1</T>
        <T>4</T>
        <T>2</T>
      </L>`);

      expect(doc.child.children[0].innerValue).to.equal("5");
      expect(doc.child.children[1].innerValue).to.equal("3");
      expect(doc.child.children[2].innerValue).to.equal("1");
      expect(doc.child.children[3].innerValue).to.equal("4");
      expect(doc.child.children[4].innerValue).to.equal("2");
    });

    it('should be able to parse a document with an XML declaration', function () {
      const dom = XmlDocumentNode.from(`<?xml version="1.0" encoding="utf-8"?>\n<I n="some_file"/>`);
      expect(dom.numChildren).to.equal(1);
      expect(dom.child.tag).to.equal("I");
    });

    it("should parse the XML declaration that is provided", () => {
      const xml = `<?xml version="2.0" something="idk"?><L><T>12345</T></L>`;
      const doc = XmlDocumentNode.from(xml);
      expect(doc.declaration).to.be.an("Object");
      expect(doc.declaration.version).to.equal("2.0");
      expect(doc.declaration.something).to.equal("idk");
      expect(doc.declaration.encoding).to.be.undefined;
    });

    it("should use the default XML declaration if there isn't one", () => {
      const xml = `<L><T>12345</T></L>`;
      const doc = XmlDocumentNode.from(xml);
      expect(doc.declaration).to.be.an("Object");
      expect(doc.declaration.version).to.equal("1.0");
      expect(doc.declaration.encoding).to.equal("utf-8");
    });

    context("has no PI tags", () => {
      it("should ignore PI tag that is in a comment", () => {
        const xml = `<!-- <?ignore <T>50</T> ?> -->`;
        const doc = XmlDocumentNode.from(xml);
        expect(doc.numChildren).to.equal(1);
        expect(doc.child.value).to.equal(" <?ignore <T>50</T> ?> ");
      });

      it("should ignore opening PI tag that is in a string", () => {
        const xml = `<T n="<?">50</T>`;
        const doc = XmlDocumentNode.from(xml);
        expect(doc.numChildren).to.equal(1);
        expect(doc.child.name).to.equal("<?");
        expect(doc.child.innerValue).to.equal("50");
      });

      it("should ignore closing PI tag that is in a string", () => {
        const xml = `<T n="?>">50</T>`;
        const doc = XmlDocumentNode.from(xml);
        expect(doc.numChildren).to.equal(1);
        expect(doc.child.name).to.equal("?>");
        expect(doc.child.innerValue).to.equal("50");
      });

      it("should ignore complete PI tag that is in a string", () => {
        const xml = `<T n="<?ignore?>">50</T>`;
        const doc = XmlDocumentNode.from(xml);
        expect(doc.numChildren).to.equal(1);
        expect(doc.child.name).to.equal("<?ignore?>");
        expect(doc.child.innerValue).to.equal("50");
      });
    });

    context("has at least one PI tag", () => {
      it("should ignore PI tags if instructed to", () => {
        const xml = `<L>
          <?ignore
            <T>FIRST</T>
            <T>SECOND</T>
          ?>
          <T>THIRD</T>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml, {
          ignoreProcessingInstructions: true
        });

        expect(doc.child.numChildren).to.equal(2);
        expect(doc.child.children[0].innerValue).to.equal("THIRD");
        expect(doc.child.children[1].innerValue).to.equal("FOURTH");
      });

      it("should parse PI tags with attributes only", () => {
        const xml = `<L>
          <?ignore first="abc" second="def" ?>
          <T>THIRD</T>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(3);

        const wrapper = doc.child.child;
        expect(wrapper.innerValue).to.equal(`first="abc" second="def"`);
      });

      it("should parse PI tags with plain text", () => {
        const xml = `<L>
          <?ignore this is plain text ?>
          <T>THIRD</T>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(3);

        const wrapper = doc.child.child;
        expect(wrapper.innerValue).to.equal(`this is plain text`);
      });

      it("should parse PI tags with no content", () => {
        const xml = `<L>
          <?ignore?>
          <T>THIRD</T>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(3);

        const wrapper = doc.child.child;
        expect(wrapper.numChildren).to.equal(0);
      });

      it("should parse PI tags with XML content", () => {
        const xml = `<L>
          <?ignore
            <T>FIRST</T>
            <T>SECOND</T>
          ?>
          <T>THIRD</T>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(3);
        expect(doc.child.children[1].innerValue).to.equal("THIRD");
        expect(doc.child.children[2].innerValue).to.equal("FOURTH");

        const wrapped = doc.child.child;
        expect(wrapped.numChildren).to.equal(2);
        expect(wrapped.children[0].innerValue).to.equal("FIRST");
        expect(wrapped.children[1].innerValue).to.equal("SECOND");
      });

      it("should parse PI tags with comment", () => {
        const xml = `<L>
          <?ignore <!--Something--> ?>
          <T>THIRD</T>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(3);

        const wrapper = doc.child.child;
        expect(wrapper.innerValue).to.equal(`Something`);
      });

      it("should parse multiple PI tags of same type", () => {
        const xml = `<L>
          <?ignore <T>FIRST</T> ?>
          <T>SECOND</T>
          <?ignore <T>THIRD</T> ?>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(4);
        expect(doc.child.children[0].tag).to.equal("ignore");
        expect(doc.child.children[2].tag).to.equal("ignore");
      });

      it("should parse multiple PI tags of different types", () => {
        const xml = `<L>
          <?ignore <T>FIRST</T> ?>
          <T>SECOND</T>
          <?something_random <T>THIRD</T> ?>
          <T>FOURTH</T>
        </L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(4);
        expect(doc.child.children[0].tag).to.equal("ignore");
        expect(doc.child.children[2].tag).to.equal("something_random");
      });

      it("should ignore opening PI tag that is in a comment", () => {
        const xml = `<L>
  <?ignore
    <T>FIRST</T>
  ?>
  <T>SECOND</T>
  <!-- <?ignore -->
</L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(3);
        expect(doc.child.child.numChildren).to.equal(1);
        expect(doc.toXml({ writeXmlDeclaration: false })).to.equal(xml);
      });

      it("should ignore opening PI tag that is in a nested comment", () => {
        const xml = `<L>
  <?ignore
    <T>FIRST</T>
    <!-- <?ignore -->
  ?>
  <T>SECOND</T>
</L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(2);
        expect(doc.child.child.numChildren).to.equal(2);
        expect(doc.toXml({ writeXmlDeclaration: false })).to.equal(xml);
      });

      it("should ignore opening PI tag that is in a string", () => {
        const xml = `<L>
  <?ignore
    <T>FIRST</T>
  ?>
  <T n="<?ignore">SECOND</T>
</L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(2);
        expect(doc.child.child.numChildren).to.equal(1);
        expect(doc.toXml({ writeXmlDeclaration: false })).to.equal(xml);
      });

      it("should ignore opening PI tag that is in a nested string", () => {
        const xml = `<L>
  <?ignore
    <T n="<?ignore">FIRST</T>
  ?>
  <T>SECOND</T>
</L>`;

        const doc = XmlDocumentNode.from(xml);
        expect(doc.child.numChildren).to.equal(2);
        expect(doc.child.child.numChildren).to.equal(1);
        expect(doc.child.child.child.name).to.equal("<?ignore");
        expect(doc.toXml({ writeXmlDeclaration: false })).to.equal(xml);
      });
    });
  });

  describe('#attributes', function () {
    it('should not be assignable', function () {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.attributes = { n: "name" }).to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.attributes).to.be.undefined;
    });
  });

  describe('#child', function () {
    it('should be undefined if there are no children', function () {
      const node = newNode();
      expect(node.child).to.be.undefined;
    });

    it('should be the same as the first child', function () {
      const node = newNode(new XmlValueNode("hello"));
      expect(node.child.value).to.equal("hello");
    });

    it('should update the first child when set', function () {
      const node = newNode(new XmlValueNode("hello"));
      node.child = new XmlValueNode("new text");
      expect(node.child.value).to.equal("new text");
    });

    it('should add a child if there are none', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.child = new XmlValueNode("new text");
      expect(node.numChildren).to.equal(1);
      expect(node.child.value).to.equal("new text");
    });
  });

  describe('#children', function () {
    it('should not be assignable', function () {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.children = [new XmlCommentNode("hi")]).to.throw();
    });

    it('should be an empty array if there are no children', function () {
      const node = newNode();
      expect(node.children).to.be.an('Array').that.is.empty;
    });

    it('should contain the root node', function () {
      const node = newNode(new XmlValueNode(1));
      expect(node.children.length).to.equal(1);
      expect(node.children[0].value).to.equal(1);
    });

    it('should allow you to push without throwing', function () {
      const node = newNode();
      node.children.push(new XmlValueNode("hi"), new XmlValueNode("bye"));
      expect(node.numChildren).to.equal(2);
    });
  });

  describe("#declaration", () => {
    it("should throw when assigned", () => {
      const doc = new XmlDocumentNode();
      //@ts-expect-error
      expect(() => doc.declaration = {}).to.throw();
    });

    it("should mutate the declaration", () => {
      const doc = new XmlDocumentNode();
      expect(doc.declaration.version).to.equal("1.0");
      doc.declaration.version = "2.0";
      expect(doc.declaration.version).to.equal("2.0");
    });
  });

  describe('#hasChildren', function () {
    it('should not be assignable', function () {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.hasChildren = false).to.throw();
    });

    it('should return true when it has children', function () {
      const node = newNode(newNode());
      expect(node.hasChildren).to.be.true;
    });

    it('should return true when it does not have children', function () {
      // this test is not a typo, the hasChildren getter returns if there is
      // a children ARRAY -- it does not have to have any items in it
      const node = newNode();
      expect(node.hasChildren).to.be.true;
    });
  });

  describe('#id', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.id = 123).to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.id).to.be.undefined;
    });
  });

  describe('#innerValue', function () {
    it('should be undefined if there are no children', function () {
      const node = newNode();
      expect(node.innerValue).to.be.undefined;
    });

    it('should be undefined if the first child is an element', function () {
      const node = newNode(new XmlElementNode({ tag: 'I' }));
      expect(node.innerValue).to.be.undefined;
    });

    it('should be the value of the first child if it is a value node', function () {
      const node = newNode(new XmlValueNode(123n));
      expect(node.innerValue).to.equal(123n);
    });

    it('should be the value of the text of the first child if it is a comment', function () {
      const node = newNode(new XmlCommentNode("This is a comment."));
      expect(node.innerValue).to.equal("This is a comment.");
    });

    it('should throw when setting if the first child cannot have a value', function () {
      const node = newNode(new XmlElementNode({ tag: 'I' }));
      expect(() => node.innerValue = 123n).to.throw();
    });

    it('should set the value of the first child if it can have a value', function () {
      const child = new XmlValueNode(123n);
      const node = newNode(child);
      node.innerValue = 456n;
      expect(child.value).to.equal(456n);
    });

    it('should create a new value node child if there are no children', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.innerValue = 123n;
      expect(node.numChildren).to.equal(1);
      expect(node.child.value).to.equal(123n);
    });
  });

  describe('#name', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.name = "name").to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.name).to.be.undefined;
    });
  });

  describe('#numChildren', function () {
    it('should not be assignable', function () {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.numChildren = 5).to.throw();
    });

    it('should return 0 when there are no children', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
    });

    it('should return 1 when there is one root', function () {
      const node = newNode(new XmlValueNode(123n));
      expect(node.numChildren).to.equal(1);
    });
  });

  describe('#tag', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.tag = "T").to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.tag).to.be.undefined;
    });
  });

  describe('#type', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.type = "enabled").to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.type).to.be.undefined;
    });
  });

  describe('#value', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.value = "test").to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.value).to.be.undefined;
    });
  });

  describe('#addChildren()', function () {
    it('should do nothing when no children are given', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren();
      expect(node.numChildren).to.equal(0);
    });

    it('should add the one child that is given if the node is empty', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren(new XmlValueNode("hi"));
      expect(node.numChildren).to.equal(1);
      expect(node.children[0].value).to.equal("hi");
    });

    it('should throw if given more than one child', function () {
      const node = newNode();
      expect(() => node.addChildren(new XmlValueNode("hi"), new XmlValueNode("bye"))).to.throw();
    });

    it('should throw if there is already a child', function () {
      const node = newNode(new XmlValueNode("hi"));
      expect(() => node.addChildren(new XmlValueNode("bye"))).to.throw();
    });

    it('should mutate the original children', function () {
      const node = newNode();
      const child = new XmlValueNode(123n);
      node.addChildren(child);
      node.innerValue = 456n;
      expect(child.value).to.equal(456n);
    });
  });

  describe('#addClones()', function () {
    it('should do nothing when no children are given', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addClones();
      expect(node.numChildren).to.equal(0);
    });

    it('should add the one child that is given if there are none', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addClones(new XmlValueNode("hi"));
      expect(node.numChildren).to.equal(1);
      expect(node.children[0].value).to.equal("hi");
    });

    it('should throw if more than one child is given', function () {
      const node = newNode();
      expect(() => node.addClones(new XmlValueNode("hi"), new XmlValueNode("bye"))).to.throw();
    });

    it('should throw if there is already a child', function () {
      const node = newNode(new XmlValueNode("hi"));
      expect(() => node.addClones(new XmlValueNode("bye"))).to.throw();
    });

    it('should not mutate the original children', function () {
      const node = newNode();
      const child = new XmlValueNode(123n);
      node.addClones(child);
      node.innerValue = 456n;
      expect(child.value).to.equal(123n);
    });
  });

  describe('#clone()', function () {
    it('should return a new, empty document node if there are no children', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      const clone = node.clone();
      expect(clone.numChildren).to.equal(0);
    });

    it('should return a new document node with root node', function () {
      const node = newNode(new XmlValueNode(5));
      expect(node.numChildren).to.equal(1);
      const clone = node.clone();
      expect(clone.numChildren).to.equal(1);
      expect(clone.children[0].value).to.equal(5);
    });

    it('should not mutate the children array of the original', function () {
      const node = newNode();
      const clone = node.clone();
      expect(node.numChildren).to.equal(0);
      expect(clone.numChildren).to.equal(0);
      clone.innerValue = 5;
      expect(node.numChildren).to.equal(0);
      expect(clone.numChildren).to.equal(1);
    });

    it('should not mutate the individual children of the original', function () {
      const node = newNode(new XmlValueNode(5));
      const clone = node.clone();
      expect(node.innerValue).to.equal(5);
      expect(clone.innerValue).to.equal(5);
      clone.innerValue = 10;
      expect(node.innerValue).to.equal(5);
      expect(clone.innerValue).to.equal(10);
    });
  });

  describe('#deepSort()', function () {
    it("should sort child's children", function () {
      const node = newNode(
        new XmlElementNode({
          tag: 'L',
          attributes: { n: "list" },
          children: [
            new XmlElementNode({ tag: 'T', attributes: { n: "b" } }),
            new XmlElementNode({ tag: 'T', attributes: { n: "a" } }),
            new XmlElementNode({ tag: 'T', attributes: { n: "c" } })
          ]
        })
      );

      node.deepSort();
      expect(node.child.children[0].name).to.equal("a");
      expect(node.child.children[1].name).to.equal("b");
      expect(node.child.children[2].name).to.equal("c");
    });

    it("should pass its function onto its children", function () {
      const node = newNode(
        new XmlElementNode({
          tag: 'L',
          attributes: { n: "list" },
          children: [
            new XmlElementNode({ tag: 'T', attributes: { x: "b" } }),
            new XmlElementNode({ tag: 'T', attributes: { x: "a" } }),
            new XmlElementNode({ tag: 'T', attributes: { x: "c" } })
          ]
        })
      );

      node.deepSort((a, b) => {
        const aName = a.attributes.x;
        const bName = b.attributes.x;
        if (aName) {
          if (bName) {
            if (aName < bName) return -1;
            if (aName > bName) return 1;
            return 0;
          }
          return -1;
        }
        return bName ? 1 : 0;
      });

      expect(node.child.children[0].attributes.x).to.equal("a");
      expect(node.child.children[1].attributes.x).to.equal("b");
      expect(node.child.children[2].attributes.x).to.equal("c");
    });
  });

  describe("#findChild()", () => {
    it("should return undefined", () => {
      const node = newNode();
      expect(node.findChild("name")).to.be.undefined;
    });
  });

  describe('#sort()', function () {
    it('should sort in alphabetical order by name if no fn passed in', function () {
      const node = newNode();
      node.children.push(
        new XmlElementNode({ tag: 'T', attributes: { n: "c" } }),
        new XmlElementNode({ tag: 'T', attributes: { n: "a" } }),
        new XmlElementNode({ tag: 'T', attributes: { n: "d" } }),
        new XmlElementNode({ tag: 'T', attributes: { n: "b" } })
      );

      node.sort();
      expect(node.children[0].name).to.equal('a');
      expect(node.children[1].name).to.equal('b');
      expect(node.children[2].name).to.equal('c');
      expect(node.children[3].name).to.equal('d');
    });

    it('should sort children according to the given function', function () {
      const node = newNode();
      node.children.push(
        new XmlElementNode({
          tag: 'T',
          attributes: { n: "ten" },
          children: [new XmlValueNode(10)]
        }),
        new XmlElementNode({
          tag: 'T',
          attributes: { n: "one" },
          children: [new XmlValueNode(1)]
        }),
        new XmlElementNode({
          tag: 'T',
          attributes: { n: "five" },
          children: [new XmlValueNode(5)]
        })
      );

      node.sort((a, b) => (a.innerValue as number) - (b.innerValue as number));
      expect(node.children[0].name).to.equal('one');
      expect(node.children[1].name).to.equal('five');
      expect(node.children[2].name).to.equal('ten');
    });

    it("should not change the order of childrens' children", function () {
      const node = newNode(
        new XmlElementNode({
          tag: 'L',
          attributes: { n: "list" },
          children: [
            new XmlElementNode({ tag: 'T', attributes: { n: "b" } }),
            new XmlElementNode({ tag: 'T', attributes: { n: "a" } }),
            new XmlElementNode({ tag: 'T', attributes: { n: "c" } })
          ]
        })
      );

      node.sort();
      expect(node.child.children[0].name).to.equal("b");
      expect(node.child.children[1].name).to.equal("a");
      expect(node.child.children[2].name).to.equal("c");
    });
  });

  describe('#toXml()', function () {
    const XML_DECLARATION = '<?xml version="1.0" encoding="utf-8"?>';

    it('should use the XML declaration by default', function () {
      const node = newNode();
      expect(node.toXml()).to.equal(XML_DECLARATION);
    });

    it('should use the XML declaration if given true', function () {
      const node = newNode();
      expect(node.toXml({ writeXmlDeclaration: true })).to.equal(XML_DECLARATION);
    });

    it('should not use the XML declaration if given false', function () {
      const node = newNode();
      expect(node.toXml({ writeXmlDeclaration: false })).to.equal("");
    });

    it('should not indent if the given number is 0', function () {
      const node = newNode();
      expect(node.toXml()).to.equal(XML_DECLARATION);
    });

    it('should use a default indentation of 2 spaces', function () {
      const node = newNode();
      expect(node.toXml({ indents: 1 })).to.equal(`  ${XML_DECLARATION}`);
    });

    it('should use the number of spaces that are provided', function () {
      const node = newNode();
      expect(node.toXml({
        indents: 1,
        spacesPerIndent: 4
      })).to.equal(`    ${XML_DECLARATION}`);
    });

    it('should just return an XML declaration when there are no children', function () {
      const node = newNode();
      expect(node.toXml()).to.equal(XML_DECLARATION);
    });

    it('should write root on its own line', function () {
      const node = newNode(
        new XmlElementNode({
          tag: 'M',
          attributes: {
            n: "module.name",
            s: 12345n
          },
          children: [
            new XmlElementNode({
              tag: 'C',
              attributes: { n: "ClassName" },
              children: [
                new XmlElementNode({
                  tag: 'T',
                  attributes: { n: "SOMETHING" },
                  children: [new XmlValueNode(10)]
                })
              ]
            })
          ]
        })
      );

      expect(node.toXml()).to.equal(`${XML_DECLARATION}
<M n="module.name" s="12345">
  <C n="ClassName">
    <T n="SOMETHING">10</T>
  </C>
</M>`);
    });

    it("should write PI tags by default", () => {
      const root = new XmlElementNode({
        tag: "L",
        children: [
          new XmlWrapperNode({
            tag: "ignore",
            children: [
              new XmlElementNode({
                tag: "T",
                children: [
                  new XmlValueNode(12345)
                ]
              })
            ]
          })
        ]
      });

      const doc = new XmlDocumentNode(root);

      expect(doc.toXml()).to.equal(`${XML_DECLARATION}
<L>
  <?ignore
    <T>12345</T>
  ?>
</L>`);
    });

    it("should not write PI tags if told not to", () => {
      const root = new XmlElementNode({
        tag: "L",
        children: [
          new XmlWrapperNode({
            tag: "ignore",
            children: [
              new XmlElementNode({
                tag: "T",
                children: [
                  new XmlValueNode(12345)
                ]
              })
            ]
          })
        ]
      });

      const doc = new XmlDocumentNode(root);

      expect(doc.toXml({ writeProcessingInstructions: false })).to.equal(`${XML_DECLARATION}\n<L>\n</L>`);
    });

    it("should not write whitespace if minify = true", () => {
      const root = new XmlElementNode({
        tag: "L",
        attributes: {
          n: "some_list"
        },
        children: [
          new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode(12345),
              new XmlCommentNode("some_tuning")
            ]
          })
        ]
      });

      const doc = new XmlDocumentNode(root);

      expect(doc.toXml({ minify: true })).to.equal(`${XML_DECLARATION}<L n="some_list"><T>12345<!--some_tuning--></T></L>`);
    });

    it("should use the declaration attrs if there are any", () => {
      const root = new XmlElementNode({ tag: "T" });
      const doc = new XmlDocumentNode(root, {
        declaration: {
          version: "2.0",
          something: "idk"
        }
      });

      expect(doc.toXml()).to.equal(`<?xml version="2.0" something="idk"?>\n<T/>`);
    });

    it("should not write any comments if writeComments = false", () => {
      const root = new XmlElementNode({
        tag: "L",
        attributes: {
          n: "some_list"
        },
        children: [
          new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode(12345),
              new XmlCommentNode("some_tuning")
            ]
          })
        ]
      });

      const doc = new XmlDocumentNode(root);

      expect(doc.toXml({ writeComments: false })).to.equal(`${XML_DECLARATION}\n<L n="some_list">
  <T>12345</T>
</L>`);
    });
  });
});
