import * as React from "react";

export const Switch = React.forwardRef(function Switch(
  { checked = false, onCheckedChange, disabled = false, className = "", ...props },
  ref
) {
  const toggle = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  const onKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      ref={ref}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={
        `relative inline-flex h-6 w-11 items-center rounded-full border transition-all
         focus:outline-none focus:ring-2 focus:ring-emerald-500/50
         ${checked ? "bg-emerald-600 border-emerald-500" : "bg-neutral-800 border-neutral-700"}
         ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110"} ` + className
      }
      {...props}
    >
      <span
        className={
          "inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform " +
          (checked ? "translate-x-5" : "translate-x-1")
        }
      />
    </button>
  );
});

Switch.displayName = "Switch";
