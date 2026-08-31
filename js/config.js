// =======================================================
// LOTTERY FORMAT PRESETS
// Defines reusable lottery structures
// =======================================================

const lotteryFormats = {

  "Fantasy Mini Lottery": {

    teamCount: 8,
    totalBalls: 10,
    drawSize: 3

  },


  "Standard Fantasy Lottery": {

    teamCount: 12,
    totalBalls: 12,
    drawSize: 4

  },


  "NHL Style Lottery": {

    teamCount: 16,
    totalBalls: 14,
    drawSize: 4

  },


  "Custom": null

};

// =======================================================
// CONFIGURATION
// League settings that persist for the session
// =======================================================

let activeConfig = {

  lotteryFormat: "Fantasy Mini Lottery",

  teamCount: 8,

  totalBalls: 10,

  drawSize: 3,

  targetPerms: 720,

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