import { styled } from "@mui/system";
import { CSSProperties, Children, FC, ReactElement, useCallback, useEffect, useMemo, useRef } from "react";

interface VirtualizedStackProps {
  /**
   * The content of the component.
   */
  children: ReactElement[];
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;
  /**
   * The total height of the component.
   */
  height?: string;
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
  width: "100%",
});

const FakeElement = styled("div")({
  position: "absolute",
  visibility: "hidden",
  width: "100%",
});

const VirtualizedStack: FC<VirtualizedStackProps> = ({
  children,
  className,
  height,
  rowHeight,
  spacing,
  style,
  width,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wasErrorShown = useRef<boolean>(false);

  const rowCount = useMemo(() => Children.count(children), [children]);

  const rowSpacing = useMemo(() => spacing ?? "0px", [spacing]);

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
      const { clientHeight: calculatedRowSpacing } = fakeSpacing;
      childrenArray.forEach((child: any, index) => {
        child.hidden =
          wrapperRefCurrent.scrollTop + calculatedWrapperHeight <=
            index * (calculatedRowHeight + calculatedRowSpacing) ||
          wrapperRefCurrent.scrollTop > index * (calculatedRowHeight + calculatedRowSpacing) + calculatedRowHeight;
      });
    }
  }, []);

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

  return (
    <OuterWrapper style={{ height, width }}>
      <InnerWrapper className={className} ref={wrapperRef} style={style}>
        {Children.map(children, (child, index) => (
          <ChildWrapper style={{ height: rowHeight, top: `calc(${index} * (${rowHeight} + ${rowSpacing}))` }}>
            {child}
          </ChildWrapper>
        ))}
        <FakeElement style={{ height: rowHeight }} />
        <FakeElement style={{ height: rowSpacing }} />
        <FakeElement style={{ height: `calc(${rowHeight} * ${rowCount} + ${rowSpacing} * ${rowCount - 1})` }} />
      </InnerWrapper>
    </OuterWrapper>
  );
};

VirtualizedStack.defaultProps = {
  className: undefined,
  height: undefined,
  spacing: undefined,
  style: undefined,
  width: undefined,
};

export default VirtualizedStack;
