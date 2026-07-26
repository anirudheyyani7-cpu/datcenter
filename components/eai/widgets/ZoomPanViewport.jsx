'use client';
import { useRef, useState } from 'react';

// Controlled pan/zoom wrapper for 2D diagrams (site plans, floor stacks, floor
// schematics). Zoom/offset state lives in the parent so it can be shared with
// a minimap and toolbar buttons. Drag-to-pan and wheel-to-zoom (toward the
// cursor) are handled here; clicks/double-clicks on children still fire
// normally since panning only engages once the mouse actually moves.
export default function ZoomPanViewport({ zoom, offset, onOffsetChange, onWheelZoom, children, style }) {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    onWheelZoom?.(delta, { x: e.clientX, y: e.clientY }, containerRef.current?.getBoundingClientRect());
  }

  function handleMouseDown(e) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset };
    setDragging(true);
  }

  function handleMouseMove(e) {
    if (!dragRef.current) return;
    const { startX, startY, origin } = dragRef.current;
    onOffsetChange?.({ x: origin.x + (e.clientX - startX), y: origin.y + (e.clientY - startY) });
  }

  function endDrag() {
    dragRef.current = null;
    setDragging(false);
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', ...style }}
    >
      <div
        style={{
          width: '100%', height: '100%',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
