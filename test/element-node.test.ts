import { expect } from "chai";
import { XmlElementNode, XmlValueNode, XmlCommentNode, XmlWrapperNode, XmlDocumentNode } from "../dst/xml";

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
    it('should be assignable', function () {
      const node = newNode();
      node.attributes = { n: "something" };
      expect(node.name).to.equal("something");
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
    it("should be settable", () => {
      const node = newNode();
      const child = new XmlCommentNode("hi");
      expect(node.children).to.be.an("Array").that.is.empty;
      node.children = [child];
      expect(node.children).to.be.an("Array").with.lengthOf(1);
      expect(node.child).to.equal(child);
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
      expect(() => node.hasChildren = false).to.throw();
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
    it('should return a new, empty node if there are no children', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      const clone = node.clone();
      expect(clone.numChildren).to.equal(0);
    });

    it('should return a new node with all children', function () {
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

  describe("#equals()", () => {
    context("other has same tag, attrs, and children", () => {
      it("should return true", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          attributes: {
            n: "some_list"
          },
          children: [
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(1)] }),
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(2)] }),
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(3)] }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          attributes: {
            n: "some_list"
          },
          children: [
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(1)] }),
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(2)] }),
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(3)] }),
          ]
        });

        expect(thisNode.equals(otherNode)).to.be.true;
      });
    });

    context("other is not an XmlElementNode", () => {
      it("should be false if other is a wrapper node with same tag & children", () => {
        const child = new XmlValueNode("test");

        const element = new XmlElementNode({
          tag: "T",
          children: [child]
        });

        const wrapper = new XmlWrapperNode({
          tag: "T",
          children: [child]
        });

        expect(element.equals(wrapper)).to.be.false;
      });

      it("should be false if other is a value node with same inner value", () => {
        const child = new XmlValueNode("test");

        const element = new XmlElementNode({
          tag: "T",
          children: [child]
        });

        expect(element.equals(child)).to.be.false;
      });

      it("should be false if other is a comment node with same inner value", () => {
        const comment = new XmlCommentNode("test");

        const element = new XmlElementNode({
          tag: "T",
          children: [comment]
        });

        expect(element.equals(comment)).to.be.false;
      });

      it("should be false if other is a document that contains this element as its root", () => {
        const root = new XmlElementNode({ tag: "T" });
        const doc = new XmlDocumentNode(root);
        expect(root.equals(doc)).to.be.false;
      });
    });

    context("other has different tag", () => {
      it("should return false", () => {
        const thisNode = new XmlElementNode({ tag: "T" });
        const otherNode = new XmlElementNode({ tag: "L" });
        expect(thisNode.equals(otherNode)).to.be.false;
      });
    });

    context("other has different attributes", () => {
      context("this has attributes, other doesn't", () => {
        it("should return true if all of this's attrs are excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({ tag: "V" });

          expect(thisNode.equals(otherNode, {
            excludeAttributes: ["n", "t"]
          })).to.be.true;
        });

        it("should return false if at least one of this's attrs are not excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({ tag: "V" });

          expect(thisNode.equals(otherNode, {
            excludeAttributes: ["n"]
          })).to.be.false;
        });

        it("should return false if no attrs are excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({ tag: "V" });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });

      context("this has no attributes, other does", () => {
        it("should return true if all of other's attrs are excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({ tag: "V" });

          expect(otherNode.equals(thisNode, {
            excludeAttributes: ["n", "t"]
          })).to.be.true;
        });

        it("should return false if at least one of other's attrs are not excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({ tag: "V" });

          expect(otherNode.equals(thisNode, {
            excludeAttributes: ["n"]
          })).to.be.false;
        });

        it("should return false if no attrs are excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({ tag: "V" });

          expect(otherNode.equals(thisNode)).to.be.false;
        });
      });

      context("this and other have the same attribute keys", () => {
        it("should return true if mismatched attrs are excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "first_variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "second_variant",
              t: "enabled"
            }
          });

          expect(thisNode.equals(otherNode, {
            excludeAttributes: ["n"]
          })).to.be.true;
        });

        it("should return false if no attrs are excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "first_variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "second_variant",
              t: "enabled"
            }
          });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });

      context("this has a subset of other's attributes", () => {
        it("should return true if the missing attr is excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({
            tag: "V",
            attributes: {
              t: "enabled"
            }
          });

          expect(thisNode.equals(otherNode, {
            excludeAttributes: ["n"]
          })).to.be.true;
        });

        it("should return false if the missing attr is not excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({
            tag: "V",
            attributes: {
              t: "enabled"
            }
          });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });

      context("other has a subset of this's attributes", () => {
        it("should return true if the missing attr is excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({
            tag: "V",
            attributes: {
              t: "enabled"
            }
          });

          expect(otherNode.equals(thisNode, {
            excludeAttributes: ["n"]
          })).to.be.true;
        });

        it("should return false if the missing attr is not excluded", () => {
          const thisNode = new XmlElementNode({
            tag: "V",
            attributes: {
              n: "variant",
              t: "enabled"
            }
          });

          const otherNode = new XmlElementNode({
            tag: "V",
            attributes: {
              t: "enabled"
            }
          });

          expect(otherNode.equals(thisNode)).to.be.false;
        });
      });
    });

    context("other has different children", () => {
      context("this has children, other doesn't", () => {
        it("should return true when not recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [new XmlValueNode("test")]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: []
          });

          expect(thisNode.equals(otherNode, {
            recursionLevels: 0
          })).to.be.true;
        });

        it("should return false when recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [new XmlValueNode("test")]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: []
          });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });

      context("this has no children, other does", () => {
        it("should return true when not recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [new XmlValueNode("test")]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: []
          });

          expect(otherNode.equals(thisNode, {
            recursionLevels: 0
          })).to.be.true;
        });

        it("should return false when recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [new XmlValueNode("test")]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: []
          });

          expect(otherNode.equals(thisNode)).to.be.false;
        });
      });

      context("this has a subset of other's children", () => {
        it("should return true when not recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first")
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second")
            ]
          });

          expect(thisNode.equals(otherNode, {
            recursionLevels: 0
          })).to.be.true;
        });

        it("should return false when recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first")
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second")
            ]
          });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });

      context("other has a subset of this's children", () => {
        it("should return true when not recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second")
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first"),
            ]
          });

          expect(thisNode.equals(otherNode, {
            recursionLevels: 0
          })).to.be.true;
        });

        it("should return false when recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second")
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode("first"),
            ]
          });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });

      context("same number of children, but they're different", () => {
        it("should return true when not recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second"),
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("third"),
              new XmlValueNode("fourth"),
            ]
          });

          expect(thisNode.equals(otherNode, {
            recursionLevels: 0
          })).to.be.true;
        });

        it("should return false when recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second"),
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("third"),
              new XmlValueNode("fourth"),
            ]
          });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });

      context("same children, different order", () => {
        it("should return true when not recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second"),
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("second"),
              new XmlValueNode("first"),
            ]
          });

          expect(thisNode.equals(otherNode, {
            recursionLevels: 0
          })).to.be.true;
        });

        it("should return false when recurring", () => {
          const thisNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("first"),
              new XmlValueNode("second"),
            ]
          });

          const otherNode = new XmlElementNode({
            tag: "L",
            children: [
              new XmlValueNode("second"),
              new XmlValueNode("first"),
            ]
          });

          expect(thisNode.equals(otherNode)).to.be.false;
        });
      });
    });

    context("excludeAttributes", () => {
      it("should not pass on when recurring to children", () => {
        const thisNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "first_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "enabled"
              }
            })
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "second_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "disabled"
              }
            })
          ]
        });

        expect(thisNode.equals(otherNode, {
          excludeAttributes: ["n"]
        })).to.be.false;
      });

      it("should not consider the listed attributes in parent", () => {
        const thisNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "first_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "enabled"
              }
            })
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "second_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "enabled"
              }
            })
          ]
        });

        expect(thisNode.equals(otherNode, {
          excludeAttributes: ["n"]
        })).to.be.true;
      });
    });

    context("excludeAttributesRecursive", () => {
      it("should pass on when recurring to children", () => {
        const thisNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "first_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "enabled"
              }
            })
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "second_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "disabled"
              }
            })
          ]
        });

        expect(thisNode.equals(otherNode, {
          excludeAttributesRecursive: ["n"]
        })).to.be.true;
      });

      it("should not consider the listed attributes in parent", () => {
        const thisNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "first_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "enabled"
              }
            })
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "V",
          attributes: {
            n: "second_variant",
            t: "enabled"
          },
          children: [
            new XmlElementNode({
              tag: "T",
              attributes: {
                n: "enabled"
              }
            })
          ]
        });

        expect(thisNode.equals(otherNode, {
          excludeAttributesRecursive: ["n"]
        })).to.be.true;
      });
    });

    context("recursionLevels", () => {
      it("should not mutate the passed in object", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlValueNode("first"),
            new XmlValueNode("second"),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlValueNode("third"),
            new XmlValueNode("fourth"),
          ]
        });

        const options = { recursionLevels: 1 };
        expect(thisNode.equals(otherNode, options)).to.be.false;
        expect(options.recursionLevels).to.equal(1);
      });

      it("should compare all descendants if not provided", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("second")
                  ]
                })
              ]
            }),
          ]
        });

        expect(thisNode.equals(otherNode)).to.be.false;
      });

      it("should not compare children if recursionLevels = 0", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "V",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        expect(thisNode.equals(otherNode, {
          recursionLevels: 0
        })).to.be.true;
      });

      it("should return true if children are equal and recursionLevels = 1", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("second")
                  ]
                })
              ]
            }),
          ]
        });

        expect(thisNode.equals(otherNode, {
          recursionLevels: 1
        })).to.be.true;
      });

      it("should return false if children aren't equal and recursionLevels = 1", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "V",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("second")
                  ]
                })
              ]
            }),
          ]
        });

        expect(thisNode.equals(otherNode, {
          recursionLevels: 1
        })).to.be.false;
      });

      it("should return true if grandchildren are equal and recursionLevels = 2", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        expect(thisNode.equals(otherNode, {
          recursionLevels: 2
        })).to.be.true;
      });

      it("should return false if grandchildren are not equal and recursionLevels = 2", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something"
                  },
                  children: [
                    new XmlValueNode("first")
                  ]
                })
              ]
            }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          children: [
            new XmlElementNode({
              tag: "U",
              children: [
                new XmlElementNode({
                  tag: "T",
                  attributes: {
                    n: "something_else"
                  },
                  children: [
                    new XmlValueNode("second")
                  ]
                })
              ]
            }),
          ]
        });

        expect(thisNode.equals(otherNode, {
          recursionLevels: 2
        })).to.be.false;
      });
    });

    context("strictTypes", () => {
      it("should be passed on to child nodes", () => {
        const thisNode = new XmlElementNode({
          tag: "L",
          attributes: {
            n: "some_list"
          },
          children: [
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(true)] }),
            new XmlElementNode({ tag: "T", children: [new XmlValueNode(123)] }),
          ]
        });

        const otherNode = new XmlElementNode({
          tag: "L",
          attributes: {
            n: "some_list"
          },
          children: [
            new XmlElementNode({ tag: "T", children: [new XmlValueNode("True")] }),
            new XmlElementNode({ tag: "T", children: [new XmlValueNode("123")] }),
          ]
        });

        expect(thisNode.equals(otherNode)).to.be.true;
        expect(thisNode.equals(otherNode, { strictTypes: false })).to.be.true;
        expect(thisNode.equals(otherNode, { strictTypes: true })).to.be.false;
      });
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

    it('should not be on one line if at least one child is an element', function () {
      const node = new XmlElementNode({
        tag: 'L',
        children: [new XmlCommentNode("Test"), new XmlElementNode({ tag: "T" })]
      });

      expect(node.toXml()).to.equal(`<L>\n  <!--Test-->\n  <T/>\n</L>`);
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

    it("should write PI tags by default", () => {
      const node = new XmlElementNode({
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

      expect(node.toXml()).to.equal(`<L>
  <?ignore
    <T>12345</T>
  ?>
</L>`);
    });

    it("should not write PI tags if told not to", () => {
      const node = new XmlElementNode({
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

      expect(node.toXml({ writeProcessingInstructions: false })).to.equal(`<L>\n</L>`);
    });

    it("should not write whitespace if minify = true", () => {
      const node = new XmlElementNode({
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

      expect(node.toXml({ minify: true })).to.equal(`<L n="some_list"><T>12345<!--some_tuning--></T></L>`);
    });

    it("should not write any comments if writeComments = false", () => {
      const node = new XmlElementNode({
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

      expect(node.toXml({ writeComments: false })).to.equal(`<L n="some_list">
  <T>12345</T>
</L>`);
    });
  });
});
