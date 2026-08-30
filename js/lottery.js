// =======================================================
// MATH & UTILITY FUNCTIONS
// Generic helper functions used throughout the application
// =======================================================

function getMathMaxPermutations(n, k) {
  let total = 1;
  for (let i = 0; i < k; i++) { total *= (n - i); }
  return total;
}

// =======================================================
// UTILITY FUNCTIONS
// General helper methods used throughout the application
// =======================================================

function generatePermutationPool(n, k) {
  const pool = [];
  function backtrack(current) {
    if (current.length === k) { pool.push([...current]); return; }
    for (let i = 1; i <= n; i++) {
      if (!current.includes(i)) {
        current.push(i);
        backtrack(current);
        current.pop();
      }
    }
  }
  backtrack([]);
  return pool;
}

// =======================================================
// UTILITY FUNCTIONS
// Generic helper functions
// =======================================================

function shuffle(arr) {
  const clean = [...arr];
  for (let i = clean.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clean[i], clean[j]] = [clean[j], clean[i]];
  }
  return clean;
}

function generateDefaultWeightedTeams(count, totalPermsTarget) {
  const teamsList = [];
  let weightsRaw = [];
  for (let i = 0; i < count; i++) {
    weightsRaw.push(Math.pow(0.82, i));
  }
  const sumRaw = weightsRaw.reduce((a, b) => a + b, 0);
  let assignedSum = 0;
  
  let tempWeights = weightsRaw.map(w => {
    let allocated = Math.round((w / sumRaw) * totalPermsTarget);
    if (allocated < 1) allocated = 1;
    assignedSum += allocated;
    return allocated;
  });

  let discrepancy = totalPermsTarget - assignedSum;
  if (discrepancy !== 0) {
    tempWeights[0] += discrepancy;
    if (tempWeights[0] < 1) tempWeights[0] = 1;
  }

  for (let i = 0; i < count; i++) {
    teamsList.push({ name: `Team ${i + 1}`, perms: tempWeights[i] });
  }
  return teamsList;
}

// =======================================================
// LOTTERY ENGINE
// Core lottery logic and draw processing
// =======================================================

function resetRuntimeEngine() {
  runtimeState.draftBoard = new Array(activeConfig.teamCount).fill(null);
  runtimeState.currentRoundIndex = 0;
  
  runtimeState.teams = activeConfig.teams.map((t, idx) => ({
    id: idx,
    name: t.name,
    assignedPermsCount: t.perms,
    allPermutations: [],
    livePermutations: [],
    hasSecuredPlacement: false
  }));
  
  dealInitialPermutationPool();
  initializeDrawSequenceRound();
}

function dealInitialPermutationPool() {
  const allCombinationsPool = shuffle(generatePermutationPool(activeConfig.totalBalls, activeConfig.drawSize));
  let cursor = 0;
  
  runtimeState.teams.forEach(t => {
    t.allPermutations = allCombinationsPool.slice(cursor, cursor + t.assignedPermsCount).map(p => [...p]);
    t.livePermutations = t.allPermutations.map(p => [...p]);
    cursor += t.assignedPermsCount;
  });
}

// =======================================================
// LOTTERY ENGINE
// Handles ball drawing, winner selection and redistribution
// =======================================================

function initializeDrawSequenceRound() {
  // NOTE: this no longer reshuffles/reslices the master pool each round.
  // Each team's allPermutations now persists across rounds (built once by
  // dealInitialPermutationPool, then adjusted by redistributePermutations
  // whenever a team secures a slot). This just resets the per-round draw
  // state and re-syncs livePermutations for active teams.
  runtimeState.teams.forEach(t => {
    if (!t.hasSecuredPlacement) {
      t.livePermutations = t.allPermutations.map(p => [...p]);
    } else {
      t.allPermutations = [];
      t.livePermutations = [];
    }
  });
  
  runtimeState.drawnBalls = [];
  runtimeState.roundWinner = null;
  runtimeState.roundDone = false;
  
  renderLotteryInterface();
}

function drawBall(ballNumber) {
  if (runtimeState.roundDone || runtimeState.drawnBalls.includes(ballNumber)) return;
  
  runtimeState.drawnBalls.push(ballNumber);
  
  runtimeState.teams.forEach(t => {
    if (!t.hasSecuredPlacement) {
      t.livePermutations = t.allPermutations.filter(p => 
        runtimeState.drawnBalls.every((drawn, idx) => p[idx] === drawn)
      );
    }
  });
  
  if (runtimeState.drawnBalls.length === activeConfig.drawSize) {
    resolveDrawSequenceWinner();
  }
  renderLotteryInterface();
}

