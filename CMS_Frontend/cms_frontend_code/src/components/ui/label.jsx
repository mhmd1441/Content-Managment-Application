import * as React from "react";

export const Label = React.forwardRef(function Label(
  { className = "", ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={"text-sm font-medium text-neutral-300 " + className}
      {...props}
    />
  );
});
