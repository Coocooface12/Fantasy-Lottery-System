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

 function renderLotteryInterface() { 

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
    }

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