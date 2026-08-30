// =======================================================
// CONFIGURATION
// League settings that persist for the session
// =======================================================

let activeConfig = {
  teamCount: 8,
  totalBalls: 10,
  drawSize: 3,
  targetPerms: 360,
  teams: []
};

// =======================================================
// RUNTIME STATE
// Changes as the lottery progresses
// =======================================================

let runtimeState = {
  teams: [],
  draftBoard: [],
  drawnBalls: [],
  roundWinner: null,
  roundDone: false,
  currentRoundIndex: 0
};