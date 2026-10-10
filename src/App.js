import React, { useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

const blockDefaults = {
  move: { steps: 10 },
  changeX: { steps: 10 },
  changeY: { steps: 10 },
  turn: { degrees: 15 },
  goto: { x: 0, y: 0 },
  say: { text: "Hello!", seconds: 2 },
  think: { text: "Hmm...", seconds: 2 },
  repeat: { times: 10, children: [{ id: "starter-move", type: "move", steps: 10 }] },
  repeatForever: { children: [{ id: "starter-move", type: "move", steps: 10 }] },
};

const makeBlock = (type, overrides = {}) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  ...JSON.parse(JSON.stringify(blockDefaults[type] || {})),
  ...overrides,
});

const makeSprite = (number) => ({
  id: `sprite-${Date.now()}-${number}`,
  name: `Sprite ${number}`,
  x: number === 1 ? -120 : 120,
  y: number === 1 ? 0 : number === 2 ? 0 : 70 - number * 20,
  direction: 90,
  bubble: null,
  bubbleUntil: 0,
  hue: (number - 1) * 70,
  size: 1,
  script:
    number === 1
      ? [
        {
          id: `repeatForever-${Date.now()}-${number}`,
          type: "repeatForever",
          children: [{ id: `move-default-${Date.now()}-${number}`, type: "move", steps: 10 }],
        },
      ]
      : number === 2
        ? [
          {
            id: `repeatForever-${Date.now()}-${number}`,
            type: "repeatForever",
            children: [{ id: `move-default-${Date.now()}-${number}`, type: "move", steps: -10 }],
          },
        ]
        : [],
});

const flattenScript = (blocks) =>
  blocks.flatMap((block) => {
    if (block.type === "repeat") {
      const children = flattenScript(block.children || []);
      return Array.from({ length: Math.max(0, Number(block.times) || 0) }, () =>
        children.map((child) => ({ ...child }))
      ).flat();
    }
    if (block.type === "repeatForever") {
      const children = flattenScript(block.children || []);
      return Array.from({ length: 10000 }, () =>
        children.map((child) => ({ ...child }))
      ).flat();
    }
    return [{ ...block }];
  });

const expandForAnimation = (blocks) =>
  flattenScript(blocks).flatMap((block) => {
    if (block.type === "move" || block.type === "changeX" || block.type === "changeY") {
      const steps = Number(block.steps) || 0;
      const frameCount = Math.max(1, Math.min(40, Math.abs(Math.round(steps))));
      const frameSteps = steps / frameCount;
      return Array.from({ length: frameCount }, () => ({ ...block, steps: frameSteps }));
    }

    if (block.type === "turn") {
      const degrees = Number(block.degrees) || 0;
      const frameCount = Math.max(1, Math.min(30, Math.abs(Math.round(degrees))));
      const frameDegrees = degrees / frameCount;
      return Array.from({ length: frameCount }, () => ({ ...block, degrees: frameDegrees }));
    }

    return [block];
  });

const updateBlockTree = (blocks, blockId, updater) =>
  blocks.map((block) => {
    if (block.id === blockId) return updater(block);
    if (block.type === "repeat" || block.type === "repeatForever") {
      return { ...block, children: updateBlockTree(block.children || [], blockId, updater) };
    }
    return block;
  });

const appendToRepeat = (blocks, repeatId, newBlock) =>
  blocks.map((block) => {
    if (block.id === repeatId && (block.type === "repeat" || block.type === "repeatForever")) {
      return { ...block, children: [...(block.children || []), newBlock] };
    }
    if (block.type === "repeat" || block.type === "repeatForever") {
      return { ...block, children: appendToRepeat(block.children || [], repeatId, newBlock) };
    }
    return block;
  });

const deleteBlockTree = (blocks, blockId) =>
  blocks
    .filter((block) => block.id !== blockId)
    .map((block) =>
      block.type === "repeat" || block.type === "repeatForever"
        ? { ...block, children: deleteBlockTree(block.children || [], blockId) }
        : block
    );

const normalizeAngle = (degrees) => {
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
};

const asNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const runBlock = (sprite, block) => {
  const next = { ...sprite, bubble: Date.now() < sprite.bubbleUntil ? sprite.bubble : null };

  if (block.type === "move") {
    const radians = (next.direction * Math.PI) / 180;
    const steps = asNumber(block.steps, 0);
    next.x += Math.sin(radians) * steps;
    next.y += Math.cos(radians) * steps;
  }
  if (block.type === "changeX") {
    next.x += asNumber(block.steps, 0);
  }
  if (block.type === "changeY") {
    next.y += asNumber(block.steps, 0);
  }
  if (block.type === "turn") {
    next.direction = normalizeAngle(next.direction + asNumber(block.degrees, 0));
  }
  if (block.type === "goto") {
    next.x = asNumber(block.x, sprite.x);
    next.y = asNumber(block.y, sprite.y);
  }
  if (block.type === "say" || block.type === "think") {
    const text = typeof block.text === "string" ? block.text : "";
    next.bubble = { kind: block.type, text };
    next.bubbleUntil = Date.now() + Math.max(0.2, asNumber(block.seconds, 1)) * 1000;
  }

  next.x = Math.max(-210, Math.min(210, next.x));
  next.y = Math.max(-150, Math.min(150, next.y));
  return next;
};

const spritesCollide = (a, b) => {
  const spriteSizeA = 80 * (Number(a.size) || 1);
  const spriteSizeB = 80 * (Number(b.size) || 1);
  const halfWidthA = spriteSizeA / 2;
  const halfHeightA = spriteSizeA / 2;
  const halfWidthB = spriteSizeB / 2;
  const halfHeightB = spriteSizeB / 2;

  return (
    Math.abs(a.x - b.x) < halfWidthA + halfWidthB &&
    Math.abs(a.y - b.y) < halfHeightA + halfHeightB
  );
};

