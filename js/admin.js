
// =======================================================
// LOTTERY FORMAT SELECTOR
// Loads preset configurations
// =======================================================


// =======================================================
// LOTTERY FORMAT BUTTON SELECTOR
// =======================================================

function populateLotteryFormats(){


    const selector =
        document.getElementById(
            'cfg-lottery-format'
        );


    if(!selector) return;



    selector.innerHTML = '';



    Object.keys(lotteryFormats).forEach(format=>{


        const button =
            document.createElement('button');



        button.className =
            'selector-btn';



        button.dataset.value =
            format;



        button.innerHTML = format;



        button.onclick = () => {


            applyLotteryFormat(
                format,
                button
            );


        };



        selector.appendChild(button);


    });



    updateLotteryFormatSelector();
    populateCurveSelector();


}

function applyLotteryFormat(selected, button){

    const format =
    lotteryFormats[selected];


// Custom mode doesn't overwrite the current settings.
// It simply becomes the active format.

if(selected === "Custom"){

    activeConfig.lotteryFormat = "Custom";

    updateLotteryFormatSelector();

    return;

}




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



   const teamInput =
    document.getElementById(
        'cfg-team-count'
    );

if(teamInput){

    teamInput.value =
        activeConfig.teamCount;

}


const ballInput =
    document.getElementById(
        'cfg-balls-pool'
    );

if(ballInput){

    ballInput.value =
        activeConfig.totalBalls;

}


const drawInput =
    document.getElementById(
        'cfg-draw-size'
    );

if(drawInput){

    drawInput.value =
        activeConfig.drawSize;

}


const permInput =
    document.getElementById(
        'cfg-max-perms'
    );

if(permInput){

    permInput.value =
        activeConfig.targetPerms;

}


activeConfig.curveType =
    format.curve || "Flat Curve";

const selectedCurve =
    lotteryCurves[
        activeConfig.curveType
    ];


let percentages = null;


if(selectedCurve){

    if(selectedCurve.type === "flat"){

        percentages =
            Array(
                activeConfig.teamCount
            )
            .fill(
                100 /
                activeConfig.teamCount
            );

    }

    else if(selectedCurve.values){

        percentages =
            [
                ...selectedCurve.values
            ];


        while(
            percentages.length <
            activeConfig.teamCount
        ){

            const lastValue =
                percentages[
                    percentages.length - 1
                ];


            percentages.push(
                Number(
                    (
                        lastValue / 2
                    )
                    .toFixed(2)
                )
            );

        }


        if(
            percentages.length >
            activeConfig.teamCount
        ){

            percentages =
                percentages.slice(
                    0,
                    activeConfig.teamCount
                );

        }


        const total =
            percentages.reduce(
                (sum,value)=>
                    sum + value,
                0
            );


        percentages =
            percentages.map(value =>
                Number(
                    (
                        (value / total) * 100
                    )
                    .toFixed(1)
                )
            );

    }

}



activeConfig.teams =
generateDefaultWeightedTeams(
    activeConfig.teamCount,
    activeConfig.targetPerms,
    percentages
);



    renderAdminTeamRows(
        activeConfig.teams
    );

    updateLotteryFormatSelector();

    updateCurveSelector();

    renderLotterySelectors();

}

function updateLotteryFormatSelector(){


    const buttons =
        document.querySelectorAll(
            '#cfg-lottery-format .selector-btn'
        );



    buttons.forEach(btn => {


        btn.classList.toggle(

            'active',

            btn.dataset.value ===
            activeConfig.lotteryFormat

        );


    });

}

// =======================================================
// BUTTON SELECTOR - DRAFT REVEAL MODE
// =======================================================

// =======================================================
// UNIVERSAL BUTTON SELECTOR
// Used by all admin button controls
// =======================================================

function setSelectorValue(configKey, value, button) {


    activeConfig[configKey] = value;



    const selector =
        button.closest('.selector-row');


    if (!selector) return;



    const buttons =
        selector.querySelectorAll(
            '.selector-tile'
        );



    buttons.forEach(btn => {

        btn.classList.remove(
            'active'
        );

    });



    button.classList.add(
        'active'
    );


}

