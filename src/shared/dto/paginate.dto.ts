export class PaginateDto<T> {
  count: number
  data: T
  page: {
    current: number
    size: number
    total: number
  }

  constructor(data: T, count: number, page: number, pageSize: number) {
    this.count = count
    this.data = data
    this.page = {
      current: page,
      size: pageSize,
      total: Math.ceil(count / pageSize),
    }
  }
}
