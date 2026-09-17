import type { Metadata } from "next";
import { PlaygroundClient } from "./PlaygroundClient";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <div>
      <h1>Playground</h1>
      <p>
        Paste a public Google Form URL to see its questions and entry ids, get
        generated code, and try a live form. No form handy? Click{" "}
        <strong>Load example</strong>.
      </p>
      <PlaygroundClient />
    </div>
  );
}
