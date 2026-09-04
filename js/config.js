// =======================================================
// LOTTERY FORMAT PRESETS
// Defines reusable lottery structures
// =======================================================

const lotteryFormats = {


  "Fantasy Mini Lottery": {

    teamCount: 8,
    totalBalls: 10,
    drawSize: 3,

    percentages: [
      25,
      20,
      15,
      12,
      10,
      8,
      6,
      4
    ]

  },


  "NHL Style Lottery": {

    teamCount: 16,
    totalBalls: 14,
    drawSize: 4,

    percentages: [
      18.5,
      13.5,
      11.5,
      9.5,
      8.5,
      7.5,
      6.5,
      6,
      5,
      3.5,
      3,
      2.5,
      2,
      1.5,
      0.5,
      0.5
    ]

  },


  "NBA Style Lottery": {

    teamCount: 14,
    totalBalls: 14,
    drawSize: 4,

    percentages: [
      14,
      14,
      14,
      11.5,
      11.5,
      8,
      6.8,
      6.7,
      4.5,
      3,
      2,
      1.5,
      1,
      0.5
    ]

  },


  "MLB Style Lottery": {

    teamCount: 18,
    totalBalls: 14,
    drawSize: 4,

    percentages: [
      16.5,
      16.5,
      16.5,
      13.25,
      10,
      7.5,
      5.5,
      3.9,
      2.7,
      1.8,
      1.4,
      1.1,
      0.9,
      0.7,
      0.5,
      0.4,
      0.3,
      0.2
    ]

  },


  "Linear Style Lottery": {

    teamCount: 14,
    totalBalls: 14,
    drawSize: 4,

    percentages: [
      14.2,
      12.8,
      11.5,
      10.1,
      8.8,
      7.4,
      6.1,
      5.4,
      4.7,
      4.1,
      3.5,
      2.8,
      2.2,
      1.5
    ]

  },


  "Mild Slope Style Lottery": {

    teamCount: 14,
    totalBalls: 10,
    drawSize: 3,

    percentages: [
      22.5,
      17.5,
      14.5,
      11,
      8.5,
      6.5,
      5,
      4,
      3,
      2.5,
      2,
      1.5,
      1.2,
      0.8
    ]

  },


  "Extreme Slope Style Lottery": {

    teamCount: 14,
    totalBalls: 10,
    drawSize: 4,

    percentages: [
      32,
      21,
      14,
      9.5,
      6.5,
      4.5,
      3,
      2.5,
      2,
      1.5,
      1.2,
      1,
      0.8,
      0.5
    ]

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