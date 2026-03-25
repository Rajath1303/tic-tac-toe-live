let InitModule = function (
    ctx: any,
    logger: any,
    nk: any,
    initializer: any
): void {
    try {
        nk.leaderboardCreate(
            "tictactoe_wins",
            false,
            "descending",
            "increment",
        );
        logger.info("Leaderboard tictactoe_wins created");
    } catch (e) {
        logger.info("Leaderboard already exists, skipping creation");
    }
};