export interface Column {
  id: string;
  name: string;
  type: "text" | "number";
}

export type TableRow = Record<string, string | number>;

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: TableRow[];
}

export interface Base {
  id: string;
  name: string;
  tables: Table[];
}
