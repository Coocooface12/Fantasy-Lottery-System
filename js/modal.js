// =======================================================
// UNIVERSAL MODAL SYSTEM
// =======================================================

function showModal(options){

    const modal =
        document.getElementById(
            "system-modal"
        );

    const title =
        document.getElementById(
            "system-modal-title"
        );

    const content =
        document.getElementById(
            "system-modal-content"
        );

    const buttonArea =
        document.getElementById(
            "system-modal-buttons"
        );


    // Clear previous content

    buttonArea.innerHTML = "";

    title.innerHTML =
        options.title || "";

    if(options.html){

        content.innerHTML =
            options.html;

    }
    else{

    content.innerHTML =
        options.message || "";

}


    // Create buttons

    (options.buttons || []).forEach(button=>{

        const btn =
            document.createElement("button");


        btn.className =
            button.className ||
            "btn btn-gold";


        btn.textContent =
            button.text;


        btn.onclick = ()=>{

            if(button.close !== false){

                closeModal();

            }

            if(button.action){

                button.action();

            }

        };


        buttonArea.appendChild(btn);

    });


    modal.classList.add(
        "active"
    );

}



// =======================================================
// CLOSE MODAL
// =======================================================

function closeModal(){

    document
        .getElementById(
            "system-modal"
        )
        .classList.remove(
            "active"
        );

}

// =======================================================
// MODAL SHORTCUTS
// =======================================================


function showWarning(title, message){

    showModal({

        title: "⚠ " + title,

        message: message,

        buttons:[
            {
                text:"OK",
                className:"btn btn-gold"
            }
        ]

    });

}



function showError(title, message){

    showModal({

        title: "🛑 " + title,

        message: message,

        buttons:[
            {
                text:"OK",
                className:"btn btn-gold"
            }
        ]

    });

}



function showInfo(title, message){

    showModal({

        title: "ℹ " + title,

        message: message,

        buttons:[
            {
                text:"OK",
                className:"btn btn-gold"
            }
        ]

    });

}



function showSuccess(title, message){

    showModal({

        title: "✓ " + title,

        message: message,

        buttons:[
            {
                text:"OK",
                className:"btn btn-gold"
            }
        ]

    });

}

// =======================================================
// CONFIRMATION MODAL
// =======================================================

function showConfirm(title, html, continueFunction){

    showModal({

        title: title,

        html: html,

        buttons:[

            {
                text:"Cancel",
                className:"btn btn-outline"
            },

            {
                text:"Continue to Lottery",
                className:"btn btn-gold",
                action:continueFunction
            }

        ]

    });

}