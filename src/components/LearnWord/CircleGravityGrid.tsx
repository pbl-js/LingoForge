import React, { useState, useEffect, useRef, useCallback } from "react";

// Configurable physics constants
const PHYSICS_CONFIG = {
  DAMPING: 0.95, // Velocity retention (higher = less friction)
  MIN_VELOCITY: 0.01, // Velocity cutoff to prevent micro-movements
  POSITION_ITERATIONS: 3, // Number of iterations for position solving
  MAX_VELOCITY: 8, // Maximum allowed velocity
  GRAVITY_DISTANCE_MIN: 30, // Minimum distance for gravity to take effect
  CIRCLE_SPACING: 1.15, // Spacing multiplier between circles (higher = more space)
  DEFAULT_GRAVITY: 0.02, // Default gravity strength
  BOTTOM_MARGIN: 80, // Bottom margin for physics simulation
};

type Bubble = {
  id: number;
  name: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  mass: number;
  color: string;
  lastCollision: number;
  sleeping: boolean;
  movementEnergy: number;
};

const MusicGenreBubbles = ({
  items,
}: {
  items: { name: string; size: number; color: string }[];
}) => {
  // Use state with initial values to prevent empty initial render
  const [bubbles, setBubbles] = useState<Bubble[]>(() => {
    // Return initial bubbles directly in the state initializer
    return items.map((genre, index) => {
      const radius = genre.size / 2;
      // Start all bubbles in center and let physics spread them out
      return {
        id: index,
        name: genre.name,
        radius,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 2, // Small initial velocity for separation
        vy: (Math.random() - 0.5) * 2,
        ax: 0,
        ay: 0,
        mass: radius * 0.05,
        color: genre.color,
        lastCollision: 0,
        sleeping: false,
        movementEnergy: 0,
      };
    });
  });

  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef(0);
  const [draggedBubble, setDraggedBubble] = useState<number | null>(null);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const bubblesRef = useRef(bubbles);

  // Physics settings
  const gravityStrength = PHYSICS_CONFIG.DEFAULT_GRAVITY;

  // Update dimensions on mount and resize
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      setDimensions({ width, height });

      // Instantly position bubbles based on new dimensions
      setBubbles((prevBubbles) => {
        return prevBubbles.map((bubble) => ({
          ...bubble,
          x: Math.random() * (width - bubble.radius * 2) + bubble.radius,
          y: Math.random() * (height - bubble.radius * 2) + bubble.radius,
        }));
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setDimensions({ width, height });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(requestRef.current || 0);
    };
  }, []);

  // Update bubblesRef when bubbles state changes
  useEffect(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);

  // Apply forces to bubbles (gravity, etc.)
  const applyForces = useCallback(
    (bubbles: Bubble[], deltaTime: number) => {
      const timeScale = Math.min(deltaTime / 16.67, 2);
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      bubbles.forEach((bubble) => {
        if (bubble.id === draggedBubble) {
          bubble.ax = 0;
          bubble.ay = 0;
          return;
        }

        bubble.ax = 0;
        bubble.ay = 0;

        const dx = centerX - bubble.x;
        const dy = centerY - bubble.y;
        const distanceSquared = dx * dx + dy * dy;

        if (
          distanceSquared >
          PHYSICS_CONFIG.GRAVITY_DISTANCE_MIN * PHYSICS_CONFIG.GRAVITY_DISTANCE_MIN
        ) {
          const distance = Math.sqrt(distanceSquared);

          const gravityFactor = Math.min(1, distance / 200);
          const gravityForce = gravityStrength * bubble.mass * gravityFactor * timeScale;

          bubble.ax += (dx / distance) * gravityForce;
          bubble.ay += (dy / distance) * gravityForce;
        }
      });
    },
    [dimensions, draggedBubble, gravityStrength]
  );

  // Integrate physics (update velocities and positions)
  const integrate = useCallback(
    (bubbles: Bubble[], deltaTime: number) => {
      const timeScale = Math.min(deltaTime / 16.67, 2);

      bubbles.forEach((bubble) => {
        if (bubble.id === draggedBubble) return;

        bubble.vx += bubble.ax * timeScale;
        bubble.vy += bubble.ay * timeScale;

        bubble.vx *= PHYSICS_CONFIG.DAMPING;
        bubble.vy *= PHYSICS_CONFIG.DAMPING;

        const speed = Math.sqrt(bubble.vx * bubble.vx + bubble.vy * bubble.vy);
        if (speed > PHYSICS_CONFIG.MAX_VELOCITY) {
          bubble.vx = (bubble.vx / speed) * PHYSICS_CONFIG.MAX_VELOCITY;
          bubble.vy = (bubble.vy / speed) * PHYSICS_CONFIG.MAX_VELOCITY;
        }

        if (Math.abs(bubble.vx) < PHYSICS_CONFIG.MIN_VELOCITY) bubble.vx = 0;
        if (Math.abs(bubble.vy) < PHYSICS_CONFIG.MIN_VELOCITY) bubble.vy = 0;

        bubble.x += bubble.vx * timeScale;
        bubble.y += bubble.vy * timeScale;

        bubble.movementEnergy = Math.abs(bubble.vx) + Math.abs(bubble.vy);
        bubble.sleeping = bubble.movementEnergy < PHYSICS_CONFIG.MIN_VELOCITY * 2;
      });
    },
    [draggedBubble]
  );

  // Check and resolve boundary collisions
  const resolveBoundaryCollisions = useCallback(
    (bubbles: Bubble[]) => {
      bubbles.forEach((bubble) => {
        if (bubble.id === draggedBubble) return;

        if (bubble.x - bubble.radius < 0) {
          bubble.x = bubble.radius;
          bubble.vx = Math.abs(bubble.vx) * 0.3;
        } else if (bubble.x + bubble.radius > dimensions.width) {
          bubble.x = dimensions.width - bubble.radius;
          bubble.vx = -Math.abs(bubble.vx) * 0.3;
        }

        if (bubble.y - bubble.radius < 0) {
          bubble.y = bubble.radius;
          bubble.vy = Math.abs(bubble.vy) * 0.3;
        } else if (bubble.y + bubble.radius > dimensions.height - PHYSICS_CONFIG.BOTTOM_MARGIN) {
          bubble.y = dimensions.height - PHYSICS_CONFIG.BOTTOM_MARGIN - bubble.radius;
          bubble.vy = -Math.abs(bubble.vy) * 0.3;
        }
      });
    },
    [dimensions, draggedBubble]
  );

  // Check for collisions between bubbles
  const detectCollisions = (bubbles: Bubble[], currentTime: number) => {
    const collisionPairs = [];

    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const b1 = bubbles[i];
        const b2 = bubbles[j];

        if (!b1 || !b2) throw new Error("b1 or b2 is undefined");

        if (b1.sleeping && b2.sleeping) continue;

        if (currentTime - b1.lastCollision < 16 || currentTime - b2.lastCollision < 16) continue;

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distanceSquared = dx * dx + dy * dy;

        // Apply the spacing multiplier to increase distance between circles
        const minDistance = (b1.radius + b2.radius) * PHYSICS_CONFIG.CIRCLE_SPACING;
        const minDistanceSquared = minDistance * minDistance;

        if (distanceSquared < minDistanceSquared) {
          collisionPairs.push({ a: i, b: j, distance: Math.sqrt(distanceSquared) });

          b1.lastCollision = currentTime;
          b2.lastCollision = currentTime;
        }
      }
    }

    return collisionPairs;
  };

  // Resolve collisions with impulse method
  const resolveCollisions = useCallback(
    (
      bubbles: Bubble[],
      collisionPairs: { a: number; b: number; distance: number }[]
      //   deltaTime: number
    ) => {
      collisionPairs.forEach((pair) => {
        const b1 = bubbles[pair.a];
        const b2 = bubbles[pair.b];

        if (!b1 || !b2) throw new Error("b1 or b2 is undefined");

        if (b1.id === draggedBubble || b2.id === draggedBubble) {
          if (b1.id === draggedBubble) {
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distance = pair.distance;

            // Use the spacing factor for collision detection
            const minDistance = (b1.radius + b2.radius) * PHYSICS_CONFIG.CIRCLE_SPACING;
            const penetration = minDistance - distance;

            if (penetration > 0) {
              const nx = dx / distance;
              const ny = dy / distance;

              b2.x += nx * (penetration + 1);
              b2.y += ny * (penetration + 1);

              b2.vx = nx * 3;
              b2.vy = ny * 3;
            }
          } else if (b2.id === draggedBubble) {
            const dx = b1.x - b2.x;
            const dy = b1.y - b2.y;
            const distance = pair.distance;

            // Use the spacing factor for collision detection
            const minDistance = (b1.radius + b2.radius) * PHYSICS_CONFIG.CIRCLE_SPACING;
            const penetration = minDistance - distance;

            if (penetration > 0) {
              const nx = dx / distance;
              const ny = dy / distance;

              b1.x += nx * (penetration + 1);
              b1.y += ny * (penetration + 1);

              b1.vx = nx * 3;
              b1.vy = ny * 3;
            }
          }
          return;
        }

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distance = pair.distance;

        if (distance === 0) return;

        const nx = dx / distance;
        const ny = dy / distance;

        const rvx = b2.vx - b1.vx;
        const rvy = b2.vy - b1.vy;

        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal > 0) return;

        const restitution = 0.2;

        const j = (-(1 + restitution) * velAlongNormal) / (1 / b1.mass + 1 / b2.mass);

        const impulsex = j * nx;
        const impulsey = j * ny;

        const impulseScale = 0.8;
        b1.vx -= (impulsex * impulseScale) / b1.mass;
        b1.vy -= (impulsey * impulseScale) / b1.mass;
        b2.vx += (impulsex * impulseScale) / b2.mass;
        b2.vy += (impulsey * impulseScale) / b2.mass;

        const percent = 0.2;

        // Use the spacing factor for position correction
        const minDistance = (b1.radius + b2.radius) * PHYSICS_CONFIG.CIRCLE_SPACING;
        const penetration = minDistance - distance;

        const correctionX = nx * penetration * percent;
        const correctionY = ny * penetration * percent;

        const correctionFactor1 = 1 / b1.mass / (1 / b1.mass + 1 / b2.mass);
        const correctionFactor2 = 1 / b2.mass / (1 / b1.mass + 1 / b2.mass);

        b1.x -= correctionX * correctionFactor1;
        b1.y -= correctionY * correctionFactor1;
        b2.x += correctionX * correctionFactor2;
        b2.y += correctionY * correctionFactor2;
      });
    },
    [draggedBubble]
  );

  // Position-based solver approach
  const solvePositions = useCallback(
    (bubbles: Bubble[]) => {
      for (let iteration = 0; iteration < PHYSICS_CONFIG.POSITION_ITERATIONS; iteration++) {
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            const b1 = bubbles[i];
            const b2 = bubbles[j];

            if (!b1 || !b2) throw new Error("b1 or b2 is undefined");

            if (b1.id === draggedBubble || b2.id === draggedBubble) continue;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distanceSquared = dx * dx + dy * dy;

            // Use the spacing factor for constraint distance
            const minDistance = (b1.radius + b2.radius) * PHYSICS_CONFIG.CIRCLE_SPACING;
            const minDistanceSquared = minDistance * minDistance;

            if (distanceSquared < minDistanceSquared) {
              const distance = Math.sqrt(distanceSquared);
              const penetration = minDistance - distance;

              if (distance === 0) continue;

              const nx = dx / distance;
              const ny = dy / distance;

              const totalMass = b1.mass + b2.mass;
              const b1Factor = b2.mass / totalMass;
              const b2Factor = b1.mass / totalMass;

              const correctionX = nx * penetration;
              const correctionY = ny * penetration;

              b1.x -= correctionX * b1Factor * 0.5;
              b1.y -= correctionY * b1Factor * 0.5;
              b2.x += correctionX * b2Factor * 0.5;
              b2.y += correctionY * b2Factor * 0.5;
            }
          }
        }
      }
    },
    [draggedBubble]
  );

  // Main physics update function
  const updatePhysics = useCallback(
    (time: number) => {
      if (previousTimeRef.current === 0) {
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      const deltaTime = Math.min(time - previousTimeRef.current, 33);
      previousTimeRef.current = time;

      const currentBubbles = [...bubblesRef.current];

      applyForces(currentBubbles, deltaTime);
      integrate(currentBubbles, deltaTime);
      const collisions = detectCollisions(currentBubbles, time);
      resolveBoundaryCollisions(currentBubbles);
      resolveCollisions(currentBubbles, collisions);
      solvePositions(currentBubbles);

      bubblesRef.current = currentBubbles;
      setBubbles([...currentBubbles]);

      requestRef.current = requestAnimationFrame(updatePhysics);
    },
    [applyForces, integrate, resolveBoundaryCollisions, resolveCollisions, solvePositions]
  );

  // Start the animation loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [dimensions, draggedBubble, gravityStrength, updatePhysics]);

  // Mouse event handlers
  const handleMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!containerRef.current) throw new Error("containerRef is required");
    setDraggedBubble(index);
    const rect = containerRef.current.getBoundingClientRect();
    prevMousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.stopPropagation();
  };

  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    if (draggedBubble !== null) {
      if (!containerRef.current) throw new Error("containerRef is required");
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const updatedBubbles = [...bubblesRef.current];
      const bubble = updatedBubbles[draggedBubble];

      if (!bubble) throw new Error("Bubble is required");

      bubble.x = mouseX;
      bubble.y = mouseY;

      bubble.vx = (mouseX - prevMousePosRef.current.x) * 0.3;
      bubble.vy = (mouseY - prevMousePosRef.current.y) * 0.3;

      prevMousePosRef.current = { x: mouseX, y: mouseY };

      if (bubble.x - bubble.radius < 0) {
        bubble.x = bubble.radius;
      } else if (bubble.x + bubble.radius > dimensions.width) {
        bubble.x = dimensions.width - bubble.radius;
      }

      // Allow dragging below the margin
      if (bubble.y - bubble.radius < 0) {
        bubble.y = bubble.radius;
      } else if (bubble.y + bubble.radius > dimensions.height) {
        bubble.y = dimensions.height - bubble.radius;
      }

      bubblesRef.current = updatedBubbles;
      setBubbles([...updatedBubbles]);
    }
  };

  const handleMouseUp = () => {
    if (draggedBubble !== null) {
      const updatedBubbles = [...bubblesRef.current];
      const bubble = updatedBubbles[draggedBubble];

      if (!bubble) throw new Error("Bubble is required");

      const maxReleaseVelocity = 5;
      if (Math.abs(bubble.vx) > maxReleaseVelocity) {
        bubble.vx = Math.sign(bubble.vx) * maxReleaseVelocity;
      }
      if (Math.abs(bubble.vy) > maxReleaseVelocity) {
        bubble.vy = Math.sign(bubble.vy) * maxReleaseVelocity;
      }

      bubblesRef.current = updatedBubbles;
      setBubbles(updatedBubbles);
      setDraggedBubble(null);
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const handleClick = (index: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (index === draggedBubble) return;

    const updatedBubbles = [...bubblesRef.current];
    const bubble = updatedBubbles[index];

    if (!bubble) throw new Error("Bubble is required");

    bubble.vx += (Math.random() - 0.5) * 2;
    bubble.vy += (Math.random() - 0.5) * 2;

    bubblesRef.current = updatedBubbles;
    setBubbles(updatedBubbles);

    e.stopPropagation();
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div
        ref={containerRef}
        className="relative flex-grow touch-none select-none overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute bottom-4 left-3 right-3 flex items-center justify-center rounded-xl border-2 p-3 text-center text-xl font-semibold text-white">
          Apprehand
        </div>

        {bubbles.map((bubble, index) => (
          <div
            key={index}
            className="absolute flex cursor-move items-center justify-center rounded-full text-xl font-bold text-purple-900"
            style={{
              left: bubble.x - bubble.radius,
              top: bubble.y - bubble.radius,
              width: bubble.radius * 2,
              height: bubble.radius * 2,
              backgroundColor: bubble.color,
              boxShadow: draggedBubble === index ? "0 0 12px rgba(0,0,0,0.3)" : "none",
              zIndex: draggedBubble === index ? 100 : 10,
              transform: "translate3d(0,0,0)", // Force GPU acceleration
              willChange: "transform, left, top", // Optimize for animation
              transition: "none", // Disable all transitions
            }}
            onMouseDown={(e) => handleMouseDown(index, e)}
            onClick={(e) => handleClick(index, e)}
          >
            {bubble.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicGenreBubbles;
