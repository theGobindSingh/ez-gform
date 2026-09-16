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
        Paste a public Google Form URL or id, or click{" "}
        <strong>Load example</strong> to try it offline with a bundled fixture
        covering every question type. The schema is fetched server-side via{" "}
        <code>GET /api/schema</code> (Node runtime), which runs{" "}
        <code>@ez-gform/core</code>&apos;s <code>parseFormHtml</code> against
        the form&apos;s public <code>/viewform</code> HTML.
      </p>
      <PlaygroundClient />
    </div>
  );
}
