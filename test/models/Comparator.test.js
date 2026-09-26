import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { Comparator } from "aspose-jmap-foss";

describe("Comparator model", () => {
  test("constructor requires property", () => {
    assert.throws(
      () => {
        // @ts-ignore – intentionally missing required param
        new Comparator({});
      },
      {
        name: "TypeError",
        message: "Comparator: 'property' is required",
      },
    );
  });

  test("default values are applied when optional fields are omitted", () => {
    const comp = new Comparator({ property: "subject" });
    assert.equal(comp.property, "subject");
    assert.equal(comp.isAscending, true);
    assert.equal(comp.collation, null);
  });

  test("toJson includes required fields and omits null collation", () => {
    const comp = new Comparator({
      property: "receivedAt",
      isAscending: false,
      collation: null,
    });
    const json = comp.toJson();
    assert.deepEqual(json, {
      property: "receivedAt",
      isAscending: false,
    });
  });

  test("toJson includes collation when provided", () => {
    const comp = new Comparator({
      property: "size",
      isAscending: true,
      collation: "i;unicode-casemap",
    });
    const json = comp.toJson();
    assert.deepEqual(json, {
      property: "size",
      isAscending: true,
      collation: "i;unicode-casemap",
    });
  });

  test("fromJson creates instance with defaults for missing optional fields", () => {
    const json = {
      property: "from",
    };
    const comp = Comparator.fromJson(json);
    assert.equal(comp.property, "from");
    assert.equal(comp.isAscending, true);
    assert.equal(comp.collation, null);
  });

  test("fromJson respects explicit optional values", () => {
    const json = {
      property: "subject",
      isAscending: false,
      collation: "i;unicode-casemap",
    };
    const comp = Comparator.fromJson(json);
    assert.equal(comp.property, "subject");
    assert.equal(comp.isAscending, false);
    assert.equal(comp.collation, "i;unicode-casemap");
  });
});
