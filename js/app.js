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