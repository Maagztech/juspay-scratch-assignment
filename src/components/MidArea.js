
import React from "react";

const blockColors = {
  move: "#4C97FF",
  changeX: "#4C97FF",
  changeY: "#4C97FF",
  turn: "#4C97FF",
  goto: "#4C97FF",
  say: "#9966FF",
  think: "#9966FF",
  repeat: "#FFAB19",
  repeatForever: "#FFAB19",
};

const inputClass =
  "min-w-0 rounded-full border border-black/10 bg-white px-2 py-1 text-center text-xs font-medium text-gray-800 outline-none transition focus:ring-2 focus:ring-white/80";

function NumberInput({
  value = 0,
  onChange,
  width = "w-14",
  label = "Number",
}) {
  return (
    <input
      type="number"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      onDragStart={(event) => event.preventDefault()}
      className={`${inputClass} ${width}`}
    />
  );
}

function TextInput({ value = "", onChange, label = "Text" }) {
  return (
    <input
      type="text"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onDragStart={(event) => event.preventDefault()}
      className={`${inputClass} w-28`}
    />
  );
}

function ActionButton({ children, onClick, label, danger = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`inline-flex h-7 items-center justify-center rounded-md px-2 text-xs font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white hover:bg-black/25 ${danger ? "opacity-75 hover:opacity-100" : "bg-black/10"
        }`}
    >
      {children}
    </button>
  );
}

