import * as React from "react";
import * as ReactDOM from "react-dom";
import io from "socket.io-client";

import * as WChar from "./wchar";
import { Client, Operation } from "./client";
import { Editor } from "./editor";

function EditorSession({
  server,
  clientId,
  chars
}: {
  server: SocketIOClient.Socket;
  clientId: number;
  chars: WChar.t[] | undefined;
}) {
  const client = React.useRef(new Client(clientId, chars));
  const [value, setValue] = React.useState(client.current.value());

  React.useEffect(() => {
    server.on("op", (op: Operation) => {
      client.current.apply(op);
    });

    server.on("get-chars", () => {
      server.emit("get-chars", client.current.buffer.chars);
    });

    client.current.onOperation(op => server.emit("op", op));
    client.current.onValue(setValue);
  }, []);

  const handleInsert = React.useCallback((i, text) => {
    client.current.insert(i, text);
  }, []);

  const handleRemove = React.useCallback((i, _count) => {
    client.current.delete(i);
  }, []);

  return (
    <Editor value={value} onInsert={handleInsert} onDelete={handleRemove} />
  );
}

function App() {
  const server = React.useRef<SocketIOClient.Socket>();
  const [state, setState] = React.useState<{
    clientId: number;
    chars: WChar.t[] | undefined;
  } | null>(null);

  React.useEffect(() => {
    server.current = io("http://51.15.42.84:3001");
    server.current.on("init", setState);
  }, []);

  if (state == null || server.current == null) {
    return <div>connecting...</div>;
  } else {
    return (
      <EditorSession
        clientId={state.clientId}
        server={server.current}
        chars={state.chars}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
