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

        content.textContent =
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

window.addEventListener("DOMContentLoaded", () => {

    showModal({

        title: "Modal Test",

        message: "Congratulations! Your modal engine works.",

        buttons: [
            {
                text: "Awesome"
            }
        ]

    });

});