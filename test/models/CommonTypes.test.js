import { test } from "node:test";
import assert from "node:assert/strict";

import {
  SetError,
  MethodError,
  ResultReference,
  JmapError,
  JmapProtocolError,
  JmapNetworkError,
} from "aspose-jmap-foss";

test("SetError toJson includes all fields", () => {
  const err = new SetError("invalidProperties", "Bad props", ["name", "email"]);
  const json = err.toJson();
  assert.deepStrictEqual(json, {
    type: "invalidProperties",
    description: "Bad props",
    properties: ["name", "email"],
  });
});

test("SetError toJson omits optional null fields", () => {
  const err = new SetError("notFound");
  const json = err.toJson();
  assert.deepStrictEqual(json, { type: "notFound" });
});

test("SetError fromJson restores instance", () => {
  const data = {
    type: "tooLarge",
    description: "Size limit exceeded",
    properties: ["size"],
  };
  const err = SetError.fromJson(data);
  assert.ok(err instanceof SetError);
  assert.equal(err.type, "tooLarge");
  assert.equal(err.description, "Size limit exceeded");
  assert.deepStrictEqual(err.properties, ["size"]);
});

test("MethodError toJson includes optional description", () => {
  const err = new MethodError("unknownMethod", "Method does not exist");
  const json = err.toJson();
  assert.deepStrictEqual(json, {
    type: "unknownMethod",
    description: "Method does not exist",
  });
});

test("MethodError toJson omits null description", () => {
  const err = new MethodError("invalidArguments");
  const json = err.toJson();
  assert.deepStrictEqual(json, { type: "invalidArguments" });
});

test("MethodError fromJson restores instance", () => {
  const data = { type: "serverFail", description: "Internal error" };
  const err = MethodError.fromJson(data);
  assert.ok(err instanceof MethodError);
  assert.equal(err.type, "serverFail");
  assert.equal(err.description, "Internal error");
});

test("ResultReference serialization round‑trip", () => {
  const ref = new ResultReference("c1", "list", "/0/id");
  const json = ref.toJson();
  assert.deepStrictEqual(json, {
    resultOf: "c1",
    name: "list",
    path: "/0/id",
  });
  const restored = ResultReference.fromJson(json);
  assert.ok(restored instanceof ResultReference);
  assert.equal(restored.resultOf, "c1");
  assert.equal(restored.name, "list");
  assert.equal(restored.path, "/0/id");
});

test("JmapProtocolError formats message with description", () => {
  const err = new JmapProtocolError("unknownMethod", "No such method");
  assert.equal(err.message, "unknownMethod: No such method");
  assert.equal(err.type, "unknownMethod");
  assert.equal(err.description, "No such method");
});

test("JmapProtocolError formats message without description", () => {
  const err = new JmapProtocolError("accountNotFound");
  // The constructor appends a colon even when description is omitted.
  assert.equal(err.message, "accountNotFound:");
  assert.equal(err.type, "accountNotFound");
  assert.equal(err.description, null);
});

test("JmapNetworkError captures cause", () => {
  const cause = new Error("fetch failed");
  const err = new JmapNetworkError("Network error", cause);
  assert.equal(err.message, "Network error");
  assert.strictEqual(err.cause, cause);
});

test("JmapNetworkError without cause sets null cause", () => {
  const err = new JmapNetworkError("Network error");
  assert.equal(err.message, "Network error");
  assert.equal(err.cause, null);
});

test("JmapError base class name reflects subclass", () => {
  const protoErr = new JmapProtocolError("invalidArguments");
  const netErr = new JmapNetworkError("Network error");
  assert.equal(protoErr.name, "JmapProtocolError");
  assert.equal(netErr.name, "JmapNetworkError");
});
