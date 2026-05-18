# Contributing a Component

Anyone can contribute a component to the muffin registry by opening a pull request. No separate repo needed — just add your component folder and manifest entry directly here.

## Component structure

Each component lives in `components/<component-name>/`:

```
components/
  my-component/
    index.js          ← required — main component file
    helper.js         ← optional — any additional files the component needs
    styles.css        ← optional
```

### `index.js` must:
- Define a class extending `Muffin.DOMComponent`
- Set `static domElName` 
- Call `export default MyComponent` at the bottom

Minimal example:

```js
class MyComponent extends Muffin.DOMComponent {
    static domElName = "my-component";

    static markupFunc(data, uid, uiVars) {
        return `<div>${uiVars.text}</div>`;
    }

    constructor() {
        super();
        this.uiVars.text = this.getAttribute("text") || "";
    }
}

export default MyComponent;
```

## Manifest entry

Add an entry for your component in `registry.json` under `components`:

```json
{
  "components": {
    "my-component": {
      "domElName": "my-component",
      "description": "one line description of what it does",
      "cdn": "https://cdn.jsdelivr.net/gh/FootLooseLabs/muffin-components/components/my-component/index.js",
      "import": "@muffin/components/components/my-component/index.js",
      "attributes": {
        "text": "string — content to display"
      },
      "usage": [
        {
          "label": "minimal",
          "code": "<my-component></my-component>"
        },
        {
          "label": "with attributes",
          "code": "<my-component text=\"hello\"></my-component>"
        }
      ]
    }
  }
}
```

### Manifest fields

| Field | Required | Description |
|-------|----------|-------------|
| `domElName` | yes | the custom HTML element tag name |
| `description` | yes | one line — what does it do |
| `cdn` | no | jsDelivr URL for direct script tag usage |
| `import` | no | ES module import path |
| `schema` | no | component data shape if it uses `Muffin.DataSource` |
| `attributes` | no | HTML attributes the component reads |
| `advertiseAs` | no | PostOffice interface name if component advertises one |
| `lexicon` | no | messages the component accepts on its advertised interface |
| `emits` | no | PostOffice messages the component dispatches outward (`:::` notation) |
| `listens` | no | PostOffice interfaces the component subscribes to (`\|\|\|` notation) |
| `usage` | no | array of `{ label, code }` usage examples — first entry must be minimal working usage |

## Submitting

1. Fork this repo
2. Add your component folder under `components/`
3. Add your manifest entry to `registry.json`
4. Open a pull request with a brief description of what the component does

## Guidelines

- Component must work standalone — no undeclared dependencies on other components unless listed in the manifest
- `index.js` must be self-contained or explicitly import its siblings
- `domElName` must be unique across the registry — check `registry.json` before picking a name
- First `usage` entry must work with zero configuration — just the bare tag
