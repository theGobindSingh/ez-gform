import { submitForm } from "@ez-gform/core";
import type { FieldValue, FormValues, SubmitResult } from "@ez-gform/types";
import type { FormEvent, RefObject } from "react";
import { useCallback } from "react";

export type EasyFieldType =
  "text" | "radio" | "textarea" | "checkbox" | "date" | "dropdown" | "time";

export interface EasyFormLink {
  entryId: string;
  formId: string;
  type: EasyFieldType;
}

export interface EasyExtraEntry {
  entryId: string;
  value: string;
}

export interface UseEasyGoogleFormOptions {
  formRef: RefObject<HTMLFormElement | null>;
  gFormId: string;
  links: EasyFormLink[];
  extraEntries?: EasyExtraEntry[];
  onSubmitExtra?: (event?: FormEvent<HTMLElement>) => void;
}

/** CSS.escape isn't available in every environment (older jsdom); this is a conservative fallback. */
const escapeSelector = (id: string): string => {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/([ #.;?%&,+*~':"!^$[\]()=>|/\\])/g, "\\$1");
};

const byId = (root: ParentNode, id: string): Element | null => {
  return root.querySelector(`#${escapeSelector(id)}`);
};

const namedInputsIn = (
  container: Element,
  name: string,
): HTMLInputElement[] => {
  return Array.from(container.querySelectorAll("input")).filter((el) => {
    return el.name === name;
  });
};

const readNamedNumber = (
  container: Element,
  name: string,
): number | undefined => {
  const el = Array.from(container.querySelectorAll("input, select")).find(
    (candidate) => {
      return (candidate as HTMLInputElement).name === name;
    },
  ) as HTMLInputElement | HTMLSelectElement | undefined;
  if (!el || el.value === "") return undefined;
  const n = Number(el.value);
  return Number.isNaN(n) ? undefined : n;
};

const readValue = (formEl: HTMLFormElement, link: EasyFormLink): FieldValue => {
  switch (link.type) {
    case "text":
    case "textarea":
    case "dropdown": {
      const el = byId(formEl, link.formId) as
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      return el ? el.value : "";
    }
    case "radio": {
      const container = byId(formEl, link.formId);
      if (!container) return "";
      const checked = namedInputsIn(container, link.formId).find((el) => {
        return el.checked;
      });
      return checked ? checked.value : "";
    }
    case "checkbox": {
      const container = byId(formEl, link.formId);
      if (!container) return [];
      return namedInputsIn(container, link.formId)
        .filter((el) => {
          return el.checked;
        })
        .map((el) => {
          return el.value;
        });
    }
    case "date": {
      const container = byId(formEl, link.formId);
      if (!container) return null;
      const year = readNamedNumber(container, "year");
      const month = readNamedNumber(container, "month");
      const day = readNamedNumber(container, "day");
      return {
        ...(year !== undefined ? { year } : {}),
        month: month ?? 0,
        day: day ?? 0,
      };
    }
    case "time": {
      const container = byId(formEl, link.formId);
      if (!container) return null;
      const hour = readNamedNumber(container, "hour");
      const minute = readNamedNumber(container, "minute");
      return { hour: hour ?? 0, minute: minute ?? 0 };
    }
    default:
      return "";
  }
};

/**
 * @deprecated Matches the legacy `use-easy-google-form` `formRef`/`gFormId`/
 * `links` DOM-scraping API so existing consumers can migrate by changing only
 * the import. New code should use `useGoogleForm`, which takes a plain
 * controlled-values object instead of reading the DOM by id, and exposes a
 * real `status` state machine. Unlike the legacy hook, the returned
 * `onSubmit` resolves with the `SubmitResult` instead of firing-and-forgetting.
 */
export function useEasyGoogleForm(
  options: UseEasyGoogleFormOptions,
): (event?: FormEvent<HTMLFormElement>) => Promise<SubmitResult> {
  const { formRef, gFormId, links, extraEntries, onSubmitExtra } = options;

  return useCallback(
    async (event?: FormEvent<HTMLFormElement>): Promise<SubmitResult> => {
      event?.preventDefault?.();

      const values: FormValues = {};
      const formEl = formRef.current;

      if (formEl) {
        for (const link of links) {
          values[link.entryId] = readValue(formEl, link);
        }
      }

      for (const extra of extraEntries ?? []) {
        values[extra.entryId] = extra.value;
      }

      onSubmitExtra?.(event);

      return submitForm(gFormId, values);
    },
    [formRef, gFormId, links, extraEntries, onSubmitExtra],
  );
}

export default useEasyGoogleForm;
