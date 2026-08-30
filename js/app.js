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

// =======================================================
// USER INTERFACE
// Updates everything visible on the screen
// =======================================================

function renderLotteryInterface() {
  const row = document.getElementById('balls-row');
  if(!row) return;
  row.innerHTML = '';
  
  for (let i = 1; i <= activeConfig.totalBalls; i++) {
    const isDrawn = runtimeState.drawnBalls.includes(i);
    const btn = document.createElement('button');
    btn.className = 'ball' + (isDrawn ? ' drawn' : '');
    btn.textContent = i;
    btn.disabled = isDrawn || runtimeState.roundDone;
    if (!isDrawn && !runtimeState.roundDone) {
      btn.onclick = () => drawBall(i);
    }
    row.appendChild(btn);
  }
  
  const seqDisplay = document.getElementById('sequence-display');
  seqDisplay.innerHTML = '';
  for (let i = 0; i < activeConfig.drawSize; i++) {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'seq-arrow';
      arrow.textContent = '→';
      seqDisplay.appendChild(arrow);
    }
    if (i < runtimeState.drawnBalls.length) {
      const b = document.createElement('div');
      b.className = 'seq-ball';
      b.textContent = runtimeState.drawnBalls[i];
      seqDisplay.appendChild(b);
    } else {
      const slot = document.createElement('div');
      slot.className = 'seq-slot';
      slot.textContent = (i + 1);
      seqDisplay.appendChild(slot);
    }
  }

  const winnerArea = document.getElementById('winner-area');
  const targetDraftPositionNum = activeConfig.teamCount - runtimeState.currentRoundIndex;
  
  if (runtimeState.roundWinner) {
    winnerArea.innerHTML = `
      <div class="winner-banner">
        <div class="winner-label">Sequence Found — Allocation Complete</div>
        <div class="winner-name">${runtimeState.roundWinner.name}</div>
        <div class="winner-perm">Secures <strong>Pick #${targetDraftPositionNum}</strong> on loop sequence: [ ${runtimeState.drawnBalls.join(' → ')} ]</div>
      </div>
    `;
  } else {
    winnerArea.innerHTML = '';
  }

  const grid = document.getElementById('teams-grid');
  grid.innerHTML = '';
  
  const nonSeededActiveTeams = runtimeState.teams.filter(t => !t.hasSecuredPlacement);
  const aggregateLivePermsPool = nonSeededActiveTeams.reduce((acc, t) => acc + t.livePermutations.length, 0);

  runtimeState.teams.forEach(t => {
    const card = document.createElement('div');
    const matchesCurrentWinner = runtimeState.roundWinner && runtimeState.roundWinner.id === t.id;
    const isEliminatedPreviousRound = t.hasSecuredPlacement && !matchesCurrentWinner;
    const outOfSystemContention = !t.hasSecuredPlacement && t.livePermutations.length === 0 && runtimeState.drawnBalls.length > 0;

    card.className = 'team-card' +
      (isEliminatedPreviousRound ? ' eliminated' : '') +
      (matchesCurrentWinner ? ' winner-card' : '') +
      (outOfSystemContention ? ' no-surviving' : '');

    let displayPercentage = '0.0';
    let progressBarWidthPercent = 0;
    
    if (!t.hasSecuredPlacement && aggregateLivePermsPool > 0) {
      const calculatedRatio = (t.livePermutations.length / aggregateLivePermsPool) * 100;
      displayPercentage = calculatedRatio.toFixed(1);
      progressBarWidthPercent = calculatedRatio;
    }

    let dynamicStatusText = '';
    if (t.hasSecuredPlacement) {
      const boardPlacementIdx = runtimeState.draftBoard.findIndex(entry => entry && entry.teamName === t.name);
      dynamicStatusText = `Locked in Draft Pick Slot #${boardPlacementIdx + 1}`;
    } else if (runtimeState.drawnBalls.length === 0) {
      dynamicStatusText = `${t.assignedPermsCount} Static Baseline Keys`;
    } else {
      dynamicStatusText = `${t.livePermutations.length} / ${t.allPermutations.length} Combinations Alive`;
    }

    card.innerHTML = `
      <div class="team-top">
        <div class="team-name">${t.name}</div>
        <button class="view-perms-btn" ${t.hasSecuredPlacement ? 'disabled style="opacity:0;cursor:default;"' : ''} onclick="openPermModal(${t.id})">
          Keys ↗
        </button>
      </div>
      <div class="team-mid-row">
        <div class="team-perms-badge">${t.assignedPermsCount} WT</div>
        <div class="team-pct">${t.hasSecuredPlacement ? 'Locked' : displayPercentage + '% Match'}</div>
      </div>
      <div class="perm-bar-bg"><div class="perm-bar-fill" style="width:${progressBarWidthPercent}%"></div></div>
      <div class="team-surviving"><span>${dynamicStatusText}</span></div>
    `;
    grid.appendChild(card);
  });

  const controlsStrip = document.getElementById('controls-row');
  controlsStrip.innerHTML = '';
  const completelyFinished = runtimeState.draftBoard.every(slot => slot !== null);
  
  if (completelyFinished) {
    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn btn-gold';
    doneBtn.textContent = 'Draft Board Locked — View Consolidated Standings';
    doneBtn.onclick = () => switchTab('picks');
    controlsStrip.appendChild(doneBtn);
  } else if (runtimeState.roundDone) {
    const nextRoundTargetNum = activeConfig.teamCount - 1 - runtimeState.currentRoundIndex;
    const advanceBtn = document.createElement('button');
    advanceBtn.className = 'btn btn-gold';
    advanceBtn.textContent = nextRoundTargetNum === 0 ? `Finalize Strategy (Pick #1)` : `Initialize Draw for Pick #${nextRoundTargetNum + 1}`;
    advanceBtn.onclick = advanceToNextLotteryRound;
    controlsStrip.appendChild(advanceBtn);
  }
  
  const abortResetBtn = document.createElement('button');
  abortResetBtn.className = 'btn btn-outline';
  abortResetBtn.textContent = 'Reset Draft Engine';
  abortResetBtn.onclick = () => {
    if(confirm("Reset active tracking setups? Progress details will be dropped.")) {
      resetRuntimeEngine();
    }
  };
  controlsStrip.appendChild(abortResetBtn);

  const badge = document.getElementById('round-badge');
  if (completelyFinished) {
    badge.textContent = "Lottery Sequencer Finished";
  } else {
    badge.textContent = `Round ${runtimeState.currentRoundIndex + 1} — Resolving Pick #${activeConfig.teamCount - runtimeState.currentRoundIndex}`;
  }
}

