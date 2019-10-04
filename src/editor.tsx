import * as React from "react";

type EditorProps = {
  value: string;
  onInsert(index: number, text: string): void;
  onDelete(index: number, count: number): void;
};

export function Editor({ value, onInsert, onDelete }: EditorProps) {
  const [cursor, setCursor] = React.useState(0);

  React.useEffect(() => {
    if (cursor > value.length) setCursor(value.length);
    if (cursor < 0) setCursor(0);
  }, [value, cursor]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      event.preventDefault();

      if (event.key === "Backspace") {
        onDelete(cursor - 1, 1);
        setCursor(cursor - 1);
      } else if (event.key === "ArrowLeft") {
        setCursor(cursor => cursor - 1);
      } else if (event.key === "ArrowRight") {
        setCursor(cursor => cursor + 1);
      } else if (event.key.length === 1) {
        onInsert(cursor, event.key);
        setCursor(cursor + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDelete, onInsert, cursor]);

  return (
    <div>
      <span style={{ whiteSpace: "pre" }}>{value.slice(0, cursor)}</span>
      <span>_</span>
      <span style={{ whiteSpace: "pre" }}>{value.slice(cursor)}</span>
    </div>
  );
}
