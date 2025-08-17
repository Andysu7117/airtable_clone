export interface Column {
  id: string;
  name: string;
  type: "text" | "number";
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: any[];
}

export interface Base {
  id: string;
  name: string;
  tables: Table[];
}
