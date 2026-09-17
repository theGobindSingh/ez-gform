import { parseFormData } from "@ez-gform/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import allQuestionTypes from "../app/playground/all-question-types.fixture.json";
import { SchemaForm } from "../components/SchemaForm";

const schema = parseFormData(allQuestionTypes);

describe("SchemaForm", () => {
  it("renders a text input for every short_answer/paragraph question", () => {
    render(<SchemaForm schema={schema} />);
    const shortAnswerCount = schema.questions.filter((q) => {
      return q.type === "short_answer";
    }).length;
    expect(shortAnswerCount).toBeGreaterThan(0);
    // one text-ish control per short_answer/paragraph question, at minimum
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(
      shortAnswerCount,
    );
  });

  it("renders a submit button and prefill link", () => {
    render(<SchemaForm schema={schema} />);
    // getByRole throws if no matching element is found, so a non-throwing
    // call is itself the assertion that the button rendered.
    expect(
      screen.getByRole("button", { name: /submit to google form/i }),
    ).toBeDefined();
  });

  it("renders radio options for multiple_choice questions, including Other", () => {
    render(<SchemaForm schema={schema} />);
    const question = schema.questions.find((q) => {
      return (
        q.type === "multiple_choice" &&
        q.options?.some((o) => {
          return o.isOther;
        })
      );
    });
    expect(question).toBeDefined();
    expect(screen.getByText(question!.title)).toBeDefined();
    expect(screen.getAllByText("Other:").length).toBeGreaterThan(0);
  });

  it("renders a grid table for grid/checkbox_grid questions", () => {
    render(<SchemaForm schema={schema} />);
    const gridQuestion = schema.questions.find((q) => {
      return q.type === "grid" || q.type === "checkbox_grid";
    });
    expect(gridQuestion).toBeDefined();
    for (const row of gridQuestion!.rows ?? []) {
      expect(screen.getByText(row.label)).toBeDefined();
    }
  });

  it("renders date fields with month/day inputs", () => {
    render(<SchemaForm schema={schema} />);
    const dateQuestion = schema.questions.find((q) => {
      return q.type === "date";
    });
    expect(dateQuestion).toBeDefined();
    expect(screen.getAllByLabelText("Month").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Day").length).toBeGreaterThan(0);
  });

  it("renders a checkbox per option for checkboxes questions", () => {
    render(<SchemaForm schema={schema} />);
    const question = schema.questions.find((q) => {
      return q.type === "checkboxes";
    });
    expect(question).toBeDefined();
    const nonOtherOptions = (question!.options ?? []).filter((o) => {
      return !o.isOther;
    });
    for (const option of nonOtherOptions) {
      expect(screen.getByText(option.value)).toBeDefined();
    }
  });
});
