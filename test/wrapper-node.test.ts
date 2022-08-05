import { expect } from "chai";
import { XmlCommentNode, XmlElementNode, XmlValueNode, XmlWrapperNode } from "../dst/xml";

describe("XmlWrapperNode", () => {
  const newNode = (tag = "ignore") => new XmlWrapperNode({ tag });

  //#region Initialization

  describe("#constructor", () => {
    it("should throw when no tag given", () => {
      // TODO:
    });

    it("should throw when empty tag given", () => {
      // TODO:
    });

    it("should have an empty array of children if none provided", () => {
      // TODO:
    });

    it("should create a new node with just a tag", () => {
      // TODO:
    });

    it("should create a new node with the given tag and children", () => {
      // TODO:
    });
  });

  //#endregion Initialization

  //#region Properties

  describe("#attributes", () => {
    it("should not be assignable", () => {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.attributes = {}).to.throw();
    });

    it("should be undefined", () => {
      const node = newNode();
      expect(node.attributes).to.be.undefined;
    });
  });

  describe("#child", () => {
    it("should be undefined if there are no children", () => {
      const node = newNode();
      expect(node.child).to.be.undefined;
    });

    it("should be the same as the first child", () => {
      const node = newNode();
      node.addChildren(new XmlValueNode("hello"));
      expect(node.child.value).to.equal("hello");
    });

    it("should update the first child when set", () => {
      const node = newNode();
      node.addChildren(new XmlValueNode("hello"));
      expect(node.child.value).to.equal("hello");
      node.child = new XmlValueNode("new text");
      expect(node.child.value).to.equal("new text");
    });

    it("should add a child if there are none", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.child = new XmlValueNode("new text");
      expect(node.numChildren).to.equal(1);
      expect(node.child.value).to.equal("new text");
    });
  });

  describe("#children", () => {
    it("should throw when trying to set", () => {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.children = [newNode()]).to.throw();
    });

    it("should be an empty array if there are no children", () => {
      const node = newNode();
      expect(node.children).to.be.an("Array").that.is.empty;
    });

    it("should contain all of this node's children", () => {
      const node = newNode();
      node.addChildren(new XmlValueNode(1), new XmlValueNode(2));
      expect(node.children.length).to.equal(2);
      expect(node.children[0].value).to.equal(1);
      expect(node.children[1].value).to.equal(2);
    });
  });

  describe("#hasChildren", () => {
    it("should not be assignable", () => {
      const node = newNode();
      //@ts-expect-error
      expect(() => node.children = [newNode()]).to.throw();
    });

    it("should return true when it has children", () => {
      const node = newNode();
      node.addChildren(newNode());
      expect(node.hasChildren).to.be.true;
    });

    it("should return true when it does not have children", () => {
      // this test is not a typo, the hasChildren getter returns if there is
      // a children ARRAY -- it does not have to have any items in it
      const node = newNode();
      expect(node.hasChildren).to.be.true;
    });
  });

  describe("#id", () => {
    it("should throw when trying to set", () => {
      const node = newNode();
      expect(() => node.id = 123n).to.throw();
    });

    it("should be undefined", () => {
      const node = newNode();
      expect(node.id).to.be.undefined;
    });
  });

  describe("#innerValue", () => {
    it("should be undefined if there are no children", () => {
      const node = newNode();
      expect(node.innerValue).to.be.undefined;
    });

    it("should be undefined if the first child is an element", () => {
      const node = newNode("L");
      node.addChildren(new XmlElementNode({ tag: "T" }));
      expect(node.innerValue).to.be.undefined;
    });

    it("should be the value of the first child if it is a value node", () => {
      const node = newNode();
      node.addChildren(new XmlValueNode(123n));
      expect(node.innerValue).to.equal(123n);
    });

    it("should be the value of the text of the first child if it is a comment", () => {
      const node = newNode();
      node.child = new XmlCommentNode("This is a comment.");
      expect(node.innerValue).to.equal("This is a comment.");
    });

    it("should throw when setting if the first child cannot have a value", () => {
      const node = newNode();
      node.addChildren(new XmlElementNode({ tag: "T" }));
      expect(() => node.innerValue = 123n).to.throw();
    });

    it("should set the value of the first child if it can have a value", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [new XmlValueNode(123)]
      });

      expect(node.child.value).to.equal(123);
      node.innerValue = 456;
      expect(node.child.value).to.equal(456);
    });

    it("should create a new value node child if there are no children", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.innerValue = 123n;
      expect(node.numChildren).to.equal(1);
      expect(node.child.value).to.equal(123n);
    });
  });

  describe("#name", () => {
    it("should throw when trying to set", () => {
      const node = newNode();
      expect(() => node.name = "name").to.throw();
    });

    it("should be undefined", () => {
      const node = newNode();
      expect(node.name).to.be.undefined;
    });
  });

  describe("#numChildren", () => {
    it("should return 0 if there are no children", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
    });

    it("should return number of children if there are any", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
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

  describe("#tag", () => {
    it("should be the tag of this node", () => {
      const node = new XmlWrapperNode({ tag: "ignore" });
      expect(node.tag).to.equal("ignore");
    });

    it("should set the tag of this node", () => {
      const node = new XmlWrapperNode({ tag: "ignore" });
      node.tag = "something_else"
      expect(node.tag).to.equal("something_else");
    });
  });

  describe("#type", () => {
    it("should throw when trying to set", () => {
      const node = newNode();
      expect(() => node.type = "enabled").to.throw();
    });

    it("should be undefined", () => {
      const node = newNode();
      expect(node.type).to.be.undefined;
    });
  });

  describe("#value", () => {
    it("should be undefined", () => {
      const node = newNode();
      expect(node.value).to.be.undefined;
    });

    it("should throw when setting", () => {
      const node = newNode();
      expect(() => node.value = 1).to.throw();
    });
  });

  //#endregion Properties

  //#region Methods

  describe("#addChildren()", () => {
    it("should do nothing when no children are given", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren();
      expect(node.numChildren).to.equal(0);
    });

    it("should add the one child that is given", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren(new XmlValueNode("hi"));
      expect(node.numChildren).to.equal(1);
      expect(node.children[0].value).to.equal("hi");
    });

    it("should add all children that are given", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addChildren(new XmlValueNode("hi"), new XmlValueNode("bye"));
      expect(node.numChildren).to.equal(2);
      expect(node.children[0].value).to.equal("hi");
      expect(node.children[1].value).to.equal("bye");
    });

    it("should mutate the original children", () => {
      const node = newNode();
      const child = new XmlValueNode(123n);
      node.addChildren(child);
      node.innerValue = 456n;
      expect(child.value).to.equal(456n);
    });
  });

  describe("#addClones()", () => {
    it("should do nothing when no children are given", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addClones();
      expect(node.numChildren).to.equal(0);
    });

    it("should add the one child that is given", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addClones(new XmlValueNode("hi"));
      expect(node.numChildren).to.equal(1);
      expect(node.children[0].value).to.equal("hi");
    });

    it("should add all children that are given", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      node.addClones(new XmlValueNode("hi"), new XmlValueNode("bye"));
      expect(node.numChildren).to.equal(2);
      expect(node.children[0].value).to.equal("hi");
      expect(node.children[1].value).to.equal("bye");
    });

    it("should not mutate the original children", () => {
      const node = newNode();
      const child = new XmlValueNode(123n);
      node.addClones(child);
      node.innerValue = 456n;
      expect(child.value).to.equal(123n);
    });
  });

  describe("#clone()", () => {
    it("should return a new, empty node if there are no children", () => {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
      const clone = node.clone();
      expect(clone.numChildren).to.equal(0);
    });

    it("should return a new node with all children", () => {
      const node = newNode();
      node.addChildren(new XmlValueNode(5), new XmlCommentNode("hi"));
      expect(node.numChildren).to.equal(2);
      const clone = node.clone();
      expect(clone.numChildren).to.equal(2);
      expect(clone.children[0].value).to.equal(5);
      expect(clone.children[1].value).to.equal("hi");
    });

    it("should not mutate the children array of the original", () => {
      const node = newNode();
      const clone = node.clone();
      expect(node.numChildren).to.equal(0);
      expect(clone.numChildren).to.equal(0);
      clone.innerValue = 5;
      expect(node.numChildren).to.equal(0);
      expect(clone.numChildren).to.equal(1);
    });

    it("should not mutate the individual children of the original", () => {
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

  describe("#deepSort()", () => {
    it("should sort childrens' children", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [
          new XmlElementNode({
            tag: "L",
            attributes: { n: "list_b" },
            children: [
              new XmlElementNode({ tag: "T", attributes: { n: "b" } }),
              new XmlElementNode({ tag: "T", attributes: { n: "a" } }),
              new XmlElementNode({ tag: "T", attributes: { n: "c" } })
            ]
          }),
          new XmlElementNode({
            tag: "L",
            attributes: { n: "list_a" },
            children: [
              new XmlElementNode({ tag: "T", attributes: { n: "b" } }),
              new XmlElementNode({ tag: "T", attributes: { n: "a" } }),
              new XmlElementNode({ tag: "T", attributes: { n: "c" } })
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
      const node = new XmlWrapperNode({
        tag: "ignore",
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
      const node = new XmlWrapperNode({
        tag: "ignore",
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

  describe("#sort()", () => {
    it("should sort in alphabetical order by name if no fn passed in", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [
          new XmlElementNode({ tag: "T", attributes: { n: "c" } }),
          new XmlElementNode({ tag: "T", attributes: { n: "a" } }),
          new XmlElementNode({ tag: "T", attributes: { n: "d" } }),
          new XmlElementNode({ tag: "T", attributes: { n: "b" } })
        ]
      });

      node.sort();
      expect(node.children[0].name).to.equal("a");
      expect(node.children[1].name).to.equal("b");
      expect(node.children[2].name).to.equal("c");
      expect(node.children[3].name).to.equal("d");
    });

    it("should sort children according to the given function", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [
          new XmlElementNode({
            tag: "T",
            attributes: { n: "ten" },
            children: [new XmlValueNode(10)]
          }),
          new XmlElementNode({
            tag: "T",
            attributes: { n: "one" },
            children: [new XmlValueNode(1)]
          }),
          new XmlElementNode({
            tag: "T",
            attributes: { n: "five" },
            children: [new XmlValueNode(5)]
          })
        ]
      });

      node.sort((a, b) => (a.innerValue as number) - (b.innerValue as number));
      expect(node.children[0].name).to.equal("one");
      expect(node.children[1].name).to.equal("five");
      expect(node.children[2].name).to.equal("ten");
    });

    it("should not change the order of childrens' children", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [
          new XmlElementNode({
            tag: "L",
            attributes: { n: "list" },
            children: [
              new XmlElementNode({ tag: "T", attributes: { n: "b" } }),
              new XmlElementNode({ tag: "T", attributes: { n: "a" } }),
              new XmlElementNode({ tag: "T", attributes: { n: "c" } })
            ]
          })
        ]
      });

      node.sort();
      expect(node.child.children[0].name).to.equal("b");
      expect(node.child.children[1].name).to.equal("a");
      expect(node.child.children[2].name).to.equal("c");
    });

    it("should not do anything when no children have names", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
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

  describe("#toXml()", () => {
    it("should not indent by default", () => {
      const node = newNode();
      expect(node.toXml()).to.equal(`<?ignore?>`);
    });

    it("should use 2 spaces by default", () => {
      const node = newNode();
      expect(node.toXml({ indents: 1 })).to.equal(`  <?ignore?>`);
    });

    it("should use the given number of spaces", () => {
      const node = newNode();
      expect(node.toXml({
        indents: 1,
        spacesPerIndent: 4
      })).to.equal(`    <?ignore?>`);
    });

    it("should be on one line if there is one value child", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [
          new XmlValueNode(50)
        ]
      });

      expect(node.toXml()).to.equal(`<?ignore 50 ?>`);
    });

    it("should be on one line if there are two value/comment children", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [
          new XmlValueNode(50),
          new XmlCommentNode("hi")
        ]
      });

      expect(node.toXml()).to.equal(`<?ignore 50<!--hi--> ?>`);
    });

    it("should put an element child on its own line, indented", () => {
      const node = new XmlWrapperNode({
        tag: "ignore",
        children: [
          new XmlElementNode({
            tag: "T",
            children: [
              new XmlValueNode(50),
              new XmlCommentNode("hi")
            ]
          })
        ]
      });

      expect(node.toXml()).to.equal(`<?ignore\n  <T>50<!--hi--></T>\n?>`);
    });

    it("should increase indentation by 1 for each recursive call", () => {
      const node = new XmlWrapperNode({
        tag: "something",
        children: [
          new XmlElementNode({
            tag: "U",
            children: [
              new XmlElementNode({
                tag: "T",
                attributes: { n: "first" },
                children: [new XmlValueNode(123)]
              }),
              new XmlElementNode({
                tag: 'T',
                attributes: { n: "second" },
                children: [new XmlValueNode(456)]
              })
            ]
          })
        ]
      });

      expect(node.toXml()).to.equal(`<?something
  <U>
    <T n="first">123</T>
    <T n="second">456</T>
  </U>
?>`);
    });
  });

  //#endregion Methods
});
