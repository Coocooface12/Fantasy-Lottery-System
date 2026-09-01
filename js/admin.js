// =======================================================
// LOTTERY FORMAT SELECTOR
// Loads preset configurations
// =======================================================


function populateLotteryFormats(){

    const selector =
        document.getElementById(
            'cfg-lottery-format'
        );


    if(!selector) return;


    selector.innerHTML = '';


    Object.keys(lotteryFormats).forEach(format=>{


        const option =
            document.createElement('option');


        option.value = format;
        option.textContent = format;


        selector.appendChild(option);


    });


    selector.value =
        activeConfig.lotteryFormat;

}





function applyLotteryFormat(){


    const selected =
        document.getElementById(
            'cfg-lottery-format'
        ).value;



    const format =
        lotteryFormats[selected];



    if(!format) return;



    activeConfig.lotteryFormat =
        selected;



    activeConfig.teamCount =
        format.teamCount;



    activeConfig.totalBalls =
        format.totalBalls;



    activeConfig.drawSize =
        format.drawSize;



    activeConfig.targetPerms =
        getMathMaxPermutations(
            format.totalBalls,
            format.drawSize
        );



    document.getElementById(
        'cfg-team-count'
    ).value =
        activeConfig.teamCount;



    document.getElementById(
        'cfg-balls-pool'
    ).value =
        activeConfig.totalBalls;



    document.getElementById(
        'cfg-draw-size'
    ).value =
        activeConfig.drawSize;



    document.getElementById(
        'cfg-max-perms'
    ).value =
        activeConfig.targetPerms;



    activeConfig.teams =
        generateDefaultWeightedTeams(
            activeConfig.teamCount,
            activeConfig.targetPerms
        );



    renderAdminTeamRows(
        activeConfig.teams
    );


}
// =======================================================
// CALCULATE PERMUTATION LIMITS
// Runs whenever balls or draw size changes
// =======================================================

function calculateMathLimits() {

  const n =
    parseInt(document.getElementById('cfg-balls-pool').value) || 4;

  const k =
    parseInt(document.getElementById('cfg-draw-size').value) || 2;


  const absoluteMax =
    getMathMaxPermutations(n, k);



  document.getElementById('math-max-hint').textContent =
    `Absolute limit for chosen ball config: ${absoluteMax}`;



  const targetInput =
    document.getElementById('cfg-max-perms');


  targetInput.value = absoluteMax;
  activeConfig.targetPerms = absoluteMax;


  /*
    IMPORTANT:
    Do NOT rebuild activeConfig.teams from the HTML inputs here.
    
    The HTML is the display layer.
    activeConfig is the data layer.
  */


  if (
    activeConfig.teams &&
    activeConfig.teams.length > 0
  ) {

    recalculateTeamWeights(absoluteMax);

  }

}


// =======================================================
// PRESERVE TEAM ODDS WHILE CHANGING TOTAL PERMUTATIONS
// =======================================================

function recalculateTeamWeights(newTotal) {


  if (
    !activeConfig.teams ||
    activeConfig.teams.length === 0
  ) {
    return;
  }



  const oldTotal =
    activeConfig.teams.reduce(
      (sum,team)=>
        sum + team.perms,
      0
    );



  if(oldTotal <= 0){
    return;
  }



  let runningTotal = 0;



  activeConfig.teams.forEach((team,index)=>{


    if(index === activeConfig.teams.length - 1){


      team.perms =
        newTotal - runningTotal;


    } else {


      const percentage =
        team.perms / oldTotal;



      team.perms =
        Math.round(
          percentage * newTotal
        );



      runningTotal += team.perms;

    }


  });



  renderAdminTeamRows(
    activeConfig.teams
  );

}




// =======================================================
// RENDER ADMIN TEAM TABLE
// =======================================================

function renderAdminTeamRows(teamsArray) {


  const container =
    document.getElementById(
      'admin-teams-container'
    );


  if (!container) return;



  container.innerHTML =
    '';



  const targetPerms =
    parseInt(
      document.getElementById('cfg-max-perms').value
    )
    ||
    720;



  teamsArray.forEach((t,i)=>{


    const row =
      document.createElement('div');


    row.className =
      'admin-team-row';



    const pct =
      (
        (t.perms / targetPerms)
        *
        100
      )
      .toFixed(1);




    row.innerHTML = `

      <input 
        class="admin-input clan-name-input"
        data-index="${i}"
        value="${t.name}"
        placeholder="Team Name"
      />


      <input 
        class="admin-input clan-perm-input"
        type="number"
        min="1"
        data-index="${i}"
        value="${t.perms}"
        oninput="updateAdminTotal()"
        style="text-align:center;"
      />


      <div 
        class="clan-pct-label"
        id="apct-${i}"
        style="
          font-size:14px;
          font-weight:500;
          color:var(--silver);
          text-align:right;
          padding-right:12px;
        "
      >
        ${pct}%
      </div>

    `;



    container.appendChild(row);


  });



  updateAdminTotal();

}