// =======================================================
// USER INTERFACE
// Updates everything visible on the screen
// =======================================================

function renderDraftBoardResults() {
  const container = document.getElementById('picks-list');
  container.innerHTML = '';
  
  for (let i = 0; i < activeConfig.teamCount; i++) {
    const entry = runtimeState.draftBoard[i];
    const cardRow = document.createElement('div');
    cardRow.className = 'pick-row';
    
    if (entry) {
      cardRow.innerHTML = `
        <div class="pick-num">${i + 1}</div>
        <div class="pick-info">
          <div class="pick-team">${entry.teamName}</div>
          <div class="pick-perm">Sequence Loop: ${entry.sequenceString} (Round ${entry.resolvedInRound})</div>
        </div>
      `;
    } else {
      cardRow.innerHTML = `
        <div class="pick-num" style="color:#2a4a7a">${i + 1}</div>
        <div class="pick-pending">Awaiting configuration verification steps...</div>
      `;
    }
    container.appendChild(cardRow);
  }
}

// =======================================================
// PERMUTATION MODAL
// Displays permutation details for a selected team
// =======================================================

function openPermModal(teamId) {
  const t = runtimeState.teams.find(x => x.id === teamId);
  if (!t) return;
  
  document.getElementById('modal-team-name').textContent = t.name;
  document.getElementById('modal-team-sub').textContent = t.hasSecuredPlacement 
    ? `Round finalized.` 
    : `${t.allPermutations.length} allocated keys — ${t.livePermutations.length} active`;
    
  const grid = document.getElementById('modal-perm-grid');
  grid.innerHTML = '';
  
  const underlyingCollection = t.hasSecuredPlacement ? [] : t.allPermutations;
  
  underlyingCollection.forEach(p => {
    const chip = document.createElement('div');
    const isStillLive = t.livePermutations.some(s => s.every((v, idx) => v === p[idx]));
    const isExactMatch = runtimeState.roundWinner && runtimeState.roundWinner.id === teamId && p.every((v, idx) => v === runtimeState.drawnBalls[idx]);
    
    chip.className = 'perm-chip' + (isExactMatch ? ' match' : !isStillLive ? ' struck' : '');
    chip.textContent = p.join('-');
    grid.appendChild(chip);
  });
  
  document.getElementById('perm-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePermModal(e) {
  if (e && e.target !== document.getElementById('perm-overlay')) return;
  document.getElementById('perm-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

// =======================================================
// NAVIGATION
// Handles switching between application tabs
// =======================================================

function switchTab(targetTabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  
  document.getElementById('tab-' + targetTabName).classList.add('active');
  
  const linkIndexMap = {'lottery': 0, 'picks': 1, 'admin': 2};
  document.querySelectorAll('.tab')[linkIndexMap[targetTabName]].classList.add('active');
  
  if (targetTabName === 'picks') renderDraftBoardResults();
  if (targetTabName === 'admin') renderAdminTeamRows(activeConfig.teams);
  if (targetTabName === 'lottery') renderLotteryInterface();
}

window.addEventListener('DOMContentLoaded', () => {
  initSystemOnBoot();
  calculateMathLimits();
});