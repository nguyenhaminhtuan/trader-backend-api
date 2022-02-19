export class Paginate<T> {
  count: number
  data: T
  page: {
    current: number
    size: number
    total: number
  }

  constructor({count, data, page}: Paginate<T>) {
    this.count = count
    this.data = data
    this.page = page
  }
}
