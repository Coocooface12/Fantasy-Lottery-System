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
// ADMIN PANEL
// League configuration and settings management
// =======================================================

function calculateMathLimits() {
  const n = parseInt(document.getElementById('cfg-balls-pool').value) || 4;
  const k = parseInt(document.getElementById('cfg-draw-size').value) || 2;
  const absoluteMax = getMathMaxPermutations(n, k);
  
  document.getElementById('math-max-hint').textContent = `Absolute limit for chosen ball config: ${absoluteMax}`;
  
  let targetInput = document.getElementById('cfg-max-perms');
  if (parseInt(targetInput.value) > absoluteMax || targetInput.value === "") {
    targetInput.value = absoluteMax;
  }
  updateAdminTotal();
}

function handleTeamCountChange() {
  let count = parseInt(document.getElementById('cfg-team-count').value) || 8;
  if (count < 4) { count = 4; document.getElementById('cfg-team-count').value = 4; }
  if (count > 20) { count = 20; document.getElementById('cfg-team-count').value = 20; }
  
  const targetPerms = parseInt(document.getElementById('cfg-max-perms').value) || 360;
  const transientTeams = generateDefaultWeightedTeams(count, targetPerms);
  renderAdminTeamRows(transientTeams);
}

// =======================================================
// USER INTERFACE
// Updates everything visible on the screen
// =======================================================

function renderAdminTeamRows(teamsArray) {
  const container = document.getElementById('admin-teams-container');
  if (!container) return;
  container.innerHTML = '';
  const targetPerms = parseInt(document.getElementById('cfg-max-perms').value) || 360;

  teamsArray.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'admin-team-row';
    const pct = ((t.perms / targetPerms) * 100).toFixed(1);
    
    row.innerHTML = `
      <input class="admin-input clan-name-input" data-index="${i}" value="${t.name}" placeholder="Team Name" />
      <input class="admin-input clan-perm-input" type="number" min="1" data-index="${i}" value="${t.perms}" oninput="updateAdminTotal()" style="text-align:center;" />
      <div class="clan-pct-label" id="apct-${i}" style="font-size:14px; font-weight:500; color:var(--silver); text-align:right; padding-right:12px;">${pct}%</div>
    `;
    container.appendChild(row);
  });
  updateAdminTotal();
}

// =======================================================
// USER INTERFACE
// Updates everything visible on the screen
// =======================================================

function updateAdminTotal() {
  const permInputs = document.querySelectorAll('.clan-perm-input');
  const pctLabels = document.querySelectorAll('.clan-pct-label');
  const targetPerms = parseInt(document.getElementById('cfg-max-perms').value) || 0;
  
  let total = 0;
  permInputs.forEach(input => { total += parseInt(input.value) || 0; });
  
  permInputs.forEach((input, idx) => {
    const val = parseInt(input.value) || 0;
    const computedPct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
    if(pctLabels[idx]) pctLabels[idx].textContent = `${computedPct}%`;
  });

  const lbl = document.getElementById('total-label');
  if (lbl) {
    lbl.textContent = `Total Weight Allocated: ${total} / ${targetPerms} Targets`;
    lbl.className = 'total-perms ' + (total === targetPerms ? 'ok' : 'over');
  }
}

function initSystemOnBoot() {
  activeConfig.teamCount = 8;
  activeConfig.totalBalls = 6;
  activeConfig.drawSize = 4;
  activeConfig.targetPerms = 360;
  activeConfig.teams = generateDefaultWeightedTeams(8, 360);
  
  document.getElementById('cfg-team-count').value = 8;
  document.getElementById('cfg-balls-pool').value = 6;
  document.getElementById('cfg-draw-size').value = 4;
  document.getElementById('cfg-max-perms').value = 360;
  
  // Render the team input rows right away so they don't break the system!
  renderAdminTeamRows(activeConfig.teams);
  resetRuntimeEngine();
}

function resetSettingsToDefault() {
  if(confirm("Restore default configurations? Current setups will be overwritten.")) {
    initSystemOnBoot();
    switchTab('lottery');
  }
}

// =======================================================
// ADMIN PANEL
// League configuration and settings management
// =======================================================

function applySettings() {
  const count = parseInt(document.getElementById('cfg-team-count').value);
  const n = parseInt(document.getElementById('cfg-balls-pool').value);
  const k = parseInt(document.getElementById('cfg-draw-size').value);
  const targetPerms = parseInt(document.getElementById('cfg-max-perms').value);
  const absoluteMax = getMathMaxPermutations(n, k);
  
  if (count < 4 || count > 20) { alert("System checks limit team counts between 4 and 20."); return; }
  if (k > n) { alert("Sequence draw steps (k) cannot exceed structural pool cap sizes (n)."); return; }
  if (targetPerms > absoluteMax) { alert(`Mathematical Impossibility: Weight limits exceed absolute pool caps (${absoluteMax}).`); return; }
  
  const permInputs = document.querySelectorAll('.clan-perm-input');
  const nameInputs = document.querySelectorAll('.clan-name-input');
  
  let weightSum = 0;
  const parsedTeams = [];
  
  permInputs.forEach((input, idx) => {
    const w = parseInt(input.value) || 0;
    weightSum += w;
    parsedTeams.push({
      name: nameInputs[idx].value.trim() || `Team ${idx + 1}`,
      perms: w
    });
  });
  
  if (weightSum !== targetPerms) {
    alert(`Configuration Balance Error: Weight totals (${weightSum}) must equal target requirements (${targetPerms}).`);
    return;
  }
  
  activeConfig.teamCount = count;
  activeConfig.totalBalls = n;
  activeConfig.drawSize = k;
  activeConfig.targetPerms = targetPerms;
  activeConfig.teams = parsedTeams;
  
  resetRuntimeEngine();
  switchTab('lottery');
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
    const activeUnseededList = runtimeState.teams.filter(t => !t.hasSecuredPlacement);
    winner = activeUnseededList[0];
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