# Using muffin components

Install the `muf` CLI:

```sh
npm install -g @muffin/cli
```

**Verify:**

```sh
muf --version
```

## Quick Reference

| Command | What it does |
|---------|-------------|
| `muf list` | List all available components |
| `muf search <query>` | Search components by name, description or tags |
| `muf info <component>` | Show manifest, attributes, and usage examples |
| `muf add <component>` | Copy a component into your project |

## Commands

### `muf list`

Browse all components available in the registry.

```sh
muf list
```

### `muf search <query>`

Search components by name, description or tags.

```sh
muf search editor
muf search dialog
```

### `muf info <component>`

Show the full manifest for a component — attributes, PostOffice interfaces, usage examples.

```sh
muf info json-editor
muf info confirm-dialog
```

### `muf add <component>`

Copy a component from the registry into your project. Defaults to `./src/components`.

```sh
muf add json-editor
muf add confirm-dialog --dir ./src/components/utils
```

The component source is copied directly into your project — you own it and can modify it freely.

### Updating a component

Re-run `muf add` to pull the latest version from the registry:

```sh
muf add json-editor
```
