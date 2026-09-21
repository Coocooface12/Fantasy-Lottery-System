// =======================================================
// UNIVERSAL BUTTON SELECTOR
// =======================================================

function renderButtonSelector(

    containerId,
    minimum,
    maximum,
    selectedValue,
    clickFunction

){

    const container =
        document.getElementById(containerId);

    if(!container) return;

    container.innerHTML = "";

    for(let value = minimum; value <= maximum; value++){

        const button =
            document.createElement("button");

        button.className =
            "selector-tile";

        if(Number(value) === Number(selectedValue)){

            button.classList.add(
                "active"
            );

        }

        button.textContent =
            value;

        button.onclick = ()=>{

            clickFunction(value);

        };

        container.appendChild(button);

    }

    console.log(
    "SELECTOR RENDER:",
    {
        balls: pendingConfig.totalBalls,
        draw: pendingConfig.drawSize,
        perms: pendingConfig.targetPerms
    }
);

}

function renderLotterySelectors(){

    renderButtonSelector(

        "team-count-selector",

        4,

        20,

        pendingConfig.teamCount,

        function(value){

           pendingConfig.teamCount = value;

            const input =
    document.getElementById(
        "cfg-team-count"
    );

if(input){
    input.value = value;
}

            handleTeamCountChange();

            renderLotterySelectors();

        }

    );


    renderButtonSelector(

        "ball-pool-selector",

        4,

        20,

        pendingConfig.totalBalls,

    function(value){

        pendingConfig.totalBalls = value;

    const input =
        document.getElementById(
            "cfg-balls-pool"
        );

    if(input){
        input.value = value;
    }

    calculateMathLimits();

    renderLotterySelectors();

}

    );


    renderButtonSelector(

        "draw-size-selector",

        1,

         pendingConfig.totalBalls - 1,

    pendingConfig.drawSize,

    function(value){

        pendingConfig.drawSize = value;

    const input =
        document.getElementById(
            "cfg-draw-size"
        );

    if(input){
        input.value = value;
    }

    calculateMathLimits();

    renderLotterySelectors();

    populateCurveSelector();

}

    );

renderMoveUpRuleSelector();

    renderMoveUpToggle();

    renderMoveUpPositions();

    renderMoveDownRule();

    renderPriorityPicksToggle()

}

function populateCurveSelector(){

    const selector =
        document.getElementById(
            "curve-selector"
        );

    if(!selector) return;

    selector.innerHTML = "";

    Object.keys(lotteryCurves).forEach(curve=>{

        if(curve === "Custom Curve"){
            return;
        }

        const button =
            document.createElement("button");

        button.className =
            "selector-btn";

        button.dataset.value =
            curve;

        button.innerHTML =
            curve;

        button.onclick = ()=>{

            applyCurvePreset(curve);

        };

        selector.appendChild(button);

    });

    updateCurveSelector();

}

function updateCurveSelector(){

    const buttons =
        document.querySelectorAll(
            "#curve-selector .selector-btn"
        );

    buttons.forEach(btn=>{

        btn.classList.toggle(

            "active",

            btn.dataset.value ===
            activeConfig.curveType

        );

    });

}

function applyCurvePreset(curve){

    activeConfig.curveType =
        curve;

    switchToCustomFormat();

    handleTeamCountChange();

    updateCurveSelector();

}

function renderMoveUpRuleSelector(){


    const toggleContainer =
        document.getElementById(
            "move-up-toggle-selector"
        );


    if(!toggleContainer) return;


    toggleContainer.innerHTML = "";


    ["OFF","ON"].forEach(option=>{


        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        button.textContent =
            option;



        if(
            (option === "ON" &&
             pendingConfig.moveUpRule.enabled)
            ||
            (option === "OFF" &&
             !pendingConfig.moveUpRule.enabled)
        ){

            button.classList.add("active");

        }



        button.onclick = ()=>{


            pendingConfig.moveUpRule.enabled =
                option === "ON";


            if(
                !pendingConfig.moveUpRule.enabled
            ){

                pendingConfig.moveUpRule.maxPositions =
                    null;

            }


            renderMoveUpRuleSelector();


        };


        toggleContainer.appendChild(button);


    });



    renderMoveUpPositionSelector();


}

function renderMoveUpPositionSelector(){


    const container =
        document.getElementById(
            "move-up-position-selector"
        );


    const wrapper =
        document.getElementById(
            "move-up-position-container"
        );


    if(!container || !wrapper) return;



    container.innerHTML = "";



    if(
        !pendingConfig.moveUpRule.enabled
    ){

        wrapper.classList.add("hidden");

        return;

    }



    wrapper.classList.remove("hidden");



    const max =
        pendingConfig.teamCount - 2;



    for(
        let i = 1;
        i <= max;
        i++
    ){


        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        button.textContent =
            i;



        if(
            pendingConfig.moveUpRule.maxPositions === i
        ){

            button.classList.add("active");

        }



        button.onclick = ()=>{


            pendingConfig.moveUpRule.maxPositions =
                i;


            renderMoveUpPositionSelector();


        };


        container.appendChild(button);

    }

}

