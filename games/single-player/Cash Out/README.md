# Cash Out

A minimalist, tension-driven run-based game where you take calculated risks to build wealth. Push deeper for exponential rewards or play it safe and cash out before the system collapses.

## Core Concept

**High Concept**: Navigate procedurally generated rooms, making risk-based decisions. Pressure constantly increases, forcing you to choose: go deeper for bigger rewards or leave while you still can.

**Win Condition**: Cash out safely with your earnings
**Loss Condition**: Your HP hits 0 and you lose most gains

## Game Features

### Mechanics
- **Risk/Reward System**: Every gamble has transparent odds and consequences
- **Pressure System**: Difficulty scales with depth and streak, affects all gameplay
  - Low Pressure: Normal odds
  - Moderate: Worse odds, higher penalties
  - High: Fake rewards, increased failures
  - Critical: Cascading failures, visual distortion
- **Multiple Gamble Types** (unlock more by progressing):
  1. **Fixed Trade** - Lose HP for guaranteed Value
  2. **Probability Roll** - 50-80% to win big or lose HP
  3. **Unknown Outcome** - Mystery gamble with hidden results
  4. **Double or Nothing** - 50% to double value or lose it all
  5. **Pressure Release** - Trade pressure for resources
- **Meta Progression**: Permanent unlocks based on your performance
- **Streaks & Combos**: Keep winning to unlock higher risk/reward deals

### Player Stats
- **HP** - Your survival resource. Hits 0 = death
- **Value** - Currency you're accumulating. Can be cashed out or lost
- **Pressure** - Increases with depth/streak. Modifies odds and damage
- **Depth** - How far you've descended
- **Streak** - Consecutive successful gambles

### UI Elements
- **Left Panel**: Real-time stats (HP, Value, Depth, Streak)
- **Center**: Pressure meter (STABLE → CRITICAL)
- **Right Panel**: Session saved total, best run, cash out button
- **Canvas**: 2D top-down view with player, room, and pressure effects
- **Crosshair**: Center screen indicator
- **Choice Panel**: Gamble options with transparent risk/reward info

## How to Play

1. **Open in VS Code**: Open the `Cash Out` folder
2. **Install Live Server**: Get the "Live Server" extension by Ritwick Dey
3. **Right-click index.html** → "Open with Live Server"

### Controls
- **Click or SPACE**: Enter next room (advance if not choosing)
- **Click Choice Option**: Select a gamble
- **Click Cash Out Button**: End run, secure your value
- **Mouse**: Move cursor (for UI interaction only)

### Gameplay Flow
1. Spawn in safe room
2. Enter next room (increases depth)
3. Make a gamble choice
4. Outcome resolves with notifications
5. Pressure increases
6. Repeat or cash out
7. Game ends when: You die OR you cash out

### Strategy Tips
- **Early Game**: Build value safely, learn patterns
- **Mid Game**: Moderate risk as pressure rises
- **Late Game**: Pressure modifiers stack heavily. Know when to leave
- **Streaks**: Multiple wins unlock better deals but increase pressure faster
- **Cash Out Points**: Available every 3 depths. Use them strategically

## Progression & Unlocks

### Starting Gambles
- Fixed Trade
- Probability Roll

### Unlock Conditions
- **Hidden Outcome**: Best run ≥ $500
- **Escalating Gamble**: Best run ≥ $1,000
- **Pressure Trade**: Max depth ≥ 10

## Game Balance

### Pressure Scaling Formula
```
pressure += 5 (base) + (depth * 0.5) + (streak * 0.3)
```

### Pressure Modifiers by Level
- **25% pressure**: -10% odds, 1.1x damage
- **50% pressure**: -20% odds, 1.3x damage, 1.2x value loss
- **75% pressure**: -30% odds, 1.6x damage, 1.5x value loss
- **100% pressure**: All modifiers maxed, visual distortion

## File Structure

- `index.html` - Entry point, canvas, UI elements
- `styles.css` - Minimalist sci-fi aesthetics
- `game.js` - Main game logic, run management
- `engine.js` - 2D canvas renderer
- `systems.js` - Player, Pressure, Gamble systems
- `rooms.js` - Room generation, gamble creation
- `ui.js` - HUD updates, choice panel, notifications
- `meta.js` - Persistent progression, unlocks

## Tech Stack

- **HTML5 Canvas**: 2D rendering
- **Vanilla JavaScript**: Core game logic
- **CSS 3**: UI styling and effects
- **Local Storage**: Meta progression persistence

## Design Philosophy

This game succeeds if:
- **Decisions feel meaningful** (not random screwing)
- **Risk is understandable** (all odds shown)
- **Pressure forces action** (you can't just sit still)
- **Failure feels like YOUR fault** (not unfair RNG)

Players should say: *"I got greedy"* or *"I played it too safe"*
NOT: *"That was unfair RNG"*

## Tips for New Players

1. **Learn the odds**: Each gamble shows probability if known
2. **Watch pressure**: It's your main enemy, not random chance
3. **Cash out early**: Your first few successful runs should secure modest gains
4. **Take risks deeper**: After depth 5, pressure modifiers hit hard
5. **Chain wins**: Streaks matter—winning gambles set up better deals next turn

## Future Expansions

- Daily seeded runs with leaderboards
- More gamble types
- Modifiers and difficulty modes
- Visual corruption at extreme pressure
- Hidden mechanics and rule shifts at high depths
- Sound design (ambient hum, pressure crescendo, failure stings)

---

**Created for originality, designed for tension. Good luck. You're going to get greedy.** 🎲

