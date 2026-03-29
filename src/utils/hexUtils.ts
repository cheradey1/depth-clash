import { HexCoord } from '../types';

export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function hexAdd(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function hexEqual(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

export function getNeighbors(coord: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map(dir => hexAdd(coord, dir));
}

export function hexToPixel(coord: HexCoord, size: number): { x: number; y: number } {
  // Pointy-topped hex coordinates (rotated 90 degrees from flat-topped)
  const x = size * (Math.sqrt(3) * (coord.q + coord.r / 2));
  const y = size * (3/2 * coord.r);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number): HexCoord {
  const q = (Math.sqrt(3)/3 * x - 1/3 * y) / size;
  const r = (2/3 * y) / size;
  return hexRound(q, r);
}

function hexRound(q: number, r: number): HexCoord {
  let s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
}

export function getGridCoords(width: number, height: number): HexCoord[] {
  const coords: HexCoord[] = [];
  // Generate a staggered grid: even rows have 'width' hexes, odd rows have 'width - 1'
  for (let r = 0; r < height; r++) {
    const rowWidth = r % 2 === 0 ? width : width - 1;
    for (let q_idx = 0; q_idx < rowWidth; q_idx++) {
      // Axial q = col - floor(r/2)
      coords.push({ q: q_idx - Math.floor(r / 2), r });
    }
  }
  return coords;
}

export function isWithinBounds(coord: HexCoord, width: number, height: number): boolean {
  const r = coord.r;
  if (r < 0 || r >= height) return false;
  const qOffset = Math.floor(r / 2);
  const col = coord.q + qOffset;
  const rowWidth = r % 2 === 0 ? width : width - 1;
  return col >= 0 && col < rowWidth;
}
