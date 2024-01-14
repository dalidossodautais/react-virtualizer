import styled from "@emotion/styled";
import { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

interface VirtualizedGridChildProps {
  index: number;
}

interface VirtualizedGridProps {
  /**
   * Child component.
   */
  Child: FC<VirtualizedGridChildProps>;
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;
  /**
   * The number of columns on each row.
   */
  columnCount: number;
  /**
   * The spacing between columns.
   */
  columnSpacing?: string;
  /**
   * The width of columns.
   */
  columnWidth?: string;
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
   * Number of rows.
   */
  rowPrintedCount?: number;
  /**
   * The spacing between rows.
   */
  rowSpacing?: string;
  /**
   * The height of rows.
   */
  rowHeight: string;
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

const OuterWrapper = styled("div")({
  height: "100%",
  width: "100%",
});

const InnerWrapper = styled("div")({
  height: "100%",
  overflow: "scroll",
  position: "relative",
  width: "100%",
});

const ChildWrapper = styled("div")({
  position: "absolute",
});

const FakeElement = styled("div")({
  position: "absolute",
  visibility: "hidden",
});

const VirtualizedGrid: FC<VirtualizedGridProps> = ({
  Child,
  className,
  columnCount,
  columnSpacing: rawColumnSpacing,
  columnWidth,
  height,
  maxRowPrintedCount,
  minRowPrintedCount,
  optimized,
  rowHeight,
  rowPrintedCount,
  rowSpacing: rawRowSpacing,
  size,
  spacing,
  style,
  width,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fakeChildRef = useRef<HTMLDivElement>(null);
  const fakeSpacingRef = useRef<HTMLDivElement>(null);

  const wasErrorShown = useRef<boolean>(false);

  const [, startTransition] = useTransition();

  const [overflowY, setOverflowY] = useState<"hidden" | undefined>(undefined);
  const [overflowX, setOverflowX] = useState<"hidden" | undefined>(undefined);
  const [calculatedWrapperHeight, setCalculatedWrapperHeight] = useState<number>(0);
  const [calculatedWrapperWidth, setCalculatedWrapperWidth] = useState<number>(0);
  const [calculatedRowHeight, setCalculatedRowHeight] = useState<number>(0);
  const [calculatedColumnWidth, setCalculatedColumnWidth] = useState<number>(0);
  const [calculatedRowSpacing, setCalculatedRowSpacing] = useState<number>(0);
  const [calculatedColumnSpacing, setCalculatedColumnSpacing] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const rowCount = useMemo(() => Math.ceil(size / columnCount), [columnCount, size]);

  const columnSpacing = useMemo(() => rawColumnSpacing ?? spacing ?? "0px", [rawColumnSpacing, spacing]);
  const rowSpacing = useMemo(() => rawRowSpacing ?? spacing ?? "0px", [rawRowSpacing, spacing]);

  const getColumn = useCallback((index: number) => index % columnCount, [columnCount]);
  const getRow = useCallback((index: number) => Math.floor(index / columnCount), [columnCount]);

  const children = useMemo(() => {
    if (!calculatedWrapperHeight || !calculatedWrapperWidth) {
      return null;
    }
    const startingX = Math.floor(
      (scrollLeft + calculatedColumnSpacing) / (calculatedColumnWidth + calculatedColumnSpacing),
    );
    const startingY = Math.floor((scrollTop + calculatedRowSpacing) / (calculatedRowHeight + calculatedRowSpacing));
    const endingX = Math.ceil(
      (scrollLeft + calculatedWrapperWidth) / (calculatedColumnWidth + calculatedColumnSpacing),
    );
    const endingY = Math.ceil((scrollTop + calculatedWrapperHeight) / (calculatedRowHeight + calculatedRowSpacing));
    return [...Array(endingY - startingY)].flatMap((_valueY, indexY) =>
      [...Array(endingX - startingX)].map((_valueX, indexX) => {
        const index = (startingY + indexY) * columnCount + (startingX + indexX);
        return (
          <ChildWrapper
            key={index}
            data-testid={`child-wrapper-${index}`}
            style={{
              height: calculatedRowHeight,
              left: getColumn(index) * (calculatedColumnWidth + calculatedColumnSpacing),
              top: getRow(index) * (calculatedRowHeight + calculatedRowSpacing),
              width: calculatedColumnWidth,
            }}
          >
            {index < size && <Child index={index} />}
          </ChildWrapper>
        );
      }),
    );
  }, [
    calculatedColumnSpacing,
    calculatedColumnWidth,
    calculatedRowHeight,
    calculatedRowSpacing,
    calculatedWrapperHeight,
    calculatedWrapperWidth,
    columnCount,
    Child,
    getColumn,
    getRow,
    scrollLeft,
    scrollTop,
    size,
  ]);

  const load = useCallback(() => {
    const wrapperRefCurrent = wrapperRef.current as HTMLDivElement;
    const fakeChildRefCurrent = fakeChildRef.current as HTMLDivElement;
    const fakeSpacingRefCurrent = fakeSpacingRef.current as HTMLDivElement;
    const newCalculatedWrapperHeight = wrapperRefCurrent.clientHeight;
    const newCalculatedWrapperWidth = wrapperRefCurrent.clientWidth;
    const newCalculatedRowSpacing = fakeSpacingRefCurrent.clientHeight;
    const newCalculatedColumnSpacing = fakeSpacingRefCurrent.clientWidth;
    const newCalculatedRowHeight = fakeChildRefCurrent.clientHeight;
    const newCalculatedColumnWidth = columnWidth
      ? fakeChildRefCurrent.clientWidth
      : (newCalculatedWrapperWidth - (columnCount - 1) * newCalculatedColumnSpacing) / columnCount;
    if (!wasErrorShown.current && (!newCalculatedWrapperHeight || !newCalculatedWrapperWidth)) {
      console.error(new Error("Invalid dimensions: Height and/or width are 0."));
      wasErrorShown.current = true;
    }
    setCalculatedWrapperHeight(newCalculatedWrapperHeight);
    setCalculatedWrapperWidth(newCalculatedWrapperWidth);
    setCalculatedRowHeight(newCalculatedRowHeight);
    setCalculatedColumnWidth(newCalculatedColumnWidth);
    setCalculatedRowSpacing(newCalculatedRowSpacing);
    setCalculatedColumnSpacing(newCalculatedColumnSpacing);
    setScrollTop(wrapperRefCurrent.scrollTop);
    setScrollLeft(wrapperRefCurrent.scrollLeft);
    setOverflowY(
      newCalculatedRowHeight * rowCount + newCalculatedRowSpacing * (rowCount - 1) <= newCalculatedWrapperHeight
        ? "hidden"
        : undefined,
    );
    setOverflowX(
      !columnWidth ||
        newCalculatedColumnWidth * columnCount + newCalculatedColumnSpacing * (columnCount - 1) <=
          newCalculatedWrapperWidth
        ? "hidden"
        : undefined,
    );
  }, [columnCount, columnWidth, rowCount]);

  const loadOptimized = useCallback(() => {
    if (optimized) {
      startTransition(load);
    } else {
      load();
    }
  }, [load, optimized]);

  const resizeObserver = useMemo(() => new ResizeObserver(loadOptimized), [loadOptimized]);

  useEffect(() => {
    const wrapperRefCurrent: HTMLDivElement = wrapperRef.current as HTMLDivElement;
    wrapperRefCurrent.addEventListener("scroll", loadOptimized);
    resizeObserver.observe(wrapperRefCurrent);
    return () => {
      wrapperRefCurrent.removeEventListener("scroll", loadOptimized);
      resizeObserver.unobserve(wrapperRefCurrent);
    };
  }, [loadOptimized, resizeObserver]);

  useEffect(() => {
    loadOptimized();
  }, [loadOptimized]);

  useEffect(() => {
    const wrapperRefCurrent = wrapperRef.current as HTMLDivElement;
    wrapperRefCurrent.scrollTop = 0;
  }, [Child, size]);

  return (
    <OuterWrapper data-testid="outer-wrapper" style={{ height, width }}>
      <InnerWrapper
        ref={wrapperRef}
        className={className}
        data-testid="inner-wrapper"
        style={{
          height: rowPrintedCount
            ? `calc(${rowPrintedCount} * ${rowHeight} + ${rowPrintedCount - 1} * ${rowSpacing})`
            : undefined,
          maxHeight: maxRowPrintedCount
            ? `calc(${maxRowPrintedCount} * ${rowHeight} + ${maxRowPrintedCount - 1} * ${rowSpacing})`
            : undefined,
          minHeight: minRowPrintedCount
            ? `calc(${minRowPrintedCount} * ${rowHeight} + ${minRowPrintedCount - 1} * ${rowSpacing})`
            : undefined,
          overflowX,
          overflowY,
          ...style,
        }}
      >
        <FakeElement
          data-testid="fake-wrapper"
          style={{
            height: `calc(${rowHeight} * ${rowCount} + ${rowSpacing} * ${rowCount - 1})`,
            width: columnWidth
              ? `calc(${columnWidth} * ${columnCount} + ${columnSpacing} * ${columnCount - 1})`
              : "100%",
          }}
        />
        <FakeElement ref={fakeChildRef} data-testid="fake-child" style={{ height: rowHeight, width: columnWidth }} />
        <FakeElement
          ref={fakeSpacingRef}
          data-testid="fake-spacing"
          style={{ height: rowSpacing, width: columnSpacing }}
        />
        {children}
      </InnerWrapper>
    </OuterWrapper>
  );
};

VirtualizedGrid.defaultProps = {
  className: undefined,
  columnSpacing: undefined,
  columnWidth: undefined,
  height: undefined,
  maxRowPrintedCount: undefined,
  minRowPrintedCount: undefined,
  optimized: undefined,
  rowPrintedCount: undefined,
  rowSpacing: undefined,
  spacing: undefined,
  style: undefined,
  width: undefined,
};

export type { VirtualizedGridChildProps, VirtualizedGridProps };
export default VirtualizedGrid;
