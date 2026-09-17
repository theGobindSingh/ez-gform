# @ez-gform/types

The TypeScript types shared by every ez-gform package: `FormSchema`,
`Question`, `FormValues`, `FieldValue`, `SubmitResult` and friends. Types
only, no runtime code.

You rarely need to install this yourself: `@ez-gform/react` and
`@ez-gform/core` re-export the types you'll use.

```ts
import type { FormSchema, FormValues } from "@ez-gform/types";
```
