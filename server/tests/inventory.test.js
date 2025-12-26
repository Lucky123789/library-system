import test from "node:test";
import assert from "node:assert/strict";
import { canBorrow, borrowOne, returnOne } from "../utils/inventory.js";

test("canBorrow returns true when availableCopies > 0", () => {
  assert.equal(canBorrow({ availableCopies: 1 }), true);
});

test("canBorrow returns false when availableCopies is 0", () => {
  assert.equal(canBorrow({ availableCopies: 0 }), false);
});

test("borrowOne decrements availableCopies by 1", () => {
  const book = { totalCopies: 3, availableCopies: 2 };
  const updated = borrowOne(book);
  assert.equal(updated.availableCopies, 1);
  assert.equal(book.availableCopies, 2);
});

test("borrowOne throws when no copies are available", () => {
  const book = { totalCopies: 3, availableCopies: 0 };
  assert.throws(() => borrowOne(book), /NO_COPIES_AVAILABLE/);
});

test("returnOne increments availableCopies by 1", () => {
  const book = { totalCopies: 3, availableCopies: 1 };
  const updated = returnOne(book);
  assert.equal(updated.availableCopies, 2);
});

test("returnOne throws when availableCopies would exceed totalCopies", () => {
  const book = { totalCopies: 3, availableCopies: 3 };
  assert.throws(() => returnOne(book), /CANNOT_EXCEED_TOTAL/);
});

