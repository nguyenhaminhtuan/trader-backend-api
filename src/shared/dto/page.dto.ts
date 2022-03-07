export class PageDto {
  current: number
  size: number

  constructor(current: number, size: number) {
    this.current = current
    this.size = size
  }

  public get limit(): number {
    return this.size
  }

  public get skip(): number {
    return (this.current - 1) * this.size
  }
}
