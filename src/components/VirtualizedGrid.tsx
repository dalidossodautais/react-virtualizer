import styled from "@emotion/styled";
import { CSSProperties, Children, FC, ReactElement, useCallback, useEffect, useMemo, useRef } from "react";

interface VirtualizedGridProps {
  /**
   * The content of the component.
   */
  children: ReactElement[];
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
   * The spacing between rows.
   */
  rowSpacing?: string;
  /**
   * The height of rows.
   */
  rowHeight: string;
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
  children,
  className,
  columnCount,
  columnSpacing: rawColumnSpacing,
  columnWidth,
  height,
  rowSpacing: rawRowSpacing,
  rowHeight,
  spacing,
  style,
  width,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wasErrorShown = useRef<boolean>(false);

  const rowCount = useMemo(() => Math.ceil(Children.count(children) / columnCount), [children, columnCount]);

  const columnSpacing = useMemo(() => rawColumnSpacing ?? spacing ?? "0px", [rawColumnSpacing, spacing]);
  const rowSpacing = useMemo(() => rawRowSpacing ?? spacing ?? "0px", [rawRowSpacing, spacing]);

  const getColumn = useCallback((index: number) => index % columnCount, [columnCount]);
  const getRow = useCallback((index: number) => Math.floor(index / columnCount), [columnCount]);

  const showChild = useCallback(() => {
    const wrapperRefCurrent = wrapperRef.current;
    if (wrapperRefCurrent) {
      const childrenArray = Array.from(wrapperRefCurrent.children);
      const [fakeChild, fakeSpacing] = childrenArray.splice(-3);
      const { clientHeight: calculatedWrapperHeight, clientWidth: calculatedWrapperWidth } = wrapperRefCurrent;
      if (!wasErrorShown.current && (!calculatedWrapperHeight || !calculatedWrapperWidth)) {
        console.error(new Error("Invalid dimensions: Height and/or width are 0."));
        wasErrorShown.current = true;
      }
      const { clientHeight: calculatedRowHeight } = fakeChild;
      let { clientWidth: calculatedColumnWidth } = fakeChild;
      const { clientHeight: calculatedRowSpacing, clientWidth: calculatedColumnSpacing } = fakeSpacing;
      calculatedColumnWidth = (calculatedWrapperWidth - (columnCount - 1) * calculatedColumnSpacing) / columnCount;
      if (!columnWidth) {
        childrenArray.forEach((child: any, index) => {
          child.style.width = `${calculatedColumnWidth}px`;
          child.style.left = `${getColumn(index) * (calculatedColumnWidth + calculatedRowSpacing)}px`;
        });
      }
      childrenArray.forEach((child: any, index) => {
        child.hidden =
          wrapperRefCurrent.scrollLeft + calculatedWrapperWidth <=
            getColumn(index) * (calculatedColumnWidth + calculatedColumnSpacing) ||
          wrapperRefCurrent.scrollLeft >
            getColumn(index) * (calculatedColumnWidth + calculatedColumnSpacing) + calculatedColumnWidth ||
          wrapperRefCurrent.scrollTop + calculatedWrapperHeight <=
            getRow(index) * (calculatedRowHeight + calculatedRowSpacing) ||
          wrapperRefCurrent.scrollTop >
            getRow(index) * (calculatedRowHeight + calculatedRowSpacing) + calculatedRowHeight;
        if (!columnWidth) {
          child.style.width = `${
            (calculatedWrapperWidth - (columnCount - 1) * calculatedColumnSpacing) / columnCount
          }px`;
        }
      });
    }
  }, [columnCount, columnWidth, getColumn, getRow]);

  const resizeObserver = useMemo(() => new ResizeObserver(showChild), [showChild]);

  useEffect(() => {
    const wrapperRefCurrent = wrapperRef.current;
    if (wrapperRefCurrent) {
      wrapperRefCurrent.addEventListener("scroll", showChild);
      resizeObserver.observe(wrapperRefCurrent);
      return () => {
        wrapperRefCurrent.removeEventListener("scroll", showChild);
        resizeObserver.unobserve(wrapperRefCurrent);
      };
    }
    return () => null;
  }, [resizeObserver, showChild]);

  useEffect(() => {
    showChild();
  }, [children, showChild]);

  return (
    <OuterWrapper style={{ height, width }} data-testid="outer-wrapper">
      <InnerWrapper className={className} ref={wrapperRef} style={style} data-testid="inner-wrapper">
        {Children.map(children, (child, index) => (
          <ChildWrapper
            hidden
            style={{
              height: rowHeight,
              left: `calc(${getColumn(index)} * (${columnWidth} + ${columnSpacing}))`,
              top: `calc(${getRow(index)} * (${rowHeight} + ${rowSpacing}))`,
              width: columnWidth,
            }}
            data-testid={`child-wrapper-${index}`}
          >
            {child}
          </ChildWrapper>
        ))}
        <FakeElement style={{ height: rowHeight, width: columnWidth }} data-testid="fake-wrapper" />
        <FakeElement style={{ height: rowSpacing, width: columnSpacing }} data-testid="fake-spacing" />
        <FakeElement
          style={{
            height: `calc(${rowHeight} * ${rowCount} + ${rowSpacing} * ${rowCount - 1})`,
            width: columnWidth
              ? `calc(${columnWidth} * ${columnCount} + ${columnSpacing} * ${columnCount - 1})`
              : "100%",
          }}
          data-testid="fake-child"
        />
      </InnerWrapper>
    </OuterWrapper>
  );
};

VirtualizedGrid.defaultProps = {
  className: undefined,
  columnSpacing: undefined,
  columnWidth: undefined,
  height: undefined,
  rowSpacing: undefined,
  spacing: undefined,
  style: undefined,
  width: undefined,
};

export type { VirtualizedGridProps };
export default VirtualizedGrid;
