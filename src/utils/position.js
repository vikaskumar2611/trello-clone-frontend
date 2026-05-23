const POSITION_GAP = 65536; // Larger gap = more room between items

export const getPositionBetween = (before, after) => {
    // Both null = first ever item
    if (before === null && after === null) {
        return POSITION_GAP;
    }

    // Insert at beginning (nothing before it)
    if (before === null && after !== null) {
        // Give plenty of room before the first item
        return after / 2;
    }

    // Insert at end (nothing after it)
    if (before !== null && after === null) {
        return before + POSITION_GAP;
    }

    // Insert between two items
    // If positions are identical or too close, spread them
    if (Math.abs(after - before) < 1) {
        // Positions have converged - this shouldn't happen
        // with our DB but handle gracefully
        return before + POSITION_GAP;
    }

    return (before + after) / 2;
};
