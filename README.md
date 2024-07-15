# Server-sent events

got curious about how OpenAI API streams tokens. looked it up & learnt that they use server-sent events and implemented a simple POC to create a server that streams a word every 400ms to the clients until the last word is sent.