// =======================================================
// UPDATE TOTAL DISPLAY
// =======================================================

function updateAdminTotal() {


  const permInputs =
    document.querySelectorAll(
      '.clan-perm-input'
    );


  const pctLabels =
    document.querySelectorAll(
      '.clan-pct-label'
    );


  const targetPerms =
    parseInt(
      document.getElementById(
        'cfg-max-perms'
      ).value
    )
    ||
    0;

  let total = 0;

  permInputs.forEach(input=>{

    total +=
      parseInt(input.value)
      ||
      0;

  });




  permInputs.forEach((input,index)=>{


    const value =
      parseInt(input.value)
      ||
      0;



    const pct =
      total > 0
      ?
      ((value / total) * 100).toFixed(1)
      :
      '0.0';



    if(pctLabels[index]){

      pctLabels[index].textContent =
        `${pct}%`;

    }


  });




  const lbl =
    document.getElementById(
      'total-label'
    );



  if(lbl){

    lbl.textContent =
      `Total Weight Allocated: ${total} / ${targetPerms} Targets`;



    lbl.className =
      'total-perms '
      +
      (
        total === targetPerms
        ?
        'ok'
        :
        'over'
      );

  }

}




// =======================================================
// TEAM COUNT CHANGE
// =======================================================

function handleTeamCountChange() {


  let count =
    parseInt(
      document.getElementById(
        'cfg-team-count'
      ).value
    )
    ||
    8;



  if(count < 4){

    count = 4;

    document.getElementById(
      'cfg-team-count'
    ).value = 4;

  }



  if(count > 20){

    count = 20;

    document.getElementById(
      'cfg-team-count'
    ).value = 20;

  }




  const targetPerms =
    parseInt(
      document.getElementById(
        'cfg-max-perms'
      ).value
    )
    ||
    720;



  const transientTeams =
    generateDefaultWeightedTeams(
      count,
      targetPerms
    );



  activeConfig.teams =
    transientTeams;



  renderAdminTeamRows(
    transientTeams
  );

}




// =======================================================
// APPLY SETTINGS
// =======================================================

function applySettings() {


 const revealMode =
    document.getElementById(
        'cfg-reveal-mode'
    ).value;



  const n =
    parseInt(
      document.getElementById(
        'cfg-balls-pool'
      ).value
    );



  const k =
    parseInt(
      document.getElementById(
        'cfg-draw-size'
      ).value
    );



  const targetPerms =
    parseInt(
      document.getElementById(
        'cfg-max-perms'
      ).value
    );



  const absoluteMax =
    getMathMaxPermutations(
      n,
      k
    );




  if(count < 4 || count > 20){

    alert(
      "System checks limit team counts between 4 and 20."
    );

    return;

  }



  if(k > n){

    alert(
      "Sequence draw size cannot exceed ball pool size."
    );

    return;

  }




  if(targetPerms !== absoluteMax){

    alert(
      `Permutation Pool Error: Your target (${targetPerms}) must equal ${absoluteMax}.`
    );

    return;

  }




  const permInputs =
    document.querySelectorAll(
      '.clan-perm-input'
    );


  const nameInputs =
    document.querySelectorAll(
      '.clan-name-input'
    );



  let weightSum = 0;


  const parsedTeams = [];



  permInputs.forEach((input,index)=>{


    const weight =
      parseInt(input.value)
      ||
      0;



    weightSum += weight;



    parsedTeams.push({

      name:
        nameInputs[index].value.trim()
        ||
        `Team ${index+1}`,


      perms:
        weight

    });


  });




  if(weightSum !== targetPerms){

    alert(
      `Configuration Balance Error: ${weightSum} must equal ${targetPerms}.`
    );

    return;

  }




  activeConfig.teamCount =
    count;


  activeConfig.totalBalls =
    n;


  activeConfig.drawSize =
    k;


  activeConfig.revealMode =
    revealMode;


  activeConfig.teams =
    parsedTeams;



  resetRuntimeEngine();

  switchTab('lottery');

}




// =======================================================
// RESET DEFAULT SETTINGS
// =======================================================

function resetSettingsToDefault(){


  if(
    confirm(
      "Restore default configurations? Current setups will be overwritten."
    )
  ){

    initSystemOnBoot();

    switchTab('lottery');

  }

}