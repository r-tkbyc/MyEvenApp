# @jappyjan/even-realities-ui
Foundation UI package for building apps on the Even Realities Hub, aligned to Even Realities design guidelines.

## Install

```sh
npm install @jappyjan/even-realities-ui
```

## Usage

```tsx
import { Button } from '@jappyjan/even-realities-ui';
import { IconBase } from '@jappyjan/even-realities-ui/icons';
```

Make sure to load the base styles once in your app (tokens, typography, utilities):

```tsx
import '@jappyjan/even-realities-ui/styles.css';
```

## Entry points

- `@jappyjan/even-realities-ui` (recommended default)
- `@jappyjan/even-realities-ui/components`
- `@jappyjan/even-realities-ui/icons`
- `@jappyjan/even-realities-ui/tokens`

## Peer dependencies

Make sure your app provides compatible React versions:

- `react` ^19
- `react-dom` ^19

## Design guidelines

- Components should consume shared tokens (colors, spacing, typography) rather than hardcoding values.
- Icons should come from the curated set in this package.