// =======================================================
// SWITCH TO CUSTOM LOTTERY FORMAT
// =======================================================

function switchToCustomFormat(){

    if(activeConfig.lotteryFormat === "Custom"){
        return;
    }

    activeConfig.lotteryFormat = "Custom";

    updateLotteryFormatSelector();

}

// =======================================================
// CALCULATE PERMUTATION LIMITS
// Runs whenever balls or draw size changes
// =======================================================

function calculateMathLimits(){

  switchToCustomFormat();

    const n =
    pendingConfig.totalBalls || 4;


const k =
    pendingConfig.drawSize || 2;



    const absoluteMax =
        getMathMaxPermutations(
            n,
            k
        );



    document.getElementById(
        'math-max-hint'
    ).textContent =
        `Absolute limit for chosen ball config: ${absoluteMax}`;



    document.getElementById(
        'cfg-max-perms'
    ).value =
        absoluteMax;



    pendingConfig.targetPerms =
    absoluteMax;



    if(
    pendingConfig.teams &&
    pendingConfig.teams.length > 0
){


        pendingConfig.teams.forEach(team=>{


            if(
                team.percentage === undefined ||
                team.percentage === null
            ){

                team.percentage =
                    Number(
                        (
                            (team.perms /
                             pendingConfig.targetPerms)
                            *
                            100
                        )
                        .toFixed(1)
                    );

            }


        });



        recalculateTeamWeights(
            absoluteMax
        );


    }


}

// =======================================================
// PRESERVE TEAM ODDS WHILE CHANGING TOTAL PERMUTATIONS
// =======================================================

