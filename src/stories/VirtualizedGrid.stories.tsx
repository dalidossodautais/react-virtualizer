import type { Meta, StoryObj } from "@storybook/react";

import VirtualizedGrid from "../components/VirtualizedGrid";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "VirtualizedGrid",
  component: VirtualizedGrid,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof VirtualizedGrid>;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
const Primary: Story = {
  args: {
    children: [...Array(5000)].map((_item, index) => <div>Item {index + 1}</div>),
    columnCount: 3,
    height: "300px",
    rowHeight: "30px",
    width: "300px",
  },
};

export { Primary };
export default meta;
