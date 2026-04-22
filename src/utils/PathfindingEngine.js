/**
 * SENTINEL-X A* Pathfinding Engine
 * Optimized for sub-second rerouting in 3D building twins.
 */

export class PathfindingEngine {
  constructor(width, height, floors) {
    this.width = width;
    this.height = height;
    this.floors = floors;
    this.grid = this._initGrid();
  }

  _initGrid() {
    const grid = [];
    for (let f = 0; f < this.floors; f++) {
      grid[f] = [];
      for (let y = 0; y < this.height; y++) {
        grid[f][y] = [];
        for (let x = 0; x < this.width; x++) {
          grid[f][y][x] = { x, y, f, weight: 1, blocked: false };
        }
      }
    }
    return grid;
  }

  setBlocked(x, y, f, blocked = true) {
    if (this._isValid(x, y, f)) {
      this.grid[f][y][x].blocked = blocked;
    }
  }

  findPath(startPos, endPos) {
    const startNode = this.grid[startPos.f][startPos.y][startPos.x];
    const endNode = this.grid[endPos.f][endPos.y][endPos.x];

    const openSet = [startNode];
    const closedSet = new Set();
    
    const cameFrom = new Map();
    const gScore = new Map(); // Cost from start to current node
    const fScore = new Map(); // Estimated total cost

    const nodeKey = (n) => `${n.f}-${n.y}-${n.x}`;

    gScore.set(nodeKey(startNode), 0);
    fScore.set(nodeKey(startNode), this._heuristic(startNode, endNode));

    while (openSet.length > 0) {
      // Get node in openSet with lowest fScore
      let current = openSet.reduce((min, node) => 
        (fScore.get(nodeKey(node)) < fScore.get(nodeKey(min))) ? node : min
      );

      if (current === endNode) {
        return this._reconstructPath(cameFrom, current);
      }

      openSet.splice(openSet.indexOf(current), 1);
      closedSet.add(nodeKey(current));

      for (const neighbor of this._getNeighbors(current)) {
        if (closedSet.has(nodeKey(neighbor)) || neighbor.blocked) continue;

        // Add additional cost for busy grid points (crude stampede risk)
        const densityWeight = neighbor.occupiedCount ? neighbor.occupiedCount * 2 : 0;
        const tentativeGScore = gScore.get(nodeKey(current)) + neighbor.weight + densityWeight;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= gScore.get(nodeKey(neighbor))) {
          continue;
        }

        cameFrom.set(nodeKey(neighbor), current);
        gScore.set(nodeKey(neighbor), tentativeGScore);
        fScore.set(nodeKey(neighbor), tentativeGScore + this._heuristic(neighbor, endNode));
      }
    }

    return null; // Path not found
  }

  _heuristic(a, b) {
    // Manhattan distance across floors
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.f - b.f) * 10;
  }

  _getNeighbors(node) {
    const neighbors = [];
    const dirs = [
      { x: 1, y: 0, f: 0 }, { x: -1, y: 0, f: 0 },
      { x: 0, y: 1, f: 0 }, { x: 0, y: -1, f: 0 },
      { x: 0, y: 0, f: 1 }, { x: 0, y: 0, f: -1 } // Floor transition (stairs/lifts)
    ];

    for (const d of dirs) {
      const nx = node.x + d.x;
      const ny = node.y + d.y;
      const nf = node.f + d.f;
      if (this._isValid(nx, ny, nf)) {
        neighbors.push(this.grid[nf][ny][nx]);
      }
    }
    return neighbors;
  }

  _isValid(x, y, f) {
    return f >= 0 && f < this.floors && y >= 0 && y < this.height && x >= 0 && x < this.width;
  }

  _reconstructPath(cameFrom, current) {
    const path = [current];
    const nodeKey = (n) => `${n.f}-${n.y}-${n.x}`;
    while (cameFrom.has(nodeKey(current))) {
      current = cameFrom.get(nodeKey(current));
      path.unshift(current);
    }
    return path;
  }
}
