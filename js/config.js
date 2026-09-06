// =======================================================
// LOTTERY FORMAT PRESETS
// Defines reusable lottery structures
// =======================================================

const lotteryFormats = {


  "Fantasy Mini Lottery": {

    teamCount:8,
    totalBalls:10,
    drawSize:3,

    curve:"Fantasy Mini Curve"

},


"NHL Style Lottery": {

    teamCount:16,
    totalBalls:14,
    drawSize:4,

    curve:"NHL Draft Curve"

},


  "NBA Style Lottery": {

    teamCount: 14,
    totalBalls: 14,
    drawSize: 4,

    curve: "NBA Draft Curve"

  },


  "MLB Style Lottery": {

    teamCount: 18,
    totalBalls: 14,
    drawSize: 4,

    curve: "MLB Draft Curve"

  },


  "Linear Style Lottery": {

    teamCount: 14,
    totalBalls: 14,
    drawSize: 4,

    curve: "Linear Draft Curve"

  },


  "Mild Slope Style Lottery": {

    teamCount: 14,
    totalBalls: 10,
    drawSize: 3,

    curve: "Mild Slope Style Curve"

  },


  "Extreme Slope Style Lottery": {

    teamCount: 14,
    totalBalls: 10,
    drawSize: 4,

    curve: "Extreme Slope Style Curve"

  },


  "Custom": null

};

// =======================================================
// CONFIGURATION
// League settings that persist for the session
// =======================================================

let activeConfig = {

 teamCount: 8,
 totalBalls: 10,
 drawSize: 3,
 targetPerms: 720,

 curveType: "NHL Draft Curve",

 curveSettings: {},

 revealMode: "reverse",

editMode: "permutations",

 weightEditMode: "weights",

 teams: null

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