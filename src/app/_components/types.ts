export interface Column {
  id: string;
  name: string;
  type: "TEXT" | "NUMBER" | "text" | "number";
  order: number;
  isRequired: boolean;
}

export interface TableRow {
  id: string;
  data: Record<string, string | number | null>;
}

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
