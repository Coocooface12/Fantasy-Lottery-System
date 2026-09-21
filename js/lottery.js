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

function generateDefaultWeightedTeams(
    count,
    totalPermsTarget,
    presetPercentages = null
) {

  const teamsList = [];

 let weightsRaw = [];


if(presetPercentages){

    presetPercentages.forEach(p=>{

        weightsRaw.push(p);

    });

}
else {


    for(let i = 0; i < count; i++){

        weightsRaw.push(
            Math.pow(0.82,i)
        );

    }

}


  const sumRaw =
    weightsRaw.reduce(
      (a, b) => a + b,
      0
    );


  let assignedSum = 0;


  // Convert curve into actual permutation counts
  let tempWeights =
    weightsRaw.map(w => {

      let allocated =
        Math.round(
          (w / sumRaw) * totalPermsTarget
        );


      if (allocated < 1) {
        allocated = 1;
      }


      assignedSum += allocated;


      return allocated;

    });



  // Fix rounding difference
  let discrepancy =
    totalPermsTarget - assignedSum;


  if (discrepancy !== 0) {

    tempWeights[0] += discrepancy;


    if (tempWeights[0] < 1) {

      tempWeights[0] = 1;

    }

  }



// Build team objects
for (let i = 0; i < count; i++) {

    teamsList.push({

      name: `Team ${i + 1}`,

      seed: i + 1,

      percentage:
        presetPercentages
          ? presetPercentages[i]
          : Number(
              (
                (tempWeights[i] / totalPermsTarget) * 100
              ).toFixed(1)
            ),

      perms: tempWeights[i]

    });

}


  return teamsList;

}

// =======================================================
// LOTTERY ENGINE
// Core lottery logic and draw processing
// =======================================================


function resetRuntimeEngine(render = true) {


  runtimeState.drawModeLocked = false;


  runtimeState.drawnBalls = [];

  runtimeState.roundWinner = null;

  runtimeState.roundDone = false;


  runtimeState.currentRoundIndex = 0;


  runtimeState.draftBoard =
    new Array(activeConfig.teamCount).fill(null);



  runtimeState.teams =
    activeConfig.teams.map((t, idx) => ({

      

      id: idx,

      name: t.name,

      seed: t.seed || idx + 1,

      percentage: t.percentage || 0,

      assignedPermsCount: t.perms,

      allPermutations: [],

      livePermutations: [],

      hasSecuredPlacement: false

    }));

    console.log("===== BEST POSSIBLE PICKS =====");

runtimeState.teams.forEach(team => {

    console.log({

        team: team.name,

        seed: team.seed,

        bestPick: getBestPossiblePick(team)

    });

});

  dealInitialPermutationPool();

  initializeDrawSequenceRound(false);

  if(render){
    renderLotteryInterface();

}

}

