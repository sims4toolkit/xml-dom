import { expect } from "chai";
import { XmlElementNode, XmlValueNode, XmlCommentNode } from "../dst/xml";

describe('XmlElementNode', function () {
  const newNode = (tag = "T") => new XmlElementNode({ tag });

  describe('#constructor', function () {
    it('should throw when no tag is given', function () {
      //@ts-expect-error
      expect(() => new XmlElementNode()).to.throw();
    });

    it('should throw when tag is an empty string', function () {
      expect(() => new XmlElementNode({ tag: '' })).to.throw();
    });

    it('should create a new node with just a tag', function () {
      expect(new XmlElementNode({ tag: 'T' })).to.not.be.undefined;
    });

    it('should create a new node with all of the given values', function () {
      const node = new XmlElementNode({
        tag: 'L',
        attributes: { n: "list" },
        children: [new XmlValueNode(15)]
      });

      expect(node.tag).to.equal('L');
      expect(node.name).to.equal('list');
      expect(node.children).to.be.an('Array').with.lengthOf(1);
      expect(node.child.value).to.equal(15);
    });
  });

  describe('#attributes', function () {
    it('should not be assignable', function () {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.attributes = { n: "name" }).to.throw();
    });

    it('should not be undefined when there are no attributes', function () {
      const node = newNode();
      expect(node.attributes).to.not.be.undefined;
    });

    it('should allow mutation', function () {
      const node = new XmlElementNode({
        tag: 'T',
        attributes: { n: "name", t: "enabled" }
      });

      expect(node.attributes.t).to.equal("enabled");
      node.attributes.t = "disabled";
      expect(node.attributes.t).to.equal("disabled");
    });
  });

  describe('#child', function () {
    it('should be undefined if there are no children', function () {
      const node = newNode();
      expect(node.child).to.be.undefined;
    });

    it('should be the same as the first child', function () {
      const node = newNode();
      node.addChildren(new XmlValueNode("hello"));
      expect(node.child.value).to.equal("hello");
    });

    it('should update the first child when set', function () {
      const node = newNode();
      node.addChildren(new XmlValueNode("hello"));
      expect(node.child.value).to.equal("hello");
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
    it('should throw when trying to set', function () {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.children = [newNode()]).to.throw();
    });

    it('should be an empty array if there are no children', function () {
      const node = newNode();
      expect(node.children).to.be.an('Array').that.is.empty;
    });

    it('should contain all of this node\'s children', function () {
      const node = newNode();
      node.addChildren(new XmlValueNode(1), new XmlValueNode(2));
      expect(node.children.length).to.equal(2);
      expect(node.children[0].value).to.equal(1);
      expect(node.children[1].value).to.equal(2);
    });
  });

  describe('#hasChildren', function () {
    it('should not be assignable', function () {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.children = [newNode()]).to.throw();
    });

    it('should return true when it has children', function () {
      const node = newNode();
      node.addChildren(newNode());
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
    it('should return undefined if there is no `s` attribute', function () {
      const node = newNode();
      expect(node.id).to.be.undefined;
    });

    it('should return the value of the `s` attribute', function () {
      const node = new XmlElementNode({
        tag: 'I',
        attributes: { s: 123n }
      });

      expect(node.id).to.equal(123n)
    });

    it('should change the value of the `s` attribute', function () {
      const node = newNode();
      expect(node.id).to.be.undefined;
      node.id = 123n;
      expect(node.id).to.equal(123n)
    });
  });

  describe('#innerValue', function () {
    it('should be undefined if there are no children', function () {
      const node = newNode();
      expect(node.innerValue).to.be.undefined;
    });

    it('should be undefined if the first child is an element', function () {
      const node = newNode('L');
      node.addChildren(new XmlElementNode({ tag: 'T' }));
      expect(node.innerValue).to.be.undefined;
    });

    it('should be the value of the first child if it is a value node', function () {
      const node = newNode();
      node.addChildren(new XmlValueNode(123n));
      expect(node.innerValue).to.equal(123n);
    });

    it('should be the value of the text of the first child if it is a comment', function () {
      const node = newNode();
      node.child = new XmlCommentNode("This is a comment.");
      expect(node.innerValue).to.equal("This is a comment.");
    });

    it('should throw when setting if the first child cannot have a value', function () {
      const node = newNode();
      node.addChildren(new XmlElementNode({ tag: 'T' }));
      expect(() => node.innerValue = 123n).to.throw();
    });

    it('should set the value of the first child if it can have a value', function () {
      const node = new XmlElementNode({
        tag: 'T',
        children: [new XmlValueNode(123)]
      });

      expect(node.child.value).to.equal(123);
      node.innerValue = 456;
      expect(node.child.value).to.equal(456);
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
    it('should return undefined if there is no `n` attribute', function () {
      const node = newNode();
      expect(node.id).to.be.undefined;
    });

    it('should return the value of the `n` attribute', function () {
      const node = new XmlElementNode({
        tag: 'T',
        attributes: { n: "name" }
      });

      expect(node.name).to.equal("name")
    });

    it('should change the value of the `n` attribute', function () {
      const node = newNode();
      expect(node.name).to.be.undefined;
      node.name = "name";
      expect(node.name).to.equal("name")
    });
  });

  describe('#numChildren', function () {
    it('should return 0 if there are no children', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
    });

    it('should return number of children if there are any', function () {
      const node = new XmlElementNode({
        tag: 'L',
        children: [
          new XmlCommentNode("first"),
          new XmlCommentNode("second"),
          new XmlCommentNode("third")
        ]
      });

      expect(node.numChildren).to.equal(3);
      node.addChildren(new XmlCommentNode("fourth"));
      expect(node.numChildren).to.equal(4);
    });
  });

  describe('#tag', function () {
    it('should be the tag of this node', function () {
      const node = new XmlElementNode({ tag: 'T' });
      expect(node.tag).to.equal('T');
    });

    it('should set the tag of this node', function () {
      const node = new XmlElementNode({ tag: 'T' });
      node.tag = 'L';
      expect(node.tag).to.equal('L');
    });
  });

  describe('#type', function () {
    it('should return undefined if there is no `t` attribute', function () {
      const node = newNode();
      expect(node.type).to.be.undefined;
    });

    it('should return the value of the `t` attribute', function () {
      const node = new XmlElementNode({ tag: 'T', attributes: { t: "enabled" } });
      expect(node.type).to.equal("enabled")
    });

    it('should change the value of the `t` attribute', function () {
      const node = new XmlElementNode({ tag: 'V', attributes: { t: "disabled" } });
      expect(node.type).to.equal("disabled")
      node.type = "enabled";
      expect(node.type).to.equal("enabled")
    });
  });

  describe('#value', function () {
    it('should be undefined', function () {
      const node = newNode();
      expect(node.value).to.be.undefined;
    });

    it('should throw when setting', function () {
      const node = newNode();
      expect(() => node.value = 1).to.throw();
    });
  });

  describe('#addChildren()', function () {
    it('should do nothing when no children are given', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren();
      expect(node.numChildren).to.equal(0);
    });

    it('should add the one child that is given', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren(new XmlValueNode("hi"));
      expect(node.numChildren).to.equal(1);
      expect(node.children[0].value).to.equal("hi");
    });

    it('should add all children that are given', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren(new XmlValueNode("hi"), new XmlValueNode("bye"));
      expect(node.numChildren).to.equal(2);
      expect(node.children[0].value).to.equal("hi");
      expect(node.children[1].value).to.equal("bye");
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

    it('should add the one child that is given', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addClones(new XmlValueNode("hi"));
      expect(node.numChildren).to.equal(1);
      expect(node.children[0].value).to.equal("hi");
    });

    it('should add all children that are given', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addClones(new XmlValueNode("hi"), new XmlValueNode("bye"));
      expect(node.numChildren).to.equal(2);
      expect(node.children[0].value).to.equal("hi");
      expect(node.children[1].value).to.equal("bye");
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

    it('should return a new document node with all children', function () {
      const node = newNode();
      node.addChildren(new XmlValueNode(5), new XmlCommentNode("hi"));
      expect(node.numChildren).to.equal(2);
      const clone = node.clone();
      expect(clone.numChildren).to.equal(2);
      expect(clone.children[0].value).to.equal(5);
      expect(clone.children[1].value).to.equal("hi");
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
      const node = newNode();
      node.addChildren(new XmlValueNode(5));
      const clone = node.clone();
      expect(node.innerValue).to.equal(5);
      expect(clone.innerValue).to.equal(5);
      clone.innerValue = 10;
      expect(node.innerValue).to.equal(5);
      expect(clone.innerValue).to.equal(10);
    });
  });

  describe('#deepSort()', function () {
    it("should sort childrens' children", function () {
      const node = new XmlElementNode({
        tag: 'U',
        children: [
          new XmlElementNode({
            tag: 'L',
            attributes: { n: "list_b" },
            children: [
              new XmlElementNode({ tag: 'T', attributes: { n: "b" } }),
              new XmlElementNode({ tag: 'T', attributes: { n: "a" } }),
              new XmlElementNode({ tag: 'T', attributes: { n: "c" } })
            ]
          }),
          new XmlElementNode({
            tag: 'L',
            attributes: { n: "list_a" },
            children: [
              new XmlElementNode({ tag: 'T', attributes: { n: "b" } }),
              new XmlElementNode({ tag: 'T', attributes: { n: "a" } }),
              new XmlElementNode({ tag: 'T', attributes: { n: "c" } })
            ]
          })
        ]
      });

      node.deepSort();
      const [first, second] = node.children;
      expect(first.name).to.equal("list_a");
      expect(first.children[0].name).to.equal("a");
      expect(first.children[1].name).to.equal("b");
      expect(first.children[2].name).to.equal("c");
      expect(second.name).to.equal("list_b");
      expect(second.children[0].name).to.equal("a");
      expect(second.children[1].name).to.equal("b");
      expect(second.children[2].name).to.equal("c");
    });
  });

  describe("#findChild()", () => {
    it("should return undefined if the child doesn't exist", () => {
      const node = new XmlElementNode({
        tag: "U",
        children: [
          new XmlElementNode({
            tag: "T",
            attributes: { n: "first" },
          }),
          new XmlElementNode({
            tag: "E",
            attributes: { n: "second" }
          })
        ]
      });

      expect(node.findChild("third")).to.be.undefined;
    });

    it("should return the first child with the given name", () => {
      const node = new XmlElementNode({
        tag: "U",
        children: [
          new XmlElementNode({
            tag: "T",
            attributes: { n: "first" },
          }),
          new XmlElementNode({
            tag: "E",
            attributes: { n: "second" }
          })
        ]
      });

      expect(node.findChild("first").tag).to.equal("T");
      expect(node.findChild("second").tag).to.equal("E");
    });
  });

  describe('#sort()', function () {
    it('should sort in alphabetical order by name if no fn passed in', function () {
      const node = new XmlElementNode({
        tag: "L",
        children: [
          new XmlElementNode({ tag: 'T', attributes: { n: "c" } }),
          new XmlElementNode({ tag: 'T', attributes: { n: "a" } }),
          new XmlElementNode({ tag: 'T', attributes: { n: "d" } }),
          new XmlElementNode({ tag: 'T', attributes: { n: "b" } })
        ]
      });

      node.sort();
      expect(node.children[0].name).to.equal('a');
      expect(node.children[1].name).to.equal('b');
      expect(node.children[2].name).to.equal('c');
      expect(node.children[3].name).to.equal('d');
    });

    it('should sort children according to the given function', function () {
      const node = new XmlElementNode({
        tag: "L",
        children: [
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
        ]
      });

      node.sort((a, b) => (a.innerValue as number) - (b.innerValue as number));
      expect(node.children[0].name).to.equal('one');
      expect(node.children[1].name).to.equal('five');
      expect(node.children[2].name).to.equal('ten');
    });

    it("should not change the order of childrens' children", function () {
      const node = new XmlElementNode({
        tag: "L",
        children: [
          new XmlElementNode({
            tag: 'L',
            attributes: { n: "list" },
            children: [
              new XmlElementNode({ tag: 'T', attributes: { n: "b" } }),
              new XmlElementNode({ tag: 'T', attributes: { n: "a" } }),
              new XmlElementNode({ tag: 'T', attributes: { n: "c" } })
            ]
          })
        ]
      });

      node.sort();
      expect(node.child.children[0].name).to.equal("b");
      expect(node.child.children[1].name).to.equal("a");
      expect(node.child.children[2].name).to.equal("c");
    });

    it("should not do anything when no children have names", function () {
      const node = new XmlElementNode({
        tag: "L",
        children: [
          new XmlElementNode({ tag: "T" }),
          new XmlElementNode({ tag: "L" }),
          new XmlElementNode({ tag: "U" })
        ]
      });

      node.sort();
      expect(node.children[0].tag).to.equal("T");
      expect(node.children[1].tag).to.equal("L");
      expect(node.children[2].tag).to.equal("U");
    });
  });

  describe('#toXml()', function () {
    it('should not indent by default', function () {
      const node = newNode();
      expect(node.toXml()).to.equal(`<T/>`);
    });

    it('should use two spaces by default', function () {
      const node = newNode();
      expect(node.toXml({ indents: 1 })).to.equal(`  <T/>`);
    });

    it('should use the given number of spaces', function () {
      const node = newNode();
      expect(node.toXml({
        indents: 1,
        spacesPerIndent: 4
      })).to.equal(`    <T/>`);
    });

    it('should write attributes when there are children', function () {
      const node = new XmlElementNode({
        tag: 'T',
        attributes: { n: "something" },
        children: [new XmlValueNode(50)]
      });

      expect(node.toXml()).to.equal(`<T n="something">50</T>`);
    });

    it('should write attributes when there are no children', function () {
      const node = new XmlElementNode({
        tag: 'T',
        attributes: { n: "something" }
      });

      expect(node.toXml()).to.equal(`<T n="something"/>`);
    });

    it('should write open/close tags if there are children', function () {
      const node = new XmlElementNode({
        tag: 'T',
        children: [new XmlValueNode(50)]
      });

      expect(node.toXml()).to.equal(`<T>50</T>`);
    });

    it('should write one tag if there are no children', function () {
      const node = new XmlElementNode({
        tag: 'T'
      });

      expect(node.toXml()).to.equal(`<T/>`);
    });

    it('should be on one line if there is one value child', function () {
      const node = new XmlElementNode({
        tag: 'T',
        children: [new XmlValueNode(50)]
      });

      expect(node.toXml()).to.equal(`<T>50</T>`);
    });

    it('should be on one line if there are two value/comment children', function () {
      const node = new XmlElementNode({
        tag: 'T',
        children: [new XmlValueNode(50), new XmlCommentNode("hi")]
      });

      expect(node.toXml()).to.equal(`<T>50<!--hi--></T>`);
    });

    it('should put an element child on its own line, indented', function () {
      const node = new XmlElementNode({
        tag: 'L',
        children: [
          new XmlElementNode({
            tag: 'T',
            children: [
              new XmlValueNode(123)
            ]
          })
        ]
      });

      expect(node.toXml()).to.equal(`<L>\n  <T>123</T>\n</L>`);
    });

    it('should increase indentation by 1 for each recursive call', function () {
      const node = new XmlElementNode({
        tag: 'L',
        children: [
          new XmlElementNode({
            tag: 'U',
            children: [
              new XmlElementNode({
                tag: 'T',
                attributes: { n: 'first' },
                children: [new XmlValueNode(123)]
              }),
              new XmlElementNode({
                tag: 'T',
                attributes: { n: 'second' },
                children: [new XmlValueNode(456)]
              })
            ]
          })
        ]
      });

      expect(node.toXml()).to.equal(`<L>
  <U>
    <T n="first">123</T>
    <T n="second">456</T>
  </U>
</L>`);
    });
  });
});