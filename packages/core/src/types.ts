export type QuestionType =
  | "short_answer"
  | "paragraph"
  | "multiple_choice"
  | "dropdown"
  | "checkboxes"
  | "linear_scale"
  | "grid"
  | "checkbox_grid"
  | "date"
  | "time"
  | "file_upload";

export interface ChoiceOption {
  value: string;
  isOther: boolean;
}

export interface GridRow {
  entryId: string;
  label: string;
}

export interface Question {
  id: string;
  entryId: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: ChoiceOption[];
  rows?: GridRow[];
  scale?: { min: number; max: number; lowLabel?: string; highLabel?: string };
  date?: { includeTime: boolean; includeYear: boolean };
  time?: { isDuration: boolean };
}

export interface Section {
  title: string;
  description?: string;
  questionIds: string[];
}

export interface FormSchema {
  formId: string;
  title: string;
  description?: string;
  questions: Question[];
  sections: Section[];
  multiPage: boolean;
  fbzx?: string;
}

export interface DateValue {
  year?: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
}
export interface TimeValue {
  hour: number;
  minute: number;
}
export interface OtherValue {
  other: string;
}

export type FieldValue =
  | string
  | number
  | string[]
  | (string | OtherValue)[]
  | OtherValue
  | DateValue
  | TimeValue
  | Record<string, string | string[]>
  | null
  | undefined;

export type FormValues = Record<string, FieldValue>;
