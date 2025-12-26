export function canBorrow(book) {
  return book && Number(book.availableCopies) > 0;
}

export function borrowOne(book) {
  if (!book) throw new Error("BOOK_REQUIRED");
  if (Number(book.availableCopies) <= 0) throw new Error("NO_COPIES_AVAILABLE");
  return { ...book, availableCopies: Number(book.availableCopies) - 1 };
}

export function returnOne(book) {
  if (!book) throw new Error("BOOK_REQUIRED");
  const total = Number(book.totalCopies);
  const available = Number(book.availableCopies);
  if (available >= total) throw new Error("CANNOT_EXCEED_TOTAL");
  return { ...book, availableCopies: available + 1 };
}

