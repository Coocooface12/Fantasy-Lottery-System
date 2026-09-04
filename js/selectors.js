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