export default function App() {
  const [sprites, setSprites] = useState([makeSprite(1), makeSprite(2)]);
  const [selectedSpriteId, setSelectedSpriteId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [collisionPair, setCollisionPair] = useState([]);
  const runnerRef = useRef(null);
  const spritesRef = useRef(sprites);
  spritesRef.current = sprites;

  const selectedId = selectedSpriteId || sprites[0].id;
  const selectedSprite = useMemo(
    () => sprites.find((sprite) => sprite.id === selectedId) || sprites[0],
    [selectedId, sprites]
  );

  const updateSelectedScript = (updater) => {
    setSprites((current) =>
      current.map((sprite) =>
        sprite.id === selectedId ? { ...sprite, script: updater(sprite.script) } : sprite
      )
    );
  };

  const addBlock = (type, repeatId, blockConfig = {}) => {
    const block = makeBlock(type, blockConfig);
    updateSelectedScript((script) => (repeatId ? appendToRepeat(script, repeatId, block) : [...script, block]));
  };

  const updateBlock = (blockId, changes) => {
    updateSelectedScript((script) =>
      updateBlockTree(script, blockId, (block) => ({ ...block, ...changes }))
    );
  };

  const updateSprite = (spriteId, changes) => {
    setSprites((current) =>
      current.map((sprite) => (sprite.id === spriteId ? { ...sprite, ...changes } : sprite))
    );
  };

  const deleteBlock = (blockId) => {
    updateSelectedScript((script) => deleteBlockTree(script, blockId));
  };

  const clearBubbleAfterDelay = (spriteId, seconds) => {
    const clearAt = Date.now() + Math.max(0.2, Number(seconds) || 0) * 1000;
    window.setTimeout(() => {
      setSprites((current) =>
        current.map((sprite) =>
          sprite.id === spriteId && sprite.bubbleUntil <= clearAt + 50
            ? { ...sprite, bubble: null, bubbleUntil: 0 }
            : sprite
        )
      );
    }, Math.max(0.2, Number(seconds) || 0) * 1000);
  };

  const runBlocksForSelectedSprite = (blocks) => {
    const queue = flattenScript(blocks);
    if (queue.length === 0) return;

    const runNext = () => {
      const nextBlock = queue.shift();
      if (!nextBlock) return;

      setSprites((current) =>
        current.map((sprite) =>
          sprite.id === selectedId ? runBlock(sprite, nextBlock) : sprite
        )
      );
      if (nextBlock.type === "say" || nextBlock.type === "think") {
        clearBubbleAfterDelay(selectedId, nextBlock.seconds);
      }

      if (queue.length > 0) window.setTimeout(runNext, 260);
    };

    runNext();
  };

  const addSprite = () => {
    const nextNumber = Array.from({ length: sprites.length + 1 }, (_, index) => index + 1).find(
      (candidate) => !sprites.some((sprite) => sprite.name === `Sprite ${candidate}`)
    ) || sprites.length + 1;
    const next = makeSprite(nextNumber);
    setSprites((current) => [...current, next]);
    setSelectedSpriteId(next.id);
  };

  const deleteSprite = (spriteId) => {
    setSprites((current) => {
      if (current.length === 1) return current;
      const remaining = current.filter((sprite) => sprite.id !== spriteId);
      if (selectedId === spriteId) setSelectedSpriteId(remaining[0].id);
      return remaining;
    });
  };

  const stopPlayback = () => {
    if (runnerRef.current) window.clearTimeout(runnerRef.current);
    runnerRef.current = null;
    setIsPlaying(false);
  };

  const playAll = () => {
    stopPlayback();
    setIsPlaying(true);
    setCollisionPair([]);

    const queues = spritesRef.current.reduce(
      (acc, sprite) => ({ ...acc, [sprite.id]: expandForAnimation(sprite.script) }),
      {}
    );
    const recentCollisionPairs = new Map();

    const step = () => {
      let stillRunning = false;
      const nextSprites = spritesRef.current.map((sprite) => {
        const queue = queues[sprite.id] || [];
        if (queue.length > 0) stillRunning = true;

        const [nextBlock, ...rest] = queue;
        queues[sprite.id] = rest;

        if (nextBlock && (nextBlock.type === "say" || nextBlock.type === "think")) {
          clearBubbleAfterDelay(sprite.id, Number(nextBlock.seconds) || 1);
        }

        return nextBlock ? runBlock(sprite, nextBlock) : { ...sprite, bubble: Date.now() < sprite.bubbleUntil ? sprite.bubble : null };
      });

      setSprites(nextSprites);

      const collisionIds = [];
      const now = Date.now();

      for (let i = 0; i < nextSprites.length; i += 1) {
        for (let j = i + 1; j < nextSprites.length; j += 1) {
          if (!spritesCollide(nextSprites[i], nextSprites[j])) continue;

          const pairKey = [nextSprites[i].id, nextSprites[j].id].sort().join(":");
          const lastCollisionAt = recentCollisionPairs.get(pairKey) || 0;

          if (now - lastCollisionAt < 500) continue;

          recentCollisionPairs.set(pairKey, now);
          collisionIds.push(nextSprites[i].id, nextSprites[j].id);

          const firstId = nextSprites[i].id;
          const secondId = nextSprites[j].id;
          const firstQueue = queues[firstId] || [];
          queues[firstId] = queues[secondId] || [];
          queues[secondId] = firstQueue;
        }
      }

      if (collisionIds.length > 0) {
        setCollisionPair(Array.from(new Set(collisionIds)));
        window.setTimeout(() => setCollisionPair([]), 900);
      }

      if (!stillRunning) {
        stopPlayback();
        return;
      }

      runnerRef.current = window.setTimeout(step, 50);
    };

    step();
  };

  return (
    <div className="lg:h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <div className="h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

        {/* Sidebar */}
        <div className="w-full lg:w-auto shrink-0 bg-white border-b lg:border-b-0 border-gray-200">
          <Sidebar onAddBlock={addBlock} />
        </div>

        {/* MidArea */}
        <div className="w-full flex-1 min-h-[300px] lg:min-h-0 min-w-0 overflow-hidden bg-white border-b lg:border-b-0 lg:border-r border-gray-200">
          <MidArea
            sprite={selectedSprite}
            onDropBlock={addBlock}
            onUpdateBlock={updateBlock}
            onDeleteBlock={deleteBlock}
            onRunBlock={(block) => runBlocksForSelectedSprite([block])}
          />
        </div>

        {/* PreviewArea */}
        <div className="w-full lg:w-2/5 shrink-0 min-h-[400px] lg:min-h-0 overflow-hidden bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
          <PreviewArea
            sprites={sprites}
            selectedSpriteId={selectedId}
            isPlaying={isPlaying}
            collisionPair={collisionPair}
            onSelectSprite={setSelectedSpriteId}
            onAddSprite={addSprite}
            onDeleteSprite={deleteSprite}
            onUpdateSprite={updateSprite}
            onPlay={playAll}
            onStop={stopPlayback}
          />
        </div>

      </div>
    </div>

  );
}
