import { expect } from "chai";
import { XmlCommentNode } from "../dst/xml";

describe('XmlCommentNode', function () {
  const newNode = (value = "Comment") => new XmlCommentNode(value);

  describe('#constructor', function () {
    it('have undefined content when none is given', function () {
      const node = new XmlCommentNode();
      expect(node.value).to.be.undefined;
    });

    it('should use the value that is given', function () {
      const node = new XmlCommentNode("hello");
      expect(node.value).to.equal("hello");
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
    it('should return a new node with the same comment as this one', function () {
      const node = newNode();
      expect(node.value).to.equal("Comment");
      const clone = node.clone();
      expect(clone.value).to.equal("Comment");
    });

    it('should not mutate the original', function () {
      const node = newNode();
      const clone = node.clone();
      expect(node.value).to.equal("Comment");
      expect(clone.value).to.equal("Comment");
      clone.value = "Hello World";
      expect(node.value).to.equal("Comment");
      expect(clone.value).to.equal("Hello World");
    });
  });

  describe('#deepSort()', function () {
    it('should throw', function () {
      const node = newNode();
      expect(() => node.deepSort()).to.throw();
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
      expect(node.toXml()).to.equal('<!--Comment-->');
    });

    it('should use a default indentation of 2 spaces', function () {
      const node = newNode();
      expect(node.toXml({ indents: 1 })).to.equal('  <!--Comment-->');
    });

    it('should use the number of spaces that are provided', function () {
      const node = newNode();
      expect(node.toXml({
        indents: 1,
        spacesPerIndent: 4
      })).to.equal('    <!--Comment-->');
    });

    it('should wrap value in XML comment syntax', function () {
      const node = newNode();
      expect(node.toXml()).to.equal('<!--Comment-->');
    });

    it("should return a blank comment when there is no value", function () {
      const node = new XmlCommentNode();
      expect(node.toXml()).to.equal('<!---->');
    });

    it("should not write whitespace if minify = true", () => {
      const node = new XmlCommentNode("text");
      expect(node.toXml({
        indents: 1,
        minify: true
      })).to.equal("<!--text-->");
    });
  });
});
