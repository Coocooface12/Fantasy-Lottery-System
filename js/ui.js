// =======================================================
// USER INTERFACE
// Updates everything visible on the screen
// =======================================================

function renderLotteryInterface() {

  const row = document.getElementById('balls-row');
  if (!row) return;

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

  let targetDraftPositionNum;

if (activeConfig.revealMode === "reverse") {

  targetDraftPositionNum =
    activeConfig.teamCount - runtimeState.currentRoundIndex;

} else {

  targetDraftPositionNum =
    runtimeState.currentRoundIndex + 1;

}


  if (runtimeState.roundWinner) {

    winnerArea.innerHTML = `
      <div class="winner-banner">

        <div class="winner-label">
          Sequence Found — Allocation Complete
        </div>

        <div class="winner-name">
          ${runtimeState.roundWinner.name}
        </div>

        <div class="winner-perm">
          Secures 
          <strong>
            Pick #${targetDraftPositionNum}
          </strong>
          on loop sequence:
          [ ${runtimeState.drawnBalls.join(' → ')} ]
        </div>

      </div>
    `;

  } else {

    winnerArea.innerHTML = '';

  }



  const grid = document.getElementById('teams-grid');

  grid.innerHTML = '';


  const nonSeededActiveTeams =
    runtimeState.teams.filter(t => !t.hasSecuredPlacement);


  const aggregateLivePermsPool =
    nonSeededActiveTeams.reduce(
      (acc, t) => acc + t.livePermutations.length,
      0
    );



  runtimeState.teams.forEach(t => {


    const card = document.createElement('div');


    const matchesCurrentWinner =
      runtimeState.roundWinner &&
      runtimeState.roundWinner.id === t.id;


    const isEliminatedPreviousRound =
      t.hasSecuredPlacement &&
      !matchesCurrentWinner;


    const outOfSystemContention =
      !t.hasSecuredPlacement &&
      t.livePermutations.length === 0 &&
      runtimeState.drawnBalls.length > 0;



    card.className =
      'team-card' +
      (isEliminatedPreviousRound ? ' eliminated' : '') +
      (matchesCurrentWinner ? ' winner-card' : '') +
      (outOfSystemContention ? ' no-surviving' : '');



    let displayPercentage = '0.0';
    let progressBarWidthPercent = 0;



    if (!t.hasSecuredPlacement && aggregateLivePermsPool > 0) {

      const calculatedRatio =
        (t.livePermutations.length / aggregateLivePermsPool) * 100;


      displayPercentage =
        calculatedRatio.toFixed(1);


      progressBarWidthPercent =
        calculatedRatio;
    }



    let dynamicStatusText = '';


    if (t.hasSecuredPlacement) {

      const boardPlacementIdx =
        runtimeState.draftBoard.findIndex(
          entry => entry && entry.teamName === t.name
        );


      dynamicStatusText =
        `Locked in Draft Pick Slot #${boardPlacementIdx + 1}`;


    } else if (runtimeState.drawnBalls.length === 0) {


      dynamicStatusText =
        `${t.assignedPermsCount} Static Baseline Keys`;


    } else {


      dynamicStatusText =
        `${t.livePermutations.length} / ${t.allPermutations.length} Combinations Alive`;

    }



    card.innerHTML = `

      <div class="team-top">

        <div class="team-name">
          ${t.name}
        </div>


        <button 
          class="view-perms-btn"
          ${t.hasSecuredPlacement
            ? 'disabled style="opacity:0;cursor:default;"'
            : ''}
          onclick="openPermModal(${t.id})">

          Keys ↗

        </button>

      </div>


      <div class="team-mid-row">

        <div class="team-perms-badge">
          ${t.assignedPermsCount} WT
        </div>


        <div class="team-pct">

          ${t.hasSecuredPlacement
            ? 'Locked'
            : displayPercentage + '% Match'}

        </div>

      </div>


      <div class="perm-bar-bg">

        <div 
          class="perm-bar-fill"
          style="width:${progressBarWidthPercent}%">
        </div>

      </div>


      <div class="team-surviving">

        <span>
          ${dynamicStatusText}
        </span>

      </div>

    `;


    grid.appendChild(card);

  });



  const controlsStrip =
    document.getElementById('controls-row');


  controlsStrip.innerHTML = '';


  const completelyFinished =
    runtimeState.draftBoard.every(
      slot => slot !== null
    );



  if (completelyFinished) {


    const doneBtn =
      document.createElement('button');


    doneBtn.className =
      'btn btn-gold';


    doneBtn.textContent =
      'Draft Board Locked — View Consolidated Standings';


    doneBtn.onclick =
      () => switchTab('picks');


    controlsStrip.appendChild(doneBtn);



  } else if (runtimeState.roundDone) {


    const advanceBtn =
      document.createElement('button');


    advanceBtn.className =
      'btn btn-gold';


    advanceBtn.textContent =
      `Initialize Next Lottery Round`;


    advanceBtn.onclick =
      advanceToNextLotteryRound;


    controlsStrip.appendChild(advanceBtn);

  }



  const abortResetBtn =
    document.createElement('button');


  abortResetBtn.className =
    'btn btn-outline';


  abortResetBtn.textContent =
    'Reset Draft Engine';


  abortResetBtn.onclick = () => {

    if (
      confirm(
        "Reset active tracking setups? Progress details will be dropped."
      )
    ) {

      resetRuntimeEngine();

    }

  };


  controlsStrip.appendChild(abortResetBtn);



  const badge =
    document.getElementById('round-badge');


if (completelyFinished) {

  badge.textContent =
    "Lottery Sequencer Finished";

} else {

  const resolvingPick =
    activeConfig.revealMode === "reverse"

      ? activeConfig.teamCount - runtimeState.currentRoundIndex

      : runtimeState.currentRoundIndex + 1;


  badge.textContent =
    `Round ${runtimeState.currentRoundIndex + 1} — Resolving Pick #${resolvingPick}`;

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

function updateRoundBadgeVisibility(tabName){

    const badge =
        document.getElementById(
            'round-badge'
        );


    if(!badge) return;


    if(
        tabName === "lottery" ||
        tabName === "picks"
    ){

        badge.style.display = "block";

    }
    else {

        badge.style.display = "none";

    }

}

function switchTab(targetTabName) {

  updateRoundBadgeVisibility(targetTabName);

  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  
  document.getElementById('tab-' + targetTabName).classList.add('active');
  
  const linkIndexMap = {'lottery': 0, 'picks': 1, 'admin': 2};
  document.querySelectorAll('.tab')[linkIndexMap[targetTabName]].classList.add('active');
  
  if (targetTabName === 'picks') renderDraftBoardResults();
if (targetTabName === 'admin') {


    renderAdminTeamRows(
        activeConfig.teams
    );


    const revealButtons =
        document.querySelectorAll(
            '#cfg-reveal-mode .selector-btn'
        );


    revealButtons.forEach(btn => {


        btn.classList.toggle(
            'active',
            btn.dataset.value === activeConfig.revealMode
        );


    });
updateLotteryFormatSelector();

}
  if (targetTabName === 'lottery') renderLotteryInterface();
}

window.addEventListener('DOMContentLoaded', () => {

  populateLotteryFormats();

  initSystemOnBoot();

});