function recalculateTeamWeights(newTotal) {


    if(
        !activeConfig.teams ||
        activeConfig.teams.length === 0
    ){
        return;
    }


    let runningTotal = 0;


    activeConfig.teams.forEach((team,index)=>{


        if(index === activeConfig.teams.length - 1){

            team.perms =
                newTotal - runningTotal;

        }
        else{

            team.perms =
                Math.round(
                    (team.percentage / 100)
                    *
                    newTotal
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


    if(!container) return;


    container.innerHTML = "";


    teamsArray.forEach((team,index)=>{


        const row =
            document.createElement('div');


        row.className =
            "admin-team-row";



        const percentageHTML =
    activeConfig.editMode === "percentages"

    ?

    `
    <input
        class="clan-percent-input"
        type="text"
        inputmode="decimal"
        value="${Number(team.percentage).toFixed(1)}"
        data-index="${index}"
        oninput="
            this.value=this.value.replace(/[^0-9.]/g,'');
            activeConfig.teams[${index}].percentage =
                parseFloat(this.value) || 0;
            updateAdminTotal();
        "
    >
    `

    :

    `

    <div class="clan-pct-label">
        ${Number(team.percentage).toFixed(1)}%
    </div>

    `;



        const permutationHTML =
    activeConfig.editMode === "permutations"

    ?

    `
    <input
        class="clan-perm-input"
        type="text"
        inputmode="numeric"
        value="${team.perms}"
        data-index="${index}"
        oninput="
            this.value=this.value.replace(/[^0-9]/g,'');
            activeConfig.teams[${index}].perms =
                parseInt(this.value) || 0;
            updateAdminTotal();
        "
    >
    `

    :

    `

    <div class="clan-perm-label">
        ${team.perms}
    </div>

    `;



        row.innerHTML = `


           <input
    class="admin-input clan-name-input"
    data-index="${index}"
    value="${team.name}"
    placeholder="Team Name"
    oninput="
        activeConfig.teams[${index}].name = this.value;
    "
/>

            ${permutationHTML}


            ${percentageHTML}


        `;



        container.appendChild(row);


    });


    updateAdminTotal();

}

function updatePermutationMode(index,value){

  switchToCustomFormat();

    const perms =
        parseInt(value);


    if(isNaN(perms)){
        return;
    }



    activeConfig.teams[index].perms =
        perms;



    const total =
        activeConfig.teams.reduce(
            (sum,team)=>
                sum + team.perms,
            0
        );



    activeConfig.teams.forEach(team=>{


        team.percentage =
            total > 0

            ?

            Number(
                (
                    (team.perms / total) * 100
                )
                .toFixed(1)
            )

            :

            0;


    });


    const pctInputs =
    document.querySelectorAll(
        '.clan-percent-input'
    );


const pctLabels =
    document.querySelectorAll(
        '.clan-pct-label'
    );



pctInputs.forEach((input,i)=>{

    input.value =
        activeConfig.teams[i].percentage;


});



pctLabels.forEach((label,i)=>{

    label.textContent =
        activeConfig.teams[i].percentage
        +
        "%";

});

updateAdminTotal();

}


function updatePercentageMode(index, value){

    console.log(
        "START",
        index,
        value
    );


    switchToCustomFormat();


    const percentage =
        Number(value) || 0;


    activeConfig.teams[index].percentage =
        percentage;



    const targetPerms =
        parseInt(
            document.getElementById(
                'cfg-max-perms'
            ).value
        )
        ||
        0;



    console.log(
        "Before calculation:",
        activeConfig.teams[index]
    );



    activeConfig.teams.forEach(team => {

        team.perms =
            Math.round(
                (team.percentage / 100)
                *
                targetPerms
            );

    });



    console.log(
        "After calculation:",
        activeConfig.teams[index]
    );



    updateAdminTotal();

}

// =======================================================
// UPDATE TOTAL DISPLAY
// =======================================================

function updateAdminTotal(){


    const targetPerms =
        parseInt(
            document.getElementById(
                'cfg-max-perms'
            ).value
        )
        ||
        0;



    const total =
        activeConfig.teams.reduce(
            (sum,team)=>
                sum + team.perms,
            0
        );



    const pctLabels =
        document.querySelectorAll(
            '.clan-pct-label'
        );



    pctLabels.forEach((label,index)=>{


        if(activeConfig.teams[index]){


            label.textContent =
                Number(
                    activeConfig.teams[index].percentage
                )
                .toFixed(1)
                +
                "%";


        }


    });



    const permLabels =
        document.querySelectorAll(
            '.clan-perm-label'
        );



    permLabels.forEach((label,index)=>{


        if(activeConfig.teams[index]){


            label.textContent =
                activeConfig.teams[index].perms;


        }


    });



    const lbl =
        document.getElementById(
            'total-label'
        );



    if(lbl){


        lbl.textContent =
            "Total weight Allocated: "
            +
            total
            +
            " / "
            +
            targetPerms
            +
            " Targets";



        lbl.className =
            "total-perms "
            +
            (
                total === targetPerms
                ?
                "ok"
                :
                "over"
            );


    }


}

// =======================================================
// TEAM COUNT CHANGE
// =======================================================

function handleTeamCountChange() {


    let count =
    pendingConfig.teamCount || 8;



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



    const currentCurve =
    lotteryCurves[
        pendingConfig.curveType
    ];



    let percentages = [];



   if(currentCurve){

    if(currentCurve.type === "flat"){

        percentages =
            Array(count).fill(
                100 / count
            );

    }
    else{

        percentages =
        [
            ...currentCurve.values
        ];

    }



    /*
        Expanding team count
    */

    while(percentages.length < count){


        const lastValue =
            percentages[
                percentages.length - 1
            ];


        percentages.push(
            Number(
                (
                    lastValue / 2
                )
                .toFixed(2)
            )
        );


    }



    /*
        Reducing team count
    */

    if(percentages.length > count){

        percentages =
            percentages.slice(
                0,
                count
            );

    }



    /*
        Normalize back to 100%
    */

    const total =
        percentages.reduce(
            (sum,value)=>
                sum + value,
            0
        );



    percentages =
        percentages.map(value =>
            Number(
                (
                    (value / total) * 100
                )
                .toFixed(1)
            )
        );


}
    else{


        /*
            Fallback for Custom mode
        */

        percentages =
            Array(count).fill(
                100 / count
            );


    }



    pendingConfig.teamCount =
    count;



    pendingConfig.teams =
    generateDefaultWeightedTeams(
        count,
        targetPerms,
        percentages
    );



    renderAdminTeamRows(
    pendingConfig.teams
);


}




// =======================================================
// APPLY SETTINGS
// =======================================================

function applySettings(){

    const summaryHTML = `

        <b>Lottery Format:</b>
        ${activeConfig.lotteryFormat}

        <br><br>

        <b>Teams:</b>
        ${activeConfig.teamCount}

        <br><br>

        <b>Ball Pool:</b>
        ${activeConfig.totalBalls}

        <br><br>

        <b>Draw Size:</b>
        ${activeConfig.drawSize}

        <br><br>

        <b>Reveal Mode:</b>
        ${activeConfig.revealMode}

    `;


    showConfirm(

        "Confirm Lottery Settings",

        summaryHTML,

        applyConfirmedSettings

    );

}

function applyConfirmedSettings() {


 const revealMode =
    pendingConfig.revealMode;

const count =
    pendingConfig.teamCount;

const n =
    pendingConfig.totalBalls;

const k =
    pendingConfig.drawSize;

const targetPerms =
    pendingConfig.targetPerms;



  const absoluteMax =
    getMathMaxPermutations(
      n,
      k
    );




  if(count < 4 || count > 20){

   showWarning(
    "Team Count Error",
    `
    System checks limit team counts between 4 and 20.
    `
);

    return;

  }



  if(k > n){

    showWarning(
    "Draw Size Error",
    `
    Sequence draw size cannot exceed ball pool size.
    `
);

    return;

  }




  if(targetPerms !== absoluteMax){

   showWarning(
    "Permutation Pool Error",
    `
    Your target permutation pool does not match the selected lottery settings.
    <br><br>

    Required:
    <b>${absoluteMax}</b>

    <br>

    Current:
    <b>${targetPerms}</b>
    `
);

    return;

  }

const nameInputs =
    document.querySelectorAll(
        '.clan-name-input'
    );


let weightSum = 0;

let percentageSum = 0;

const parsedTeams = [];


activeConfig.teams.forEach((team,index)=>{


    const weight =
        team.perms;


    weightSum += weight;

percentageSum += Number(team.percentage) || 0;

parsedTeams.push({

  name:
    nameInputs[index].value.trim()
    ||
    `Team ${index+1}`,

  seed:
    index + 1,

  percentage:
    activeConfig.teams[index]?.percentage
    ??
    Number(
      (
        (weight / targetPerms) * 100
      ).toFixed(1)
    ),

  perms:
    weight

});


  });




if(
    activeConfig.editMode === "permutations"
){

    if(weightSum !== targetPerms){

        showWarning(

            "Permutation Error",

            `
            Your team weights do not equal the required permutation pool.
            <br><br>

            Required:
            <b>${targetPerms}</b>

            <br>

            Current:
            <b>${weightSum}</b>
            `

        );

        return;

    }

}



if(
    activeConfig.editMode === "percentages"
){

    if(
        Math.abs(percentageSum - 100) > 0.000001
    ){

        showWarning(

            "Percentage Error",

            `
            Team percentages must equal 100%.
            <br><br>

            Current Total:
            <b>${percentageSum.toFixed(1)}%</b>

            `

        );

        return;

    }

}

activeConfig = structuredClone(pendingConfig);

pendingConfig = structuredClone(activeConfig);

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

function setTeamEditMode(mode){

    activeConfig.editMode = mode;


    const permBtn =
        document.getElementById(
            'edit-perms-btn'
        );


    const pctBtn =
        document.getElementById(
            'edit-percent-btn'
        );


    if(mode === "permutations"){

        permBtn.className =
            "btn btn-gold";

        pctBtn.className =
            "btn btn-outline";

    }
    else {

        pctBtn.className =
            "btn btn-gold";

        permBtn.className =
            "btn btn-outline";

    }


    renderAdminTeamRows(
        activeConfig.teams
    );

}
