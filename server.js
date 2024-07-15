import http from "node:http";

const clients = new Map();

/**
 * text to be streamed. it's already split into array of words.
 */
const text =
  "When you have eliminated all which is impossible, then whatever remains, however improbable, must be the truth.".split(
    " "
  );

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/stream-it" && req.method === "GET") {
      // send these headers to tell the client we are sending an event stream
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      });

      const clientId = Date.now();

      // store the response object for this client
      clients.set(clientId, { res, index: 0 });

      req.on("close", () => {
        console.log(`${clientId} connection closed by client`);
        clients.delete(clientId);
      });

      res.on("close", () => {
        console.log(`${clientId} connection closed by server`);
        clients.delete(clientId);
      });
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "hello world" }));
  } catch (error) {
    console.error("error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

function streamIt() {
  if (clients.size === 0) {
    return;
  }

  for (const client of clients.values()) {
    const { res, index } = client;
    if (index < text.length) {
      res.write(JSON.stringify({ word: text[index], index, last: index == text.length - 1 }));
      client.index++;
    } else {
      res.end();
    }
  }
}

// stream the text to all clients every 200ms
setInterval(streamIt, 200);

const PORT = 8000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