function resolveDrawSequenceWinner() {
  const finalizedSequence = runtimeState.drawnBalls;
  let winner = null;
  
  runtimeState.teams.forEach(t => {
    if (!t.hasSecuredPlacement) {
      const successfulMatch = t.allPermutations.find(p => p.every((v, idx) => v === finalizedSequence[idx]));
      if (successfulMatch) winner = t;
    }
  });
  
if (!winner) {
  alert("No team owns this sequence. Redistribution error detected.");
  return;
}
  
  runtimeState.roundWinner = winner;
  runtimeState.roundDone = true;
  winner.hasSecuredPlacement = true;
  
  const targetDraftSlotIndex = activeConfig.teamCount - 1 - runtimeState.currentRoundIndex;
  
  runtimeState.draftBoard[targetDraftSlotIndex] = {
    teamName: winner.name,
    sequenceString: finalizedSequence.join(' → '),
    resolvedInRound: runtimeState.currentRoundIndex + 1
  };
  
  redistributePermutations(winner);
}

function redistributePermutations(eliminatedTeam) {
  // Pull the full set of combinations that belonged to the team that just
  // secured a draft slot — these are the ones that need to be handed off.
  const orphanedPermutations = eliminatedTeam.allPermutations;
  
  const survivingTeams = runtimeState.teams.filter(t => !t.hasSecuredPlacement);
  if (survivingTeams.length === 0 || orphanedPermutations.length === 0) return;
  
  // Order survivors by their current permutation count, highest first, so
  // that if the split is uneven, the extras go one at a time starting with
  // the team that currently holds the most permutations.
  const survivorsByCountDesc = [...survivingTeams].sort((a, b) => b.assignedPermsCount - a.assignedPermsCount);
  
  const baseShare = Math.floor(orphanedPermutations.length / survivorsByCountDesc.length);
  const remainder = orphanedPermutations.length % survivorsByCountDesc.length;
  
  let cursor = 0;
  survivorsByCountDesc.forEach((t, idx) => {
    // Teams at the front of the highest-count-first order pick up the
    // leftover "+1" shares until the remainder is exhausted.
    const shareSize = baseShare + (idx < remainder ? 1 : 0);
    const grantedSlice = orphanedPermutations.slice(cursor, cursor + shareSize).map(p => [...p]);
    cursor += shareSize;
    
    t.allPermutations = t.allPermutations.concat(grantedSlice);
    t.assignedPermsCount = t.allPermutations.length;
    
    // Keep livePermutations in sync — re-filter against whatever has been
    // drawn so far this round (normally empty right after a round resolves,
    // but this keeps state consistent if ever called mid-round).
    t.livePermutations = t.allPermutations.filter(p =>
      runtimeState.drawnBalls.every((drawn, i) => p[i] === drawn)
    );
  });
  
  // The eliminated team's own pool is now fully handed off.
  eliminatedTeam.allPermutations = [];
  eliminatedTeam.livePermutations = [];
}

function advanceToNextLotteryRound() {
  runtimeState.currentRoundIndex++;
  const remainingUnseededCount = runtimeState.teams.filter(t => !t.hasSecuredPlacement).length;
  
  if (remainingUnseededCount === 1) {
    const finalUnseededTeam = runtimeState.teams.find(t => !t.hasSecuredPlacement);
    finalUnseededTeam.hasSecuredPlacement = true;
    
    runtimeState.draftBoard[0] = {
      teamName: finalUnseededTeam.name,
      sequenceString: "Assigned Automatically (Last Remaining Contender)",
      resolvedInRound: runtimeState.currentRoundIndex + 1
    };
    
    runtimeState.roundDone = true;
    renderLotteryInterface();
    switchTab('picks');
    return;
  }
  
  initializeDrawSequenceRound();
}

function initSystemOnBoot() {
  activeConfig.teamCount = 8;
  activeConfig.totalBalls = 10;
  activeConfig.drawSize = 3;
  activeConfig.targetPerms = 720;
  activeConfig.teams = generateDefaultWeightedTeams(8, 720);

  renderAdminTeamRows(activeConfig.teams);
  resetRuntimeEngine();
}