function dealInitialPermutationPool() {

  const generatedPool =
      generatePermutationPool(
          activeConfig.totalBalls,
          activeConfig.drawSize
      );


  const allCombinationsPool =
      shuffle(generatedPool);


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

function initializeDrawSequenceRound(render = true) {
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
  
  if(render){

    renderLotteryInterface();

}
}

function drawBall(ballNumber) {
  if (runtimeState.roundDone || runtimeState.drawnBalls.includes(ballNumber)) return;
  
  runtimeState.drawnBalls.push(ballNumber);

  runtimeState.drawModeLocked = true;

  updateDrawModeUI();

  renderLotteryInterface();
  
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

function runLotteryMachine(onComplete = null) {

  if(runtimeState.drawInProgress){
    return;
}

runtimeState.drawInProgress = true;

updateDrawModeUI();

    if (runtimeState.roundDone) return;

    const remainingBalls = [];

    for (let i = 1; i <= activeConfig.totalBalls; i++) {

        if (!runtimeState.drawnBalls.includes(i)) {
            remainingBalls.push(i);
        }

    }

    if (remainingBalls.length === 0) return;

    const selectedBall =
        remainingBalls[
            Math.floor(Math.random() * remainingBalls.length)
        ];

    const machineBall =
        document.getElementById("machine-ball");

    const machineStatus =
        document.getElementById("machine-status");

    machineStatus.textContent = "Mixing Balls...";

    let spinCount = 0;
let delay = 60;

function spinMachine() {

    const randomDisplay =
        remainingBalls[
            Math.floor(Math.random() * remainingBalls.length)
        ];

    machineBall.textContent = randomDisplay;

    spinCount++;

    // Slow down near the end
    if (spinCount > 10) delay += 15;

    if (spinCount < 20) {

        setTimeout(spinMachine, delay);

    } else {

        machineBall.textContent = selectedBall;

        machineBall.classList.add("reveal");

        machineStatus.textContent = "Ball Drawn";

        setTimeout(() => {

    drawBall(selectedBall);

    machineBall.classList.remove("reveal");

    machineStatus.textContent = "Ready";


    runtimeState.drawInProgress = false;

    updateDrawModeUI();


    if (onComplete) {
        onComplete();
    }

}, 800);

    }

}
spinMachine();

}

function runAutomaticRound(onComplete = null){

    if(runtimeState.roundDone){
        return;
    }


    runLotteryMachine(() => {


        if(runtimeState.roundDone){

            if(onComplete){
                onComplete();
            }

            return;

        }


        setTimeout(
            () => runAutomaticRound(onComplete),
            500
        );


    });

}

function runAutomaticLottery(){

    if(runtimeState.draftBoard.every(slot => slot !== null)){

    runtimeState.autoRunning = false;
    runtimeState.autoPaused = false;

    renderDrawControls();

    return;

}

     if(runtimeState.autoPaused){
        return;
    }


    runAutomaticRound(() => {


        if(runtimeState.draftBoard.every(slot => slot !== null)){

            return;

        }


        setTimeout(() => {

    if(runtimeState.autoPaused){
        return;
    }

    advanceToNextLotteryRound();

    runAutomaticLottery();

}, 1000);


    });

}

function getMoveUpAdjustedSlot(team){

    // No rule enabled
    if(
        !activeConfig.moveUpRule ||
        !activeConfig.moveUpRule.enabled
    ){

        return null;

    }


    const maxMove =
        activeConfig.moveUpRule.maxPositions || 0;


    const bestPossiblePick =
        Math.max(
            1,
            team.seed - maxMove
        );


    // Convert pick number to array index
    return bestPossiblePick - 1;

}

function getBestPossiblePick(team){

    if(
        !activeConfig.moveUpRule ||
        !activeConfig.moveUpRule.enabled
    ){
        return null;
    }

    const maxMove =
        activeConfig.moveUpRule.maxPositions || 0;

    let naturalPick;

    if(activeConfig.revealMode === "reverse"){

        naturalPick =
            activeConfig.teamCount -
            team.seed +
            1;

    }
    else{

        naturalPick =
            team.seed;

    }

    return Math.max(
        1,
        naturalPick - maxMove
    );

}

function getWorstPossiblePick(team){

    if(
        !activeConfig.moveDownRule ||
        !activeConfig.moveDownRule.enabled
    ){

        return null;

    }



    const maxMove =
        activeConfig.moveDownRule.maxPositions || 0;



    let naturalPick;



    if(activeConfig.revealMode === "reverse"){

        naturalPick =
            activeConfig.teamCount -
            team.seed +
            1;

    }
    else{

        naturalPick =
            team.seed;

    }



    return Math.min(
        activeConfig.teamCount,
        naturalPick + maxMove
    );

}

function insertDraftPickWithDisplacement(
    teamEntry,
    targetIndex
){

    let displaced =
        runtimeState.draftBoard[targetIndex];


    // Put new team into requested slot

    runtimeState.draftBoard[targetIndex] =
        teamEntry;



    // Nothing was displaced

    if(!displaced){
        return;
    }



    // Push displaced team down

    for(
        let i = targetIndex + 1;
        i < runtimeState.draftBoard.length;
        i++
    ){

        const next =
            runtimeState.draftBoard[i];


        runtimeState.draftBoard[i] =
            displaced;


        if(!next){
            break;
        }


        displaced = next;

    }

}

function insertWinnerIntoDraftBoard(
    draftEntry,
    targetIndex
){

    const displaced =
        runtimeState.draftBoard[targetIndex];


    // Place winner

    runtimeState.draftBoard[targetIndex] =
        draftEntry;


    // No displacement needed

    if(!displaced){
        return;
    }



    // Reverse reveal:
    // Move displaced teams toward Pick 1

    if(activeConfig.revealMode === "reverse"){

        let current =
            displaced;


        for(
            let i = targetIndex - 1;
            i >= 0;
            i--
        ){

            const next =
                runtimeState.draftBoard[i];


            runtimeState.draftBoard[i] =
                current;


            current =
                next;


            if(!current){
                break;
            }

        }

    }


    // Standard reveal:
    // Move displaced teams toward Pick N

    else{

        let current =
            displaced;


        for(
            let i = targetIndex + 1;
            i < runtimeState.draftBoard.length;
            i++
        ){

            const next =
                runtimeState.draftBoard[i];


            runtimeState.draftBoard[i] =
                current;


            current =
                next;


            if(!current){
                break;
            }

        }

    }

}

function validateDraftBoardAgainstRules(){


    let adjustmentMade = true;



    while(adjustmentMade){


        adjustmentMade = false;



        for(
            let i = 0;
            i < runtimeState.draftBoard.length;
            i++
        ){


            const entry =
                runtimeState.draftBoard[i];


            if(!entry){
                continue;
            }



            const team =
                runtimeState.teams.find(
                    t =>
                    t.name === entry.teamName
                );



            if(!team){
                continue;
            }



            const currentPick =
                i + 1;



            const bestPossiblePick =
                getBestPossiblePick(team);


            const worstPossiblePick =
                getWorstPossiblePick(team);



            let correctedPick = null;

            let adjustmentType = null;



            /*
                Team is too high.
                Example:
                Allowed range is 8-12.
                Team is sitting at 5.
            */

            if(
                bestPossiblePick &&
                currentPick < bestPossiblePick
            ){

                correctedPick =
                    bestPossiblePick;


                adjustmentType =
                    "Move Down";


            }



            /*
                Team is too low.
                Example:
                Allowed range is 8-12.
                Team is sitting at 15.
            */

            else if(
                worstPossiblePick &&
                currentPick > worstPossiblePick
            ){

                correctedPick =
                    worstPossiblePick;


                adjustmentType =
                    "Move Up";

            }



            if(correctedPick !== null){


                console.log(
                    "LEGAL RANGE ADJUSTMENT",
                    {
                        team:
                            team.name,

                        currentPick,

                        correctedPick,

                        adjustmentType,

                        bestPossiblePick,

                        worstPossiblePick

                    }
                );



                const movingEntry =
                    runtimeState.draftBoard.splice(
                        i,
                        1
                    )[0];



                runtimeState.draftBoard.splice(
                    correctedPick - 1,
                    0,
                    movingEntry
                );



                runtimeState.draftBoard =
                    runtimeState.draftBoard.slice(
                        0,
                        activeConfig.teamCount
                    );



                adjustmentMade = true;


                break;

            }

        }

    }


}

function getNextDraftSlotToResolve(){

    // Reverse reveal:
    // Resolve from last pick toward first pick.

    if(activeConfig.revealMode === "reverse"){

        for(
            let i = activeConfig.teamCount - 1;
            i >= 0;
            i--
        ){

            if(runtimeState.draftBoard[i] === null){
                return i;
            }

        }

    }

    // Standard reveal:
    // Resolve from first pick toward last pick.

    else{

        for(
            let i = 0;
            i < activeConfig.teamCount;
            i++
        ){

            if(runtimeState.draftBoard[i] === null){
                return i;
            }

        }

    }

    return -1;

}

function resolveDrawSequenceWinner() {

    const finalizedSequence =
        runtimeState.drawnBalls;


    let winner = null;



    runtimeState.teams.forEach(t => {

        if(!t.hasSecuredPlacement){

            const successfulMatch =
                t.allPermutations.find(
                    p =>
                    p.every(
                        (v, idx) =>
                        v === finalizedSequence[idx]
                    )
                );


            if(successfulMatch){

                console.log(
                    "MATCH FOUND:",
                    t.name,
                    successfulMatch.join(" → ")
                );


                if(winner){

                    console.log(
                        "DUPLICATE OWNER FOUND:",
                        winner.name,
                        "and",
                        t.name
                    );

                }


                winner = t;

            }

        }

    });



    if(!winner){

        alert(
            "No team owns this sequence. Redistribution error detected."
        );

        return;

    }



    runtimeState.roundWinner =
        winner;


    runtimeState.roundDone =
        true;


    winner.hasSecuredPlacement =
        true;



    // Determine next available draft slot

    let targetDraftSlotIndex =
        getNextDraftSlotToResolve();



    const originalPick =
        targetDraftSlotIndex + 1;



    let finalPick =
        originalPick;



    let moveUpApplied =
        false;


    let moveDownApplied =
        false;



    // Calculate legal placement range

    console.log(
    "BEFORE MOVE DOWN CALC",
    winner.name
);

    const bestPossiblePick =
        getBestPossiblePick(winner);


    const worstPossiblePick =
        getWorstPossiblePick(winner);

        console.log(
    "MOVE DOWN CHECK",
    {
        team: winner.name,
        seed: winner.seed,
        revealMode: activeConfig.revealMode,
        moveDownRule: activeConfig.moveDownRule,
        worstPossiblePick,
        originalPick
    }
);



    // Move Up Rule
    // Team cannot fall below its worst allowed outcome

    if(
        bestPossiblePick &&
        finalPick > bestPossiblePick
    ){

        finalPick =
            bestPossiblePick;


        moveUpApplied =
            true;

            "MOVE UP RULE APPLIED",
        {
            team:
                winner.name,

            originalPick,

            finalPick,

            bestPossiblePick
        }

    }



    // Move Down Rule
    // Team cannot rise above its best allowed outcome

    if(
    worstPossiblePick &&
    finalPick > worstPossiblePick
){

    finalPick =
        worstPossiblePick;


    moveDownApplied =
        true;


    console.log(
        "MOVE DOWN RULE APPLIED",
        {
            team: winner.name,
            originalPick,
            finalPick,
            worstPossiblePick
        }
    );

}



    // Convert pick number back to array index

    targetDraftSlotIndex =
        finalPick - 1;



    const draftEntry = {


        teamName:
            winner.name,



        sequenceString:

            moveUpApplied

            ?

            `Move Up Rule Applied (${originalPick} → ${finalPick}) | ${finalizedSequence.join(' → ')}`


            :


            moveDownApplied

            ?

            `Move Down Rule Applied (${originalPick} → ${finalPick}) | ${finalizedSequence.join(' → ')}`


            :


            finalizedSequence.join(' → '),



        resolvedInRound:
            runtimeState.currentRoundIndex + 1

    };



    insertWinnerIntoDraftBoard(
        draftEntry,
        targetDraftSlotIndex
    );

    validateDraftBoardAgainstRules();

    redistributePermutations(winner);

}


function redistributePermutations(eliminatedTeam) {

  // Pull the full set of combinations that belonged to the team that just
  // secured a draft slot — these are the ones that need to be handed off.
 const orphanedPermutations =
    eliminatedTeam.allPermutations.map(p => [...p]);
  
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

    const winningInSlice = grantedSlice.some(
    p => p.every((v, i) => v === runtimeState.drawnBalls[i])
);

if (winningInSlice) {
    console.log("Winning key assigned to:", t.name);
}

    t.allPermutations = [
    ...t.allPermutations,
    ...grantedSlice
].filter(
    (perm, index, self) =>
        index === self.findIndex(
            p => p.every(
                (v,i)=>v === perm[i]
            )
        )
);
    t.assignedPermsCount = t.allPermutations.length;
    
    // Keep livePermutations in sync — re-filter against whatever has been
    // drawn so far this round (normally empty right after a round resolves,
    // but this keeps state consistent if ever called mid-round).
    t.livePermutations = t.allPermutations.filter(p =>
      runtimeState.drawnBalls.every((drawn, i) => p[i] === drawn)
    );
  });

  const ownershipMap = new Map();

runtimeState.teams
    .filter(t => !t.hasSecuredPlacement)
    .forEach(t => {

        t.allPermutations.forEach(p => {

            const key = p.join("-");

            if (!ownershipMap.has(key)) {

                ownershipMap.set(
                    key,
                    {
                        owner: t,
                        perm: p
                    }
                );

            }

        });

    });


// Rebuild each surviving team's pool uniquely

runtimeState.teams
    .filter(t => !t.hasSecuredPlacement)
    .forEach(t => {

        t.allPermutations = [];

    });


ownershipMap.forEach(entry => {

    entry.owner.allPermutations.push(
        entry.perm
    );

});


runtimeState.teams
    .filter(t => !t.hasSecuredPlacement)
    .forEach(t => {

        t.assignedPermsCount =
            t.allPermutations.length;

        t.livePermutations =
            t.allPermutations.map(p => [...p]);

    });

  console.log(
    "TOTAL AFTER REDISTRIBUTION:",
    runtimeState.teams.reduce(
        (sum, t) => sum + t.allPermutations.length,
        0
    )
);
  
  // The eliminated team's own pool is now fully handed off.
  eliminatedTeam.allPermutations = [];
  eliminatedTeam.assignedPermsCount = 0;
  eliminatedTeam.livePermutations = [];
}

