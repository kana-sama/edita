import * as WCharId from "./wcharid";
import * as WChar from "./wchar";

export class WString {
  public chars: WChar.t[];

  constructor(chars: WChar.t[]) {
    this.chars = chars;
  }

  public static empty(): WString {
    return new WString([WChar.beg, WChar.fin]);
  }

  public value(): string {
    return this.chars
      .filter(wc => wc.visible)
      .map(wc => wc.value)
      .join("");
  }

  public length(): number {
    return this.chars.filter(wc => wc.visible).length;
  }

  public atVisible(index: number): WChar.t {
    for (let i = 0; i < this.chars.length; i++) {
      if (this.chars[i].visible) {
        if (index === 0) return this.chars[i];
        index -= 1;
      }
    }

    return WChar.fin;
  }

  private getIndexById(id: WCharId.t): number | null {
    const ix = this.chars.findIndex(wc => WCharId.eq(wc.id, id));
    return ix === -1 ? null : ix;
  }

  public insert(wc: WChar.t): boolean {
    if (this.getIndexById(wc.id) != null) return true;

    const prevIx = this.getIndexById(wc.prev);
    const nextIx = this.getIndexById(wc.next);
    if (prevIx == null || nextIx == null) return false;

    for (let i = prevIx + 1; i <= nextIx; i++) {
      if (WCharId.le(wc.id, this.chars[i].id)) {
        this.chars.splice(i, 0, wc);
        return true;
      }
    }

    this.chars.splice(nextIx, 0, wc);
    return true;
  }

  public delete(wc: WChar.t): boolean {
    const ix = this.getIndexById(wc.id);
    if (ix == null) return false;
    this.chars[ix].visible = false;
    return true;
  }
}
