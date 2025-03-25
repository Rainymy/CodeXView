type BaseNode = {
  type: string;
  named: boolean;
};

type ChildNode = {
  multiple: boolean;
  required: boolean;
  types: BaseNode[];
};

type NodeInfo =
  | (BaseNode & { subtypes: BaseNode[]; })
  | (BaseNode & {
    fields: { [name: string]: ChildNode };
    children: ChildNode[];
  });

type Entries = {
  name: string,
  path: string
}[];

type Language = import("web-tree-sitter").Language;

type LoadEntry = {
  entry: Language | null,
  error: Error | null,
}

export declare const language: Language;
export declare const loadEntry: LoadEntry;
export declare const entries: Entries;
