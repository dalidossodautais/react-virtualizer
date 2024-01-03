> React components for virtualization handling.<br/>
> Smaller alternative to react-virtualized with spacing handled.

# Getting started

Install `@dalidossodautais/react-virtualizer` using npm.

```shell
npm install @dalidossodautais/react-virtualizer
```

Install `@dalidossodautais/react-virtualizer` using yarm.

```shell
yarn add @dalidossodautais/react-virtualizer
```

Install `@dalidossodautais/react-virtualizer` using pnpm.

```shell
pnpm install @dalidossodautais/react-virtualizer
```

Once you have installed the package, you can import it into your React component and use it to create virtualized lists.

# Usage

Here is an example of how to use the react-virtualizer package to create a virtualized grid of items:

```javascript
import React from "react";
import { VirtualizedGrid } from "@dalidossodautais/react-virtualizer";

const MyComponent = () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "250px" }}>
      <h4>A virtualized grid</h4>
      <div style={{ flexGrow: 1 }}>
        <VirtualizedGrid columnCount={3} rowHeight="50px" spacing="15px">
          {items.map((item, index) => (
            <div key={index}>Item {item}</div>
          ))}
        </VirtualizedGrid>
      </div>
    </div>
  );
};
```

This code will create a grid of items that will be rendered efficiently, even if there are a large number of items.
