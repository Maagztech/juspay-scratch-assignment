import React, { useRef, useState } from "react";
import CatSprite from "./CatSprite";

function Bubble({ bubble }) {
  if (!bubble || !bubble.text) return null;
  const isThink = bubble.kind === "think";

  return (
    <div
      className={`absolute left-16 -top-8 max-w-32 px-3 py-2 text-xs text-gray-800 bg-white border-2 border-gray-200 shadow-md rounded-xl z-10 ${isThink ? "rounded-full" : ""
        }`}
    >
      {bubble.text}
      <span
        className={`absolute -bottom-2 left-5 h-3 w-3 bg-white border-r-2 border-b-2 border-gray-200 transform rotate-45 ${isThink ? "rounded-full" : ""
          }`}
      />
    </div>
  );
}

function StageSprite({ sprite, selected, collided, onSelectSprite, onStartDrag }) {
  return (
    <button
      onMouseDown={(event) => onStartDrag(event, sprite.id)}
      onClick={() => onSelectSprite(sprite.id)}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none cursor-move transition-all duration-150 rounded-2xl ${selected ? "ring-4 ring-blue-400/60 bg-blue-50/60" : "hover:bg-blue-50/40"
        } ${collided ? "animate-pulse" : ""}`}
      style={{
        left: `calc(50% + ${sprite.x}px)`,
        top: `calc(50% - ${sprite.y}px)`,
        width: `${80 * (sprite.size ?? 1)}px`,
        height: `${80 * (sprite.size ?? 1)}px`,
      }}
      title={sprite.name}
    >
      <Bubble bubble={sprite.bubble} />
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `rotate(${sprite.direction - 90}deg) scale(${sprite.size ?? 1})`,
          filter: `hue-rotate(${sprite.hue}deg)`,
          transformOrigin: "center",
        }}
      >
        <CatSprite />
      </div>
    </button>
  );
}

export default function PreviewArea({
  sprites,
  selectedSpriteId,
  isPlaying,
  collisionPair,
  onSelectSprite,
  onAddSprite,
  onDeleteSprite,
  onUpdateSprite,
  onPlay,
  onStop,
}) {
  const stageRef = useRef(null);
  const [draggingSpriteId, setDraggingSpriteId] = useState(null);

  const updateFromPointer = (event, spriteId) => {
    const rect = stageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = rect.height / 2 - (event.clientY - rect.top);

    onUpdateSprite(spriteId, {
      x: Math.max(-210, Math.min(210, Math.round(x))),
      y: Math.max(-150, Math.min(150, Math.round(y))),
    });
  };

  const handleStartDrag = (event, spriteId) => {
    event.preventDefault();
    onSelectSprite(spriteId);
    setDraggingSpriteId(spriteId);
    updateFromPointer(event, spriteId);
  };

  const handleMove = (event) => {
    if (!draggingSpriteId) return;
    updateFromPointer(event, draggingSpriteId);
  };

  const handleStopDrag = () => setDraggingSpriteId(null);

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 bg-white shadow-sm">
        <button
          onClick={onPlay}
          className="inline-flex items-center justify-center gap-2 min-w-[105px] bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg border border-green-700 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M8 5.5a1 1 0 0 1 1.5-.86l10 6a1 1 0 0 1 0 1.72l-10 6A1 1 0 0 1 8 17.5v-12Z" />
          </svg>
          Play
        </button>

        <button
          onClick={onStop}
          className="inline-flex items-center justify-center gap-2 min-w-[105px] bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg border border-red-700 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
          </svg>
          Stop
        </button>


        <button
          onClick={onAddSprite}
          className="ml-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200"
        >
          + Add Sprite
        </button>
      </div>

      {/* Stage */}
      <div className="p-5">
        <div
          ref={stageRef}
          onMouseMove={handleMove}
          onMouseUp={handleStopDrag}
          onMouseLeave={handleStopDrag}
          className="relative h-80 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden select-none"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50" />

          {/* Stage grid */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #dbeafe 1px, transparent 1px), linear-gradient(to bottom, #dbeafe 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-sky-200 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-sky-200 pointer-events-none" />

          {sprites.map((sprite) => (
            <StageSprite
              key={sprite.id}
              sprite={sprite}
              selected={sprite.id === selectedSpriteId}
              collided={collisionPair.includes(sprite.id)}
              onSelectSprite={onSelectSprite}
              onStartDrag={handleStartDrag}
            />
          ))}

          {collisionPair.length > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm">
              <span>⚡</span>
              Collision: animations swapped
            </div>
          )}

          {sprites.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
              <span className="text-3xl mb-2">🐱</span>
              <p className="text-sm font-medium">Your stage is empty</p>
              <p className="text-xs mt-1">Add a sprite to get started</p>
            </div>
          )}

          <div className="absolute bottom-3 right-3 text-[10px] font-medium tracking-wide text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-100 pointer-events-none">
            STAGE
          </div>
        </div>
      </div>

      {/* Sprite list */}
      <div className="px-5 pb-5 overflow-y-auto flex-1 min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Sprites</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {sprites.length} {sprites.length === 1 ? "sprite" : "sprites"} on stage
            </p>
          </div>

          <div
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${isPlaying
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
            />
            {isPlaying ? "Animating" : "Ready"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {sprites.map((sprite) => (
            <div
              key={sprite.id}
              onClick={() => onSelectSprite(sprite.id)}
              className={`p-3.5 bg-white border rounded-2xl cursor-pointer transition-all duration-200 ${sprite.id === selectedSpriteId
                ? "border-blue-400 ring-2 ring-blue-100 shadow-md"
                : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`font-semibold text-sm flex-1 truncate ${sprite.id === selectedSpriteId
                    ? "text-blue-700"
                    : "text-slate-700"
                    }`}
                >
                  {sprite.name}
                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteSprite(sprite.id);
                  }}
                  disabled={sprites.length === 1}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${sprites.length === 1
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <label className="min-w-0">
                  <span className="font-medium">X position</span>
                  <input
                    type="number"
                    value={Math.round(sprite.x)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onUpdateSprite(sprite.id, {
                        x: Number(event.target.value) || 0,
                      })
                    }
                    className="mt-1.5 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="min-w-0">
                  <span className="font-medium">Y position</span>
                  <input
                    type="number"
                    value={Math.round(sprite.y)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onUpdateSprite(sprite.id, {
                        y: Number(event.target.value) || 0,
                      })
                    }
                    className="mt-1.5 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="min-w-0">
                  <span className="font-medium">Direction</span>
                  <input
                    type="number"
                    value={Math.round(sprite.direction)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      onUpdateSprite(sprite.id, {
                        direction: Number(event.target.value) || 0,
                      })
                    }
                    className="mt-1.5 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="min-w-0 col-span-2">
                  <div className="flex items-center justify-between"><span className="font-medium">Size</span><span className="text-slate-600 font-semibold">{Number(sprite.size ?? 1).toFixed(1)}x</span></div>
                  <input
                    type="range"
                    min="0.25"
                    max="3"
                    step="0.1"
                    value={Number(sprite.size ?? 1)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      const nextSize = Number(event.target.value);
                      onUpdateSprite(sprite.id, { size: Number.isFinite(nextSize) ? nextSize : 1 });
                    }}
                    className="mt-2 w-full accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0.25"
                    max="3"
                    step="0.1"
                    value={Number(sprite.size ?? 1).toFixed(1)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      const raw = Number(event.target.value);
                      const nextSize = Number.isFinite(raw) ? raw : 1;
                      onUpdateSprite(sprite.id, {
                        size: Math.max(0.25, Math.min(3, nextSize)),
                      });
                    }}
                    className="mt-2 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}