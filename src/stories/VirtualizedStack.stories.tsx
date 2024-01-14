import styled from "@emotion/styled";
import type { Meta, StoryObj } from "@storybook/react";

import VirtualizedStack, { VirtualizedStackChildProps } from "../components/VirtualizedStack";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: VirtualizedStack,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "VirtualizedStack",
} satisfies Meta<typeof VirtualizedStack>;

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
    Child: ({ index }: VirtualizedStackChildProps) => <Item>Item {index + 1}</Item>,
    height: "300px",
    rowHeight: "30px",
    size: 1000000,
    spacing: "5px",
    width: "300px",
  },
};

export { Primary };
export default meta;
