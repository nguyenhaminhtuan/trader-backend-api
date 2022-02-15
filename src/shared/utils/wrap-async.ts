export async function wrapAsync<T>(handler: Promise<T>) {
  try {
    const result = await handler
    return {result, err: null}
  } catch (err) {
    return {result: null, err}
  }
}
