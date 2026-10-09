
import React, { useState } from "react";
import Icon from "./Icon";

const categories = [
  { name: "Motion", color: "#4C97FF", icon: "move" },
  { name: "Looks", color: "#9966FF", icon: "eye" },
  { name: "Control", color: "#FFAB19", icon: "repeat" },
];

const blocks = [
  {
    type: "move",
    category: "Motion",
    label: "move",
    value: "10",
    suffix: "steps",
  },
  {
    type: "changeX",
    category: "Motion",
    label: "change x by",
    value: "10",
  },
  {
    type: "changeY",
    category: "Motion",
    label: "change y by",
    value: "10",
  },
  {
    type: "turn",
    category: "Motion",
    label: "turn",
    value: "15",
    suffix: "degrees",
    icon: "redo",
  },
  {
    type: "goto",
    category: "Motion",
    label: "go to x:",
    value: "0",
    secondLabel: "y:",
    secondValue: "0",
  },
  {
    type: "say",
    category: "Looks",
    label: "say",
    value: "Hello!",
    suffix: "for",
    secondValue: "2",
    secondSuffix: "seconds",
  },
  {
    type: "think",
    category: "Looks",
    label: "think",
    value: "Hmm...",
    suffix: "for",
    secondValue: "2",
    secondSuffix: "seconds",
  },
  {
    type: "repeat",
    category: "Control",
    label: "repeat",
    value: "10",
    shape: "c",
  },
  {
    type: "repeatForever",
    category: "Control",
    label: "forever",
    shape: "c",
  },
];

const inputClass =
  "w-12 rounded-full border border-black/10 bg-white px-1.5 py-1 text-center text-xs text-gray-800 outline-none focus:ring-2 focus:ring-white/70";

function BlockShape({ block, color }) {
  return (
    <div
      className="relative w-full select-none rounded-md px-3 py-2.5 text-[13px] font-medium leading-5 text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
      style={{
        backgroundColor: color,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: block.shape === "c" ? "7px 7px 3px 3px" : "6px",
      }}
    >
      {/* Scratch-style top connector */}
      <span
        className="absolute -top-[4px] left-4 h-[5px] w-7 rounded-t-sm"
        style={{
          backgroundColor: color,
          borderTop: "1px solid rgba(0,0,0,0.12)",
        }}
      />

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span>{block.label}</span>

        {block.value !== undefined && (
          <input
            aria-label={`${block.label} value`}
            className={inputClass}
            defaultValue={block.value}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              block.value = e.target.value;
            }}
          />
        )}

        {block.suffix && <span>{block.suffix}</span>}

        {block.secondLabel && <span>{block.secondLabel}</span>}

        {block.secondValue !== undefined && (
          <input
            aria-label={`${block.secondLabel || block.suffix} value`}
            className={inputClass}
            defaultValue={block.secondValue}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              block.secondValue = e.target.value;
            }}
          />
        )}

        {block.secondSuffix && <span>{block.secondSuffix}</span>}

        {block.icon && <Icon name={block.icon} size={14} />}
      </div>

      {block.shape === "c" && (
        <div className="mt-2 h-5 rounded border-l-4 border-r-4 border-t-4 border-white/25" />
      )}

      {/* Bottom connector */}
      <span
        className="absolute -bottom-[4px] left-4 h-[5px] w-7 rounded-b-sm"
        style={{
          backgroundColor: color,
          borderBottom: "1px solid rgba(0,0,0,0.12)",
        }}
      />
    </div>
  );
}

function PaletteBlock({ block, color, onAddBlock }) {
  return (
    <div
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Add ${block.label} block`}
      onClick={() => onAddBlock(block.type)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onAddBlock(block.type);
        }
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData("blockType", block.type);
        event.dataTransfer.setData(
          "application/x-scratch-block",
          JSON.stringify({ type: block.type })
        );
        event.dataTransfer.effectAllowed = "copy";
      }}
      className="cursor-grab px-1 py-1.5 active:cursor-grabbing"
    >
      <BlockShape block={block} color={color} />
    </div>
  );
}

export default function Sidebar({ onAddBlock }) {
  const [activeCategory, setActiveCategory] = useState("Motion");

  const selectedCategory = categories.find(
    (category) => category.name === activeCategory
  );

  const visibleBlocks = blocks.filter(
    (block) => block.category === activeCategory
  );

  return (
    <aside className="flex h-full w-[290px] flex-none flex-col overflow-hidden border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Juspay Scratch</h2>
          <span className="text-xs text-gray-400">Blocks</span>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex gap-1 border-b border-gray-200 px-2 py-3">
        {categories.map((category) => {
          const isActive = activeCategory === category.name;

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => setActiveCategory(category.name)}
              aria-pressed={isActive}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-[11px] font-semibold transition ${isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ backgroundColor: category.color }}
              >
                <Icon name={category.icon} size={17} />
              </span>
              {category.name}
              {isActive && (
                <span
                  className="h-0.5 w-5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Blocks palette */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: selectedCategory.color }}
          >
            {activeCategory} blocks
          </h3>
          <span className="text-[10px] text-gray-400">
            {visibleBlocks.length} blocks
          </span>
        </div>

        <div className="flex flex-col gap-1 pb-3">
          {visibleBlocks.map((block) => (
            <PaletteBlock
              key={block.type}
              block={block}
              color={selectedCategory.color}
              onAddBlock={onAddBlock}
            />
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-600">
            Build your script
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
            Drag blocks into the workspace, or click a block to add it.
          </p>
        </div>
      </div>
    </aside>
  );
}