function getMoveUpAdjustedPick(team){

    // If rule is disabled, return normal seed
    if(
        !pendingConfig.moveUpRule ||
        !pendingConfig.moveUpRule.enabled
    ){
        return team.seed;
    }


    const maxMove =
        pendingConfig.moveUpRule.maxPositions || 0;


    const adjustedPick =
        team.seed - maxMove;


    return Math.max(
        1,
        adjustedPick
    );

}

function getAvailableDraftSlot(team){

    const preferredPick =
        getMoveUpAdjustedPick(team);


    for(
        let pick = preferredPick;
        pick <= runtimeState.draftBoard.length;
        pick++
    ){

        if(
            runtimeState.draftBoard[pick - 1] === null
        ){

            return pick - 1;

        }

    }


    return null;

}

function advanceToNextLotteryRound() {

    runtimeState.currentRoundIndex++;

    if(

    activeConfig.priorityPicksRule.enabled &&

    runtimeState.currentRoundIndex >=
    activeConfig.priorityPicksRule.picks

){

    finishPriorityPicksLottery();

    return;

}


    const remainingUnseededCount =
        runtimeState.teams.filter(
            t => !t.hasSecuredPlacement
        ).length;



    if (remainingUnseededCount === 1) {

        const finalUnseededTeam =
            runtimeState.teams.find(
                t => !t.hasSecuredPlacement
            );


        finalUnseededTeam.hasSecuredPlacement = true;



        // The final team is still a lottery winner.
        // Determine the remaining pick they win.

        let targetDraftSlotIndex =
            getNextDraftSlotToResolve();



        const originalPick =
            targetDraftSlotIndex + 1;


        let finalPick =
            originalPick;


        let moveUpApplied = false;

        let moveDownApplied = false;



        const bestPossiblePick =
            getBestPossiblePick(
                finalUnseededTeam
            );



        if (
            bestPossiblePick &&
            originalPick < bestPossiblePick
        ) {

            finalPick =
                bestPossiblePick;


            moveUpApplied = true;


            console.log(
                "FINAL TEAM MOVE UP APPLIED",
                {
                    team:
                        finalUnseededTeam.name,

                    originalPick,

                    finalPick
                }
            );

        }



        targetDraftSlotIndex =
            finalPick - 1;



        const draftEntry = {

            teamName:
                finalUnseededTeam.name,


            sequenceString:

                moveUpApplied

                ?

                `Move Up Rule Applied (${originalPick} → ${finalPick}) | Assigned Automatically (Last Remaining Contender)`

                :

                "Assigned Automatically (Last Remaining Contender)",


            resolvedInRound:
                runtimeState.currentRoundIndex + 1

        };



        insertWinnerIntoDraftBoard(
            draftEntry,
            targetDraftSlotIndex
        );

        validateDraftBoardAgainstRules();

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


  activeConfig.curveType =
    "NHL Draft Curve";


  activeConfig.curveSettings = {};


  activeConfig.revealMode =
    "reverse";


  activeConfig.lotteryFormat =
    "Fantasy Mini Lottery";


  activeConfig.editMode =
    "permutations";


  activeConfig.teams =
    generateDefaultWeightedTeams(

      activeConfig.teamCount,

      activeConfig.targetPerms

    );



  pendingConfig =
    structuredClone(activeConfig);

console.log(
    "BEFORE ADMIN RENDER",
    {
        target: pendingConfig.targetPerms,
        balls: pendingConfig.totalBalls,
        draw: pendingConfig.drawSize
    }
);

 renderAdminTeamRows(
    pendingConfig.teams
);

console.log(
    "AFTER ADMIN RENDER",
    {
        target: pendingConfig.targetPerms,
        input:
          document.getElementById('cfg-max-perms')?.value
    }
);

renderLotterySelectors();

updateLotteryFormatSelector();

updateCurveSelector();

renderPriorityPicksSelectors();


resetRuntimeEngine(false);

}

function finishPriorityPicksLottery(){

    const remainingTeams =

        runtimeState.teams

            .filter(
                t=>!t.hasSecuredPlacement
            )

            .sort(
                (a,b)=>
                    a.seed-b.seed
            );



    remainingTeams.forEach(team=>{

        const slot =

            getNextDraftSlotToResolve();



        runtimeState.draftBoard[slot]={

            teamName:
                team.name,

            sequenceString:
                "Assigned Automatically (Priority Picks Rule)",

            resolvedInRound:
                runtimeState.currentRoundIndex + 1

        };



        team.hasSecuredPlacement =
            true;

    });



    runtimeState.roundDone = true;

    renderLotteryInterface();

    switchTab("picks");

}