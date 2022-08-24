import { expect } from "chai";
import { XmlCommentNode, XmlElementNode, XmlValueNode } from "../dst/xml";

describe('XmlValueNode', function () {
  const newNode = (value: any = "test") => new XmlValueNode(value);

  describe('#constructor', function () {
    it('should have undefined content when no value is given', function () {
      const node = new XmlValueNode();
      expect(node.value).to.be.undefined;
    });

    it('should use the value that is given', function () {
      const node1 = new XmlValueNode("hello");
      expect(node1.value).to.equal("hello");
      const node2 = new XmlValueNode(123n);
      expect(node2.value).to.equal(123n);
    });
  });

  describe('#attributes', function () {
    it('should not be assignable', function () {
      const node = newNode();
      expect(() => node.attributes = {}).to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.attributes).to.be.undefined;
    });
  });

  describe('#child', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.child = newNode()).to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.child).to.be.undefined;
    });
  });

  describe('#children', function () {
    it('should not be assignable', function () {
      const node = newNode();
      expect(() => node.children = []).to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.children).to.be.undefined;
    });
  });

  describe('#hasChildren', function () {
    it('should be false', function () {
      const node = newNode();
      expect(node.hasChildren).to.be.false;
    });
  });

  describe('#id', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.id = 123n).to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.id).to.be.undefined;
    });
  });

  describe('#innerValue', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.innerValue = 123n).to.throw();
    });

    it('should be undefined', function () {
      const node = newNode();
      expect(node.innerValue).to.be.undefined;
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
    it('should be 0', function () {
      const node = newNode();
      expect(node.numChildren).to.equal(0);
    });
  });

  describe('#tag', function () {
    it('should throw when trying to set', function () {
      const node = newNode();
      expect(() => node.tag = "tag").to.throw();
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
    it('should change the value when set', function () {
      const node = newNode("hello");
      expect(node.value).to.equal("hello");
      node.value = "goodbye";
      expect(node.value).to.equal("goodbye");
    });

    it('should return the current value', function () {
      const node = newNode("hello");
      expect(node.value).to.equal("hello");
    });
  });

  describe('#addChildren()', function () {
    it('should throw when no children are given', function () {
      const node = newNode();
      expect(() => node.addChildren()).to.throw();
    });

    it('should throw when children are given', function () {
      const node = newNode();
      expect(() => node.addChildren(newNode(), newNode())).to.throw();
    });
  });

  describe('#addClones()', function () {
    it('should throw when no children are given', function () {
      const node = newNode();
      expect(() => node.addClones()).to.throw();
    });

    it('should throw when children are given', function () {
      const node = newNode();
      expect(() => node.addClones(newNode(), newNode())).to.throw();
    });
  });

  describe('#clone()', function () {
    it('should return a new node with the same value as this one', function () {
      const node = newNode();
      expect(node.value).to.equal("test");
      const clone = node.clone();
      expect(clone.value).to.equal("test");
    });

    it('should not mutate the original', function () {
      const node = newNode();
      const clone = node.clone();
      expect(node.value).to.equal("test");
      expect(clone.value).to.equal("test");
      clone.value = 123n;
      expect(node.value).to.equal("test");
      expect(clone.value).to.equal(123n);
    });
  });

  describe('#deepSort()', function () {
    it('should throw', function () {
      const node = newNode();
      expect(() => node.deepSort()).to.throw();
    });
  });

  describe("#equals()", () => {
    it("should return false when other is an element node with the same inner value", () => {
      const thisNode = new XmlValueNode("test");
      const otherNode = new XmlElementNode({
        tag: "T",
        children: [thisNode]
      });

      expect(thisNode.equals(otherNode)).to.be.false;
    });

    it("should return false when other is a comment node with the same value", () => {
      const thisNode = new XmlValueNode("test");
      const otherNode = new XmlCommentNode("test");
      expect(thisNode.equals(otherNode)).to.be.false;
    });

    it("should return false when other is a value node with different value", () => {
      const thisNode = new XmlValueNode("test1");
      const otherNode = new XmlValueNode("test2");
      expect(thisNode.equals(otherNode)).to.be.false;
    });

    it("should return true when other is the exact same object", () => {
      const node = new XmlValueNode("test");
      expect(node.equals(node)).to.be.true;
    });

    it("should return true when other is a value node with the same value", () => {
      const thisNode = new XmlValueNode("test");
      const otherNode = new XmlValueNode("test");
      expect(thisNode.equals(otherNode)).to.be.true;
    });

    it("should return true for `true` and \"True\" if strictTypes unsupplied", () => {
      const thisNode = new XmlValueNode(true);
      const otherNode = new XmlValueNode("True");
      expect(thisNode.equals(otherNode)).to.be.true;
    });

    it("should return true for `true` and \"True\" if strictTypes = false", () => {
      const thisNode = new XmlValueNode(true);
      const otherNode = new XmlValueNode("True");
      expect(thisNode.equals(otherNode, {
        strictTypes: false
      })).to.be.true;
    });

    it("should return false for `true` and \"True\" if strictTypes = true", () => {
      const thisNode = new XmlValueNode(true);
      const otherNode = new XmlValueNode("True");
      expect(thisNode.equals(otherNode, {
        strictTypes: true
      })).to.be.false;
    });

    it("should return true for `123` and \"123\" if strictTypes unsupplied", () => {
      const thisNode = new XmlValueNode(123);
      const otherNode = new XmlValueNode("123");
      expect(thisNode.equals(otherNode)).to.be.true;
    });

    it("should return true for `123` and \"123\" if strictTypes = false", () => {
      const thisNode = new XmlValueNode(123);
      const otherNode = new XmlValueNode("123");
      expect(thisNode.equals(otherNode, {
        strictTypes: false
      })).to.be.true;
    });

    it("should return false for `123` and \"123\" if strictTypes = true", () => {
      const thisNode = new XmlValueNode(123);
      const otherNode = new XmlValueNode("123");
      expect(thisNode.equals(otherNode, {
        strictTypes: true
      })).to.be.false;
    });
  });

  describe("#findChild()", () => {
    it("should throw", () => {
      const node = newNode();
      expect(() => node.findChild("")).to.throw();
    });
  });

  describe('#sort()', function () {
    it('should throw', function () {
      const node = newNode();
      expect(() => node.sort()).to.throw();
    });
  });

  describe('#toXml()', function () {
    it('should not indent if the given number is 0', function () {
      const node = newNode();
      expect(node.toXml()).to.equal('test');
    });

    it('should use a default indentation of 2 spaces', function () {
      const node = newNode();
      expect(node.toXml({ indents: 1 })).to.equal('  test');
    });

    it('should use the number of spaces that are provided', function () {
      const node = newNode();
      expect(node.toXml({
        indents: 1,
        spacesPerIndent: 4
      })).to.equal('    test');
    });

    it('should capitalize boolean values', function () {
      const trueNode = newNode(true);
      expect(trueNode.toXml()).to.equal('True');
      const falseNode = newNode(false);
      expect(falseNode.toXml()).to.equal('False');
    });

    it('should write numbers and bigints as strings', function () {
      const numberNode = newNode(123);
      expect(numberNode.toXml()).to.equal('123');
      const bigintNode = newNode(123n);
      expect(bigintNode.toXml()).to.equal('123');
    });

    it('should write strings', function () {
      const node = newNode();
      expect(node.toXml()).to.equal('test');
    });

    it("should return a blank string when there is no value", function () {
      const node = new XmlValueNode();
      expect(node.toXml()).to.equal('');
    });

    it("should not write whitespace if minify = true", () => {
      const node = new XmlValueNode("text");
      expect(node.toXml({
        indents: 1,
        minify: true
      })).to.equal("text");
    });
  });
});
