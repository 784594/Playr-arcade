// Room Management & Procedural Generation
class RoomManager {
    constructor() {
        this.currentRoom = null;
        this.roomHistory = [];
    }

    generateNextRoom(depth) {
        const gambleCount = 2 + Math.floor(depth / 5); // More choices deeper
        
        // Get allowed gamble types based on unlocks
        const allowedTypes = metaProgression.unlocks.gambleTypes;

        const gambles = gambleSystem.generateGambles(gambleCount, allowedTypes);

        this.currentRoom = {
            depth: depth,
            gambles: gambles,
            visited: false,
            canCashOut: depth > 0 && depth % 3 === 0 // Cash out points every 3 levels
        };

        return this.currentRoom;
    }

    getGamebleDescription(gamble) {
        let desc = gamble.description;

        // Add pressure modifiers hint at high pressure
        if (pressureSystem.pressure >= 50) {
            desc += ' [PRESSURE MAY AFFECT ODDS]';
        }

        return desc;
    }

    getGamebleOutcomes(gamble) {
        const outcomes = [];

        for (let outcome of gamble.outcomes) {
            let text = '';
            let isLoss = false;
            let isGain = false;

            if (outcome.result.hp !== undefined && outcome.result.hp < 0) {
                text += `${-outcome.result.hp} HP`;
                isLoss = true;
            } else if (outcome.result.hp !== undefined && outcome.result.hp > 0) {
                text += `${outcome.result.hp} HP`;
                isGain = true;
            }

            if (outcome.result.value !== undefined) {
                if (text) text += ' · ';
                text += `$${outcome.result.value}`;
                isGain = true;
            }

            if (outcome.result.valueLoss === 1.0) {
                if (text) text += ' · ';
                text += 'All Value Lost';
                isLoss = true;
            } else if (outcome.result.valueLoss !== undefined) {
                if (text) text += ' · ';
                text += `${Math.round(outcome.result.valueLoss * 100)}% Value Lost`;
                isLoss = true;
            }

            if (outcome.result.valueMultiplier) {
                if (text) text += ' · ';
                text += `Value ×${outcome.result.valueMultiplier}`;
                isGain = true;
            }

            if (outcome.result.pressure !== undefined && outcome.result.pressure < 0) {
                if (text) text += ' · ';
                text += `Pressure -${-outcome.result.pressure}`;
                isGain = true;
            }

            outcomes.push({
                text: text,
                chance: outcome.chance,
                isRisky: outcome.result.hp && outcome.result.hp < 0,
                type: isLoss ? 'loss' : (isGain ? 'gain' : 'neutral')
            });
        }

        return outcomes;
    }

    markRoomVisited() {
        if (this.currentRoom) {
            this.currentRoom.visited = true;
            this.roomHistory.push(this.currentRoom);
        }
    }
}

const roomManager = new RoomManager();
