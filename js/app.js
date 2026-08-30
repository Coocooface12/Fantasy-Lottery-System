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
