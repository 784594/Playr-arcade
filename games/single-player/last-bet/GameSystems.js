// GameSystems.js - Casino game implementations
class GameSystems {
  static createGame(name, description, minimumStake, options, play) {
    return { name, description, minimumStake, options, play };
  }

  static playDice() {
    return GameSystems.createGame(
      'Dice Roll',
      'A low-stakes table. You need at least 30 chips to sit down.',
      30,
      [{ label: 'Roll', value: 'roll' }],
      () => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;
        const win = total === 7 || total === 11;
        const loss = total === 2 || total === 3 || total === 12;
        const payout = win ? 50 : loss ? -30 : 0;
        return {
          result: win ? 'WIN' : loss ? 'LOSS' : 'PUSH',
          detail: `Rolled ${d1}+${d2} = ${total}`,
          payout,
        };
      }
    );
  }

  static playBlackjack() {
    return GameSystems.createGame(
      'Blackjack',
      'Get closer to 21 than the dealer. Needs 50 chips on hand.',
      50,
      [
        { label: 'Hit', value: 'hit' },
        { label: 'Stand', value: 'stand' },
        { label: 'Split', value: 'split' },
        { label: 'Cheat', value: 'cheat' },
      ],
      (choice) => {
        const playerCards = [GameSystems.randomCard(), GameSystems.randomCard()];
        const dealerCards = [GameSystems.randomCard(), GameSystems.randomCard()];
        const splitAble = playerCards[0] === playerCards[1];
        let playerVal = GameSystems.cardValue(playerCards);
        let dealerVal = GameSystems.cardValue(dealerCards);
        let anomaly = false;

        if (choice === 'hit') {
          playerVal += GameSystems.randomCard() <= 10 ? 0 : 1;
        } else if (choice === 'split') {
          anomaly = !splitAble;
          playerVal = splitAble ? Math.max(playerVal, 18) : Math.max(playerVal - 4, 12);
        } else if (choice === 'cheat') {
          anomaly = true;
          playerVal = Math.min(21, playerVal + 4);
        }

        if (dealerVal < 17) {
          dealerVal += GameSystems.randomCard() > 8 ? 4 : 2;
        }

        let win = false;
        if (playerVal === 21) win = true;
        else if (playerVal > 21) win = false;
        else if (dealerVal > 21) win = true;
        else if (playerVal > dealerVal) win = true;

        const payout = win ? (choice === 'cheat' ? 55 : 40) : choice === 'split' ? -20 : -30;
        return {
          result: win ? 'WIN' : 'LOSS',
          detail: `You: ${playerVal}, Dealer: ${dealerVal}`,
          payout,
          anomaly,
        };
      }
    );
  }

  static playSlots() {
    return GameSystems.createGame(
      'Slot Machine',
      'Cheap entry, brutal discipline. Needs 20 chips.',
      20,
      [{ label: 'Spin', value: 'spin' }],
      () => {
        const symbols = ['CHERRY', 'LEMON', 'ORANGE', 'SEVEN', 'CROWN'];
        const r1 = symbols[Math.floor(Math.random() * symbols.length)];
        const r2 = symbols[Math.floor(Math.random() * symbols.length)];
        const r3 = symbols[Math.floor(Math.random() * symbols.length)];
        const win = r1 === r2 && r2 === r3;
        return {
          result: win ? 'WIN' : 'LOSS',
          detail: `${r1} | ${r2} | ${r3}`,
          payout: win ? 80 : -20,
        };
      }
    );
  }

  static playRoulette() {
    return GameSystems.createGame(
      'Roulette',
      'Pick a side and hope the wheel likes you. Needs 35 chips.',
      35,
      [
        { label: 'Red', value: 'red' },
        { label: 'Black', value: 'black' },
      ],
      (choice) => {
        const number = Math.floor(Math.random() * 37);
        const isRed = number >= 1 && number <= 18;
        const isBlack = number >= 19 && number <= 36;
        const win = (choice === 'red' && isRed) || (choice === 'black' && isBlack);
        return {
          result: win ? 'WIN' : 'LOSS',
          detail: `Number: ${number} (${isRed ? 'Red' : isBlack ? 'Black' : 'Zero'})`,
          payout: win ? 35 : -25,
        };
      }
    );
  }

  static playPoker() {
    return GameSystems.createGame(
      'Video Poker',
      'Manage the hand or push your luck. Needs 40 chips.',
      40,
      [
        { label: 'Fold', value: 'fold' },
        { label: 'Raise', value: 'raise' },
        { label: 'Cheat', value: 'cheat' },
      ],
      (choice) => {
        const hands = [
          { name: 'High Card', mult: 0, chance: 0.42 },
          { name: 'Pair', mult: 1, chance: 0.26 },
          { name: 'Two Pair', mult: 2, chance: 0.05 },
          { name: 'Three of a Kind', mult: 3, chance: 0.02 },
          { name: 'Straight', mult: 4, chance: 0.004 },
          { name: 'Flush', mult: 5, chance: 0.002 },
          { name: 'Full House', mult: 8, chance: 0.0014 },
          { name: 'Four of a Kind', mult: 25, chance: 0.0002 },
          { name: 'Straight Flush', mult: 250, chance: 0.0001 },
        ];

        const roll = Math.random();
        let selected = hands[0];
        let cumulative = 0;
        for (const h of hands) {
          cumulative += h.chance;
          if (roll < cumulative) {
            selected = h;
            break;
          }
        }

        let win = selected.mult > 1;
        let payout = win ? selected.mult * 30 : -20;
        let anomaly = false;

        if (choice === 'fold') {
          win = false;
          payout = -10;
        } else if (choice === 'raise') {
          payout = win ? selected.mult * 45 : -35;
        } else if (choice === 'cheat') {
          anomaly = true;
          win = true;
          payout = Math.max(50, selected.mult * 60);
          selected = { name: `${selected.name} (rigged)` };
        }

        return {
          result: win ? 'WIN' : 'LOSS',
          detail: `Drew: ${selected.name}`,
          payout,
          anomaly,
        };
      }
    );
  }

  static playHighLow() {
    return GameSystems.createGame(
      'High-Low',
      'Fast read, fast risk. Needs 25 chips.',
      25,
      [
        { label: 'Higher', value: 'higher' },
        { label: 'Lower', value: 'lower' },
      ],
      (choice) => {
        const current = GameSystems.randomCard();
        const next = GameSystems.randomCard();
        const win = (choice === 'higher' && next >= current) || (choice === 'lower' && next <= current);
        return {
          result: win ? 'WIN' : 'LOSS',
          detail: `Card ${current} -> ${next}`,
          payout: win ? 28 : -18,
          anomaly: false,
        };
      }
    );
  }

  static playNumberGrid() {
    return GameSystems.createGame(
      'Number Grid',
      'Pick a tile and pray it was not trapped. Needs 40 chips.',
      40,
      [
        { label: 'Pick Tile', value: 'pick' },
        { label: 'Cash Out', value: 'cashout' },
      ],
      (choice) => {
        const deadTile = Math.floor(Math.random() * 6);
        const picked = Math.floor(Math.random() * 6);
        const safe = picked !== deadTile || choice === 'cashout';
        return {
          result: safe ? 'WIN' : 'LOSS',
          detail: choice === 'cashout' ? 'Cashed out clean' : `Tile ${picked + 1} vs dead ${deadTile + 1}`,
          payout: choice === 'cashout' ? 10 : safe ? 45 : -40,
          anomaly: false,
        };
      }
    );
  }

  static playVipPoker() {
    return GameSystems.createGame(
      'VIP Poker',
      'Heavy surveillance, better payouts. Needs 80 chips.',
      80,
      [
        { label: 'Fold', value: 'fold' },
        { label: 'Raise', value: 'raise' },
        { label: 'Cheat', value: 'cheat' },
      ],
      (choice) => {
        const risk = Math.random();
        let payout = -30;
        let result = 'LOSS';
        let anomaly = false;
        if (choice === 'fold') {
          payout = -15;
        } else if (choice === 'raise') {
          payout = risk > 0.58 ? 95 : -45;
          result = payout > 0 ? 'WIN' : 'LOSS';
        } else if (choice === 'cheat') {
          anomaly = true;
          payout = risk > 0.2 ? 130 : -70;
          result = payout > 0 ? 'WIN' : 'LOSS';
        }
        return {
          result,
          detail: `VIP pressure: ${Math.round(risk * 100)}%`,
          payout,
          anomaly,
        };
      }
    );
  }

  static playHighRollerSlots() {
    return GameSystems.createGame(
      'High Roller Slots',
      'Huge reels, nastier swings. Needs 75 chips.',
      75,
      [
        { label: 'Spin', value: 'spin' },
        { label: 'Push Max', value: 'push' },
      ],
      (choice) => {
        const symbols = ['DIAMOND', 'CLOVER', 'SEVEN', 'CROWN', 'LIGHTNING'];
        const hits = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ];
        const win = hits[0] === hits[1] && hits[1] === hits[2];
        return {
          result: win ? 'WIN' : 'LOSS',
          detail: hits.join(' | '),
          payout: win ? (choice === 'push' ? 180 : 120) : -50,
          anomaly: choice === 'push' && win,
        };
      }
    );
  }

  static playPrecisionDice() {
    return GameSystems.createGame(
      'Precision Dice',
      'Precise targets, nasty variance. Needs 50 chips.',
      50,
      [
        { label: 'Target 7', value: '7' },
        { label: 'Target 8', value: '8' },
        { label: 'Target 9', value: '9' },
      ],
      (choice) => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;
        const target = Number(choice);
        const win = total === target;
        return {
          result: win ? 'WIN' : 'LOSS',
          detail: `Rolled ${d1}+${d2} = ${total}`,
          payout: win ? 95 : -35,
          anomaly: false,
        };
      }
    );
  }

  static playBackRoomTable() {
    return GameSystems.createGame(
      'Back Room Table',
      'The ugly table in the back. Needs 120 chips.',
      120,
      [
        { label: 'Fold', value: 'fold' },
        { label: 'Raise', value: 'raise' },
        { label: 'Cheat', value: 'cheat' },
      ],
      (choice) => {
        const pressure = Math.random();
        let payout = -40;
        let result = 'LOSS';
        let anomaly = false;
        if (choice === 'raise') {
          payout = pressure > 0.65 ? 160 : -80;
          result = payout > 0 ? 'WIN' : 'LOSS';
        } else if (choice === 'cheat') {
          anomaly = true;
          payout = pressure > 0.3 ? 260 : -120;
          result = payout > 0 ? 'WIN' : 'LOSS';
        } else {
          payout = -20;
        }
        return {
          result,
          detail: `Pressure level ${Math.round(pressure * 100)}%`,
          payout,
          anomaly,
        };
      }
    );
  }

  static randomCard() {
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
    return values[Math.floor(Math.random() * values.length)];
  }

  static cardValue(cards) {
    let total = 0;
    let aces = 0;
    for (const card of cards) {
      total += card;
      if (card === 11) aces++;
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  }
}