function renderMoveUpToggle(){

    const container =
        document.getElementById(
            "move-up-toggle-selector"
        );


    if(!container) return;


    container.innerHTML = "";


    ["Off","On"].forEach(option=>{


        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        const value =
            option === "On";


        if(
            pendingConfig.moveUpRule.enabled === value
        ){

            button.classList.add("active");

        }


        button.textContent =
            option;


        button.onclick = ()=>{


    pendingConfig.moveUpRule.enabled =
        value;


    if(value){

        pendingConfig.moveDownRule.enabled =
            false;

        pendingConfig.moveDownRule.maxPositions =
            null;

    }


    renderMoveUpToggle();


    renderMoveUpPositions();


    renderMoveDownToggle();


    renderMoveDownPositions();


};


        container.appendChild(button);


    });


}

function renderMoveUpPositions(){

    const container =
        document.getElementById(
            "move-up-position-container"
        );


    const selector =
        document.getElementById(
            "move-up-position-selector"
        );


    if(!container || !selector) return;



    selector.innerHTML = "";



    if(
        !pendingConfig.moveUpRule.enabled
    ){

        container.classList.add("hidden");

        return;

    }



    container.classList.remove("hidden");



    const max =
        pendingConfig.teamCount - 2;



    for(
        let i = 1;
        i <= max;
        i++
    ){


        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        button.textContent =
            i;



        if(
            pendingConfig.moveUpRule.maxPositions === i
        ){

            button.classList.add("active");

        }



        button.onclick = ()=>{


            pendingConfig.moveUpRule.maxPositions =
                i;


            renderMoveUpPositions();


        };


        selector.appendChild(button);


    }


}

function renderMoveDownToggle(){

    const container =
        document.getElementById(
            "move-down-toggle-selector"
        );


    if(!container) return;


    container.innerHTML = "";


    ["Off","On"].forEach(option=>{


        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        const value =
            option === "On";


        if(
            pendingConfig.moveDownRule.enabled === value
        ){

            button.classList.add("active");

        }


        button.textContent =
            option;


        button.onclick = ()=>{


    pendingConfig.moveDownRule.enabled =
        value;


    if(value){

        pendingConfig.moveUpRule.enabled =
            false;

        pendingConfig.moveUpRule.maxPositions =
            null;

    }


    renderMoveDownToggle();


    renderMoveDownPositions();


    renderMoveUpToggle();


    renderMoveUpPositions();


};


        container.appendChild(button);


    });


}

function renderMoveDownPositions(){

    const container =
        document.getElementById(
            "move-down-position-container"
        );


    const selector =
        document.getElementById(
            "move-down-position-selector"
        );


    if(!container || !selector) return;



    selector.innerHTML = "";



    if(
        !pendingConfig.moveDownRule.enabled
    ){

        container.classList.add("hidden");

        return;

    }



    container.classList.remove("hidden");



    const max =
        pendingConfig.teamCount - 2;



    for(
        let i = 1;
        i <= max;
        i++
    ){


        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        button.textContent =
            i;



        if(
            pendingConfig.moveDownRule.maxPositions === i
        ){

            button.classList.add("active");

        }



        button.onclick = ()=>{


            pendingConfig.moveDownRule.maxPositions =
                i;


            renderMoveDownPositions();


        };


        selector.appendChild(button);


    }


}

function renderMoveDownRule(){

    renderMoveDownToggle();

    renderMoveDownPositions();

}

function renderPriorityPicksToggle(){

    const container =
        document.getElementById(
            "priority-picks-toggle-selector"
        );


    if(!container) return;


    container.innerHTML = "";


    ["Off","On"].forEach(option=>{


        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        const value =
            option === "On";


        if(
            pendingConfig.priorityPicksRule.enabled === value
        ){

            button.classList.add("active");

        }


        button.textContent =
            option;


        button.onclick = ()=>{


pendingConfig.priorityPicksRule.enabled =
    value;


if(value){

    pendingConfig.revealMode =
        "standard";

}


renderPriorityPicksToggle();

renderPriorityPicksCount();

renderRevealModeSelector();


};


        container.appendChild(button);


    });


}

function renderPriorityPicksCount(){

    const container =
        document.getElementById(
            "priority-picks-count-container"
        );


    const selector =
        document.getElementById(
            "priority-picks-count-selector"
        );


    if(!container || !selector) return;


    selector.innerHTML = "";


    if(
        !pendingConfig.priorityPicksRule.enabled
    ){

        container.classList.add("hidden");

        return;

    }


    container.classList.remove("hidden");


    const max =
        pendingConfig.teamCount - 1;


    for(
        let i = 1;
        i <= max;
        i++
    ){

        const button =
            document.createElement("button");


        button.className =
            "selector-tile";


        button.textContent =
            i;


        if(
            pendingConfig.priorityPicksRule.picks === i
        ){

            button.classList.add("active");

        }


        button.onclick = ()=>{

            pendingConfig.priorityPicksRule.picks =
                i;


            renderPriorityPicksCount();

        };


        selector.appendChild(button);

    }

}