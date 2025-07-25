export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: string;
};
