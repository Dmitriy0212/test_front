"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import css from "./ArticleFilter.module.css";

export type ArticlesFilterValue = "popular" | "all";

interface ArticleFilterProps {
  value: ArticlesFilterValue;
  disabled?: boolean;
  onChange: (filter: ArticlesFilterValue) => void;
}

const FILTER_OPTIONS: Array<{ label: string; value: ArticlesFilterValue }> = [
  { label: "All", value: "all" },
  { label: "Popular", value: "popular" },
];

export default function ArticleFilter({ value, disabled = false, onChange }: ArticleFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const focusOption = (index: number) => {
    optionRefs.current[index]?.focus();
  };

  const openListbox = (optionIndex: number) => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
    window.requestAnimationFrame(() => focusOption(optionIndex));
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    openListbox(event.key === "ArrowDown" ? 0 : FILTER_OPTIONS.length - 1);
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLLIElement>, optionIndex: number) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusOption(event.key === "Home" ? 0 : FILTER_OPTIONS.length - 1);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (optionIndex + direction + FILTER_OPTIONS.length) % FILTER_OPTIONS.length;
      focusOption(nextIndex);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const nextValue = FILTER_OPTIONS[optionIndex].value;
      setIsOpen(false);
      onChange(nextValue);
      triggerRef.current?.focus();
    }
  };

  const handleOptionSelect = (nextValue: ArticlesFilterValue) => {
    setIsOpen(false);
    onChange(nextValue);
    triggerRef.current?.focus();
  };

  const selectedLabel = FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "Popular";

  return (
    <div
      ref={controlRef}
      className={css.control}
      data-open={isOpen}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={css.trigger}
        disabled={disabled}
        aria-label="Filter articles"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedLabel}</span>
        <svg className={css.chevron} viewBox="0 0 10 6" aria-hidden="true">
          <path
            d={isOpen ? "M0.375 4.875L4.875 0.375L9.375 4.875" : "M9.5 0.5L5 5L0.5 0.5"}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul id={listboxId} className={css.listbox} role="listbox" aria-label="Filter articles">
          {FILTER_OPTIONS.map((option, optionIndex) => (
            <li
              key={option.value}
              ref={(element) => {
                optionRefs.current[optionIndex] = element;
              }}
              className={css.option}
              role="option"
              aria-selected={option.value === value}
              tabIndex={0}
              onClick={() => handleOptionSelect(option.value)}
              onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
