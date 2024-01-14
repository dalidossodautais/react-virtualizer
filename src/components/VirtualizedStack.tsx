import { CSSProperties, FC } from "react";

import VirtualizedGrid, { VirtualizedGridChildProps as VirtualizedStackChildProps } from "./VirtualizedGrid";

interface VirtualizedStackProps {
  /**
   * Child component.
   */
  Child: FC<VirtualizedStackChildProps>;
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;
  /**
   * The total height of the component.
   */
  height?: string;
  /**
   * Maximum number of rows.
   */
  maxRowPrintedCount?: number;
  /**
   * Minimum number of rows.
   */
  minRowPrintedCount?: number;
  /**
   * Reduce number of loads.
   */
  optimized?: boolean;
  /**
   * The height of rows.
   */
  rowHeight: string;
  /**
   * Number of rows.
   */
  rowPrintedCount?: number;
  /**
   * The number of children.
   */
  size: number;
  /**
   * The style of the inner wrapper.
   */
  spacing?: string;
  /**
   * The spacing between columns and rows.
   */
  style?: CSSProperties;
  /**
   * The total width of the component.
   */
  width?: string;
}

const VirtualizedStack: FC<VirtualizedStackProps> = ({
  Child,
  className,
  height,
  maxRowPrintedCount,
  minRowPrintedCount,
  optimized,
  rowHeight,
  rowPrintedCount,
  size,
  spacing,
  style,
  width,
}) => (
  <VirtualizedGrid
    Child={Child}
    className={className}
    columnCount={1}
    height={height}
    maxRowPrintedCount={maxRowPrintedCount}
    minRowPrintedCount={minRowPrintedCount}
    optimized={optimized}
    rowHeight={rowHeight}
    rowPrintedCount={rowPrintedCount}
    size={size}
    spacing={spacing}
    style={style}
    width={width}
  />
);

VirtualizedStack.defaultProps = {
  className: undefined,
  height: undefined,
  maxRowPrintedCount: undefined,
  minRowPrintedCount: undefined,
  optimized: undefined,
  rowPrintedCount: undefined,
  spacing: undefined,
  style: undefined,
  width: undefined,
};

export type { VirtualizedStackChildProps, VirtualizedStackProps };
export default VirtualizedStack;
