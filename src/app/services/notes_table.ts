export class NotesTable {
  id: string;
  title: string;
  note: string;
  label: string;
  reminder: {
    date: string,
    repeat: string
  };
  color: string;
  time: string;
  restore: string;
}
