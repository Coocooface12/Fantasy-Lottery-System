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

        if(value === selectedValue){

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

        activeConfig.teamCount,

        function(value){

            activeConfig.teamCount = value;

            document.getElementById(
                "cfg-team-count"
            ).value = value;

            handleTeamCountChange();

            renderLotterySelectors();

        }

    );


    renderButtonSelector(

        "ball-pool-selector",

        4,

        20,

        activeConfig.totalBalls,

        function(value){

            activeConfig.totalBalls = value;

            document.getElementById(
                "cfg-balls-pool"
            ).value = value;

            renderLotterySelectors();

        }

    );


    renderButtonSelector(

        "draw-size-selector",

        1,

        activeConfig.totalBalls - 1,

        activeConfig.drawSize,

        function(value){

            activeConfig.drawSize = value;

            document.getElementById(
                "cfg-draw-size"
            ).value = value;

            renderLotterySelectors();

        }

    );

}