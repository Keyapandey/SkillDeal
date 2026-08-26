const getLevelFromXP = (xp) => {
    if (xp >= 500) return 6;
    if (xp >= 350) return 5;
    if (xp >= 250) return 4;
    if (xp >= 180) return 3;
    if (xp >= 100) return 2;

    return 1;
};

module.exports = {
    getLevelFromXP
};