import { FC } from "react";

import VirtualizedGrid, {
  VirtualizedGridProps,
  VirtualizedGridChildProps as VirtualizedStackChildProps,
} from "./VirtualizedGrid";

interface VirtualizedStackProps
  extends Omit<VirtualizedGridProps, "columnCount" | "columnSpacing" | "columnWidth" | "rowSpacing"> {
  /**
   * The spacing between rows.
   */
  spacing?: string;
}

const VirtualizedStack: FC<VirtualizedStackProps> = ({ ...props }) => <VirtualizedGrid columnCount={1} {...props} />;

VirtualizedStack.defaultProps = {
  spacing: undefined,
};

export type { VirtualizedStackChildProps, VirtualizedStackProps };
export default VirtualizedStack;
