const encode = (createdAt, id) => Buffer.from(`${createdAt}|${id}`).toString('base64url');
const decode = (cursor) => {
  if (!cursor) return null;
  const [createdAt, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  return { createdAt, id };
};

export function paginateSorted(items, { cursor, limit = 20 }) {
  const after = decode(cursor);
  let startIdx = 0;

  if (after) {
    startIdx = items.findIndex(
      it => it.createdAt === after.createdAt && it.id === after.id
    );
    if (startIdx >= 0) startIdx += 1; // move past the cursor item
  }

  const slice = items.slice(startIdx, startIdx + limit);
  const last = slice[slice.length - 1];
  const nextCursor = last ? encode(last.createdAt, last.id) : null;

  return {
    data: slice,
    pageInfo: { nextCursor, hasNextPage: startIdx + limit < items.length }
  };
}