function DropZone({ onDropBlock, repeatId, compact = false }) {
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const type = event.dataTransfer.getData("blockType");
    if (type) {
      onDropBlock(type, repeatId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/80 text-gray-400 transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-500 ${compact ? "min-h-9 px-3 py-2 text-xs" : "min-h-36 p-6 text-sm"
        }`}
    >
      <span className="flex items-center gap-2">
        <span className="text-lg leading-none">+</span>
        {compact ? "Drop a block here" : "Drag blocks here to build a script"}
      </span>
    </div>
  );
}

function BlockShell({ type, children, onDeleteBlock, onRunBlock, block }) {
  const color = blockColors[type] || "#64748b";
  const isControl = type === "repeat" || type === "repeatForever";

  return (
    <div
      className="group relative mb-1 w-fit min-w-[210px] max-w-full select-none text-white shadow-sm transition-shadow hover:shadow-md"
      style={{
        backgroundColor: color,
        borderRadius: isControl ? "7px 7px 3px 3px" : "6px",
        border: "1px solid rgba(0,0,0,0.12)",
      }}
    >
      {/* Top connector */}
      <span
        aria-hidden="true"
        className="absolute -top-[4px] left-4 h-[5px] w-7 rounded-t-sm"
        style={{
          backgroundColor: color,
          borderTop: "1px solid rgba(0,0,0,0.12)",
        }}
      />

      <div className="flex min-h-10 flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2.5 text-sm font-medium">
        {children}

        <div className="ml-auto flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
          <ActionButton
            label={`Run ${type} block`}
            onClick={() => onRunBlock(block)}
          >
            ▶
          </ActionButton>
          <ActionButton
            label={`Delete ${type} block`}
            danger
            onClick={() => onDeleteBlock(block.id)}
          >
            ×
          </ActionButton>
        </div>
      </div>

      {/* Bottom connector */}
      <span
        aria-hidden="true"
        className="absolute -bottom-[4px] left-4 h-[5px] w-7 rounded-b-sm"
        style={{
          backgroundColor: color,
          borderBottom: "1px solid rgba(0,0,0,0.12)",
        }}
      />
    </div>
  );
}

function ControlBlock({
  block,
  patch,
  onUpdateBlock,
  onDeleteBlock,
  onDropBlock,
  onRunBlock,
}) {
  const isForever = block.type === "repeatForever";
  const children = block.children || [];

  return (
    <div
      className="relative mb-2 w-fit max-w-full rounded-t-lg pb-3 pr-3 text-white shadow-sm"
      style={{
        backgroundColor: blockColors[block.type],
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "7px 7px 3px 3px",
      }}
    >
      <div className="flex min-h-10 flex-wrap items-center gap-2 px-3 py-2.5 text-sm font-medium">
        <span>{isForever ? "forever" : "repeat"}</span>

        {!isForever && (
          <>
            <NumberInput
              label="Repeat count"
              value={block.times ?? 10}
              onChange={(times) => patch({ times })}
            />
            <span>times</span>
          </>
        )}

        <div className="ml-auto flex items-center gap-1 opacity-70 transition-opacity hover:opacity-100">
          <ActionButton
            label={`Run ${isForever ? "forever" : "repeat"} block`}
            onClick={() => onRunBlock(block)}
          >
            ▶
          </ActionButton>
          <ActionButton
            label="Delete control block"
            danger
            onClick={() => onDeleteBlock(block.id)}
          >
            ×
          </ActionButton>
        </div>
      </div>

      {/* Nested script area */}
      <div
        className="ml-3 mr-1 rounded-r-md border-l-4 border-white/40 py-2 pl-3 pr-1 sm:ml-5 sm:pl-4"
        style={{ backgroundColor: "rgba(0,0,0,0.07)" }}
      >
        <div className="flex flex-col items-start gap-2">
          {children.map((child) => (
            <ScriptBlock
              key={child.id}
              block={child}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onDropBlock={onDropBlock}
              onRunBlock={onRunBlock}
            />
          ))}

          <div className="w-full pr-1">
            <DropZone
              onDropBlock={onDropBlock}
              repeatId={block.id}
              compact
            />
          </div>
        </div>
      </div>

      {/* Open-ended control-block bottom */}
      <div
        aria-hidden="true"
        className="absolute -bottom-[5px] left-5 h-2 w-8 rounded-b-sm"
        style={{ backgroundColor: blockColors[block.type] }}
      />
    </div>
  );
}

function ScriptBlock({
  block,
  onUpdateBlock,
  onDeleteBlock,
  onDropBlock,
  onRunBlock,
}) {
  const patch = (changes) => onUpdateBlock(block.id, changes);

  if (block.type === "repeat" || block.type === "repeatForever") {
    return (
      <ControlBlock
        block={block}
        patch={patch}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        onDropBlock={onDropBlock}
        onRunBlock={onRunBlock}
      />
    );
  }

  return (
    <BlockShell
      type={block.type}
      block={block}
      onDeleteBlock={onDeleteBlock}
      onRunBlock={onRunBlock}
    >
      {block.type === "move" && (
        <>
          <span>move</span>
          <NumberInput
            label="Steps"
            value={block.steps ?? 10}
            onChange={(steps) => patch({ steps })}
          />
          <span>steps</span>
        </>
      )}

      {block.type === "changeX" && (
        <>
          <span>change x by</span>
          <NumberInput
            label="Change X by"
            value={block.steps ?? 10}
            onChange={(steps) => patch({ steps })}
          />
        </>
      )}

      {block.type === "changeY" && (
        <>
          <span>change y by</span>
          <NumberInput
            label="Change Y by"
            value={block.steps ?? 10}
            onChange={(steps) => patch({ steps })}
          />
        </>
      )}

      {block.type === "turn" && (
        <>
          <span>turn ↻</span>
          <NumberInput
            label="Turn degrees"
            value={block.degrees ?? 15}
            onChange={(degrees) => patch({ degrees })}
          />
          <span>degrees</span>
        </>
      )}

      {block.type === "goto" && (
        <>
          <span>go to x:</span>
          <NumberInput
            label="X coordinate"
            value={block.x ?? 0}
            onChange={(x) => patch({ x })}
          />
          <span>y:</span>
          <NumberInput
            label="Y coordinate"
            value={block.y ?? 0}
            onChange={(y) => patch({ y })}
          />
        </>
      )}

      {block.type === "say" && (
        <>
          <span>say</span>
          <TextInput
            label="Speech text"
            value={block.text ?? "Hello!"}
            onChange={(text) => patch({ text })}
          />
          <span>for</span>
          <NumberInput
            label="Speech duration in seconds"
            value={block.seconds ?? 2}
            onChange={(seconds) => patch({ seconds })}
          />
          <span>seconds</span>
        </>
      )}

      {block.type === "think" && (
        <>
          <span>think</span>
          <TextInput
            label="Thought text"
            value={block.text ?? "Hmm..."}
            onChange={(text) => patch({ text })}
          />
          <span>for</span>
          <NumberInput
            label="Thought duration in seconds"
            value={block.seconds ?? 2}
            onChange={(seconds) => patch({ seconds })}
          />
          <span>seconds</span>
        </>
      )}
    </BlockShell>
  );
}

export default function MidArea({
  sprite,
  onDropBlock,
  onUpdateBlock,
  onDeleteBlock,
  onRunBlock,
}) {
  const script = sprite?.script || [];

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f9f9fb]">
      {/* Workspace header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Scripts
          </div>
          <h2 className="truncate text-lg font-bold text-gray-800">
            {sprite?.name || "Untitled sprite"}
          </h2>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
            {script.length} {script.length === 1 ? "block" : "blocks"}
          </span>
        </div>
      </header>

      {/* Script canvas */}
      <section
        aria-label="Script workspace"
        className="relative flex-1 overflow-auto"
        style={{
          backgroundColor: "#fafafa",
          backgroundImage:
            "radial-gradient(#d9dce2 0.8px, transparent 0.8px)",
          backgroundSize: "16px 16px",
        }}
      >
        <div className="min-h-full min-w-0 p-5 sm:p-7">
          {script.length === 0 ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white text-3xl shadow-sm">
                🧩
              </div>
              <h3 className="text-sm font-semibold text-gray-700">
                Your script starts here
              </h3>
              <p className="mt-2 max-w-xs text-center text-xs leading-5 text-gray-400">
                Drag a block from the palette into this workspace, or click a
                block to add it.
              </p>
              <div className="mt-5 w-full max-w-md">
                <DropZone onDropBlock={onDropBlock} />
              </div>
            </div>
          ) : (
            <div className="flex min-h-full flex-col items-start gap-2">
              {script.map((block) => (
                <ScriptBlock
                  key={block.id}
                  block={block}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onDropBlock={onDropBlock}
                  onRunBlock={onRunBlock}
                />
              ))}

              <div className="mt-2 w-full max-w-md">
                <DropZone onDropBlock={onDropBlock} compact />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}