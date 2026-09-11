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