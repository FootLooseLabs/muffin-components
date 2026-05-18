# muffin-components

The official component registry for the [muffin framework](https://github.com/FootLooseLabs/element). A curated collection of reusable `Muffin.DOMComponent` UI components, installable via the `muf` CLI.

## Usage

Install the `muf` CLI:

```sh
npm install -g @muffin/cli
```

### Find components

```sh
muf list                        # browse all available components
muf search <query>              # search by name or description
muf info <component>            # view manifest, attributes, usage examples
```

### Add a component to your project

```sh
muf add json-editor             # copies into ./src/components by default
muf add json-editor --dir ./src/components/utils
```

The component source is copied directly into your project — you own it, modify it freely.

### Update a component

Re-run `muf add` to pull the latest version from the registry:

```sh
muf add json-editor
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add or update a component.
