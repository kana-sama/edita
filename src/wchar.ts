import * as WCharId from "./wcharid";

export type t = {
  id: WCharId.t;
  prev: WCharId.t;
  next: WCharId.t;
  visible: boolean;
  value: string;
};

export const beg: t = {
  id: WCharId.beg,
  prev: WCharId.beg,
  next: WCharId.fin,
  visible: false,
  value: ""
};

export const fin: t = {
  id: WCharId.fin,
  prev: WCharId.beg,
  next: WCharId.fin,
  visible: false,
  value: ""
};
