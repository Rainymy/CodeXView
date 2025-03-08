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

type Language = {
  name: string;
  language: unknown;
  nodeTypeInfo: NodeInfo[];
};

type LoadEntry = {
  entry: Language | null,
  error: Error | null
}

type languageEntry = {
  absolutePath: string
}

export declare const language: Language;
export declare const loadEntry: LoadEntry;
export declare const languageEntry: languageEntry;