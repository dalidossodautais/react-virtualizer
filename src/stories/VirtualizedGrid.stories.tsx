import styled from "@emotion/styled";
import type { Meta, StoryObj } from "@storybook/react";

import VirtualizedGrid, { VirtualizedGridChildProps } from "../components/VirtualizedGrid";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: VirtualizedGrid,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "VirtualizedGrid",
} satisfies Meta<typeof VirtualizedGrid>;

type Story = StoryObj<typeof meta>;

const Item = styled("div")({
  border: "black solid 2px",
  boxSizing: "border-box",
  height: "100%",
  width: "100%",
});

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
const Primary: Story = {
  args: {
    Child: ({ index }: VirtualizedGridChildProps) => <Item>Item {index + 1}</Item>,
    columnCount: 3,
    columnSpacing: "5px",
    height: "300px",
    rowHeight: "30px",
    rowSpacing: "2px",
    size: 1000000,
    width: "300px",
  },
};

export { Primary };
export default meta;
