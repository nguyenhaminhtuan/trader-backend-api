export async function wrapAsync<T>(handler: Promise<T>) {
  try {
    const result: T = await handler
    return {result, err: null}
  } catch (err) {
    return {result: null as T, err}
  }
}
