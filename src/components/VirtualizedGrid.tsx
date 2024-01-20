import styled from "@emotion/styled";
import { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { v4 as uuidv4 } from "uuid";

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
  noWarning?: boolean;
  /**
   * Hide warning logs.
   */
  performance?: boolean;
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

const OuterWrapper = styled("div")();

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
  noWarning,
  performance,
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
  const [calculatedRowHeight, setCalculatedRowHeight] = useState<number>(0);
  const [calculatedColumnWidth, setCalculatedColumnWidth] = useState<number>(0);
  const [calculatedRowSpacing, setCalculatedRowSpacing] = useState<number>(0);
  const [calculatedColumnSpacing, setCalculatedColumnSpacing] = useState<number>(0);
  const [startingX, setStartingX] = useState<number>(0);
  const [startingY, setStartingY] = useState<number>(0);
  const [endingX, setEndingX] = useState<number>(0);
  const [endingY, setEndingY] = useState<number>(0);

  const rowCount = useMemo(() => Math.ceil(size / columnCount), [columnCount, size]);

  const columnSpacing = useMemo(() => rawColumnSpacing ?? spacing ?? "0px", [rawColumnSpacing, spacing]);
  const rowSpacing = useMemo(() => rawRowSpacing ?? spacing ?? "0px", [rawRowSpacing, spacing]);

  const getColumn = useCallback((index: number) => index % columnCount, [columnCount]);
  const getRow = useCallback((index: number) => Math.floor(index / columnCount), [columnCount]);

  const children = useMemo(() => {
    if (!(endingY - startingY) || !(endingX - startingX)) {
      return null;
    }
    return [...Array(endingY - startingY)].flatMap((_valueY, indexY) =>
      [...Array(endingX - startingX)].map((_valueX, indexX) => {
        const index = (startingY + indexY) * columnCount + (startingX + indexX);
        if (index < size) {
          return (
            <ChildWrapper
              key={uuidv4()}
              data-testid={`child-wrapper-${index}`}
              style={{
                height: calculatedRowHeight,
                left: getColumn(index) * (calculatedColumnWidth + calculatedColumnSpacing),
                top: getRow(index) * (calculatedRowHeight + calculatedRowSpacing),
                width: calculatedColumnWidth,
              }}
            >
              <Child index={index} />
            </ChildWrapper>
          );
        }
        return null;
      }),
    );
  }, [
    Child,
    calculatedColumnSpacing,
    calculatedColumnWidth,
    calculatedRowHeight,
    calculatedRowSpacing,
    columnCount,
    endingX,
    endingY,
    getColumn,
    getRow,
    size,
    startingX,
    startingY,
  ]);

  const load = useCallback(() => {
    const wrapperRefCurrent = wrapperRef.current;
    const fakeChildRefCurrent = fakeChildRef.current;
    const fakeSpacingRefCurrent = fakeSpacingRef.current;
    if (wrapperRefCurrent && fakeChildRefCurrent && fakeSpacingRefCurrent) {
      const newCalculatedWrapperHeight = wrapperRefCurrent.clientHeight;
      const newCalculatedWrapperWidth = wrapperRefCurrent.clientWidth;
      const newCalculatedRowSpacing = fakeSpacingRefCurrent.clientHeight;
      const newCalculatedColumnSpacing = fakeSpacingRefCurrent.clientWidth;
      const newCalculatedRowHeight = fakeChildRefCurrent.clientHeight;
      const newCalculatedColumnWidth = columnWidth
        ? fakeChildRefCurrent.clientWidth
        : (newCalculatedWrapperWidth - (columnCount - 1) * newCalculatedColumnSpacing) / columnCount;
      if (!noWarning && !wasErrorShown.current && (!newCalculatedWrapperHeight || !newCalculatedWrapperWidth)) {
        console.warn(new Error("Invalid dimensions: Height and/or width are 0."));
        wasErrorShown.current = true;
      }
      setCalculatedRowHeight(newCalculatedRowHeight);
      setCalculatedColumnWidth(newCalculatedColumnWidth);
      setCalculatedRowSpacing(newCalculatedRowSpacing);
      setCalculatedColumnSpacing(newCalculatedColumnSpacing);
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

      setStartingX(
        Math.floor(
          (wrapperRefCurrent.scrollLeft + calculatedColumnSpacing) /
            (newCalculatedColumnWidth + calculatedColumnSpacing),
        ),
      );
      setStartingY(
        Math.floor(
          (wrapperRefCurrent.scrollTop + newCalculatedRowSpacing) / (newCalculatedRowHeight + newCalculatedRowSpacing),
        ),
      );
      setEndingX(
        Math.ceil(
          (wrapperRefCurrent.scrollLeft + newCalculatedWrapperWidth) /
            (newCalculatedColumnWidth + newCalculatedColumnSpacing),
        ),
      );
      setEndingY(
        Math.ceil(
          (wrapperRefCurrent.scrollTop + newCalculatedWrapperHeight) /
            (newCalculatedRowHeight + newCalculatedRowSpacing),
        ),
      );
    }
  }, [calculatedColumnSpacing, columnCount, columnWidth, noWarning, rowCount]);

  const loadOptimized = useCallback(() => {
    if (performance) {
      startTransition(load);
    } else {
      load();
    }
  }, [load, performance]);

  const resizeObserver = useMemo(() => new ResizeObserver(loadOptimized), [loadOptimized]);

  useEffect(() => {
    const wrapperRefCurrent = wrapperRef.current;
    if (wrapperRefCurrent) {
      wrapperRefCurrent.addEventListener("scroll", loadOptimized);
      resizeObserver.observe(wrapperRefCurrent);
      return () => {
        wrapperRefCurrent.removeEventListener("scroll", loadOptimized);
        resizeObserver.unobserve(wrapperRefCurrent);
      };
    }
    return undefined;
  }, [loadOptimized, resizeObserver]);

  useEffect(() => {
    loadOptimized();
  }, [loadOptimized]);

  useEffect(() => {
    const wrapperRefCurrent = wrapperRef.current;
    if (wrapperRefCurrent) {
      wrapperRefCurrent.scrollTop = 0;
    }
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
  noWarning: false,
  performance: false,
  rowPrintedCount: undefined,
  rowSpacing: undefined,
  spacing: undefined,
  style: undefined,
  width: undefined,
};

export type { VirtualizedGridChildProps, VirtualizedGridProps };
export default VirtualizedGrid;
