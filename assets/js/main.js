let deltaTime = 0;

let writingMode = true;

const header = document.querySelector("header");
const main = document.querySelector("main");
const footer = document.querySelector("footer");

const reducedMotionDetector = document.querySelector("#reduced-motion-detector");

const navButton = document.querySelector("#nav-icon button");

const actionbar = document.querySelector("#actionbar");

const buttonWiggleAnimation = [
    {
        transform: "scale(1)",
    },
    {
        transform: "scale(1.2, 0.8)",
    },
    {
        transform: "scale(1.4, 0.7)",
    },
    {
        transform: "scale(1.2, 0.8)",
    },
    {
        transform: "scale(1)",
    },
];

let lastFocusedElement = document.body;

let sawIntro;
const intro = document.querySelector("#intro");

const loading = document.querySelector("#loading");

// Lista das secções e footer
const sectionFooter = document.querySelectorAll("section, footer");

window.addEventListener("load", (e) => {
    // Tentar carregar todas as imagens com antecedência
    UpdateActionBar(null);

    // Ao carregar o site, esconde todas as secções
    sectionFooter.forEach((focusable) => {
        if (!focusable.classList.contains("mouse-focus")) focusable.classList.add("mouse-focus");
        // focusable.dispatchEvent(new Event("mousedown"));
    });

    sawIntro = localStorage.getItem("sawIntro");
    if (intro) {
        if (sawIntro) {
            sawIntro = true;
            // localStorage.removeItem("sawIntro"); // REMOVER ESTA MERDA QUANDO TERMINAR
            console.warn("Já viu a introdução");
        } else {
            console.warn("Ainda não viu a introdução");
            sawIntro = false;

            document.body.setAttribute("style", "overflow: hidden;");

            header.setAttribute("aria-hidden", "true");
            main.setAttribute("aria-hidden", "true");
            footer.setAttribute("aria-hidden", "true");

            intro.setAttribute("aria-hidden", "false");
        }
    }

    loading.setAttribute("aria-hidden", "true");
});

if (intro) {
    intro.addEventListener("transitionend", () => {
        if (parseFloat(getComputedStyle(intro).opacity) === 0) {
            intro.remove();
        }
    });
}

loading.addEventListener("transitionend", () => {
    if (parseFloat(getComputedStyle(loading).opacity) === 0) {
        loading.remove();
    }
});

// =========================================== OPÇÕES DE ACESSIBILIDADE =====================================================
const accessOptions = {
    // Estas são as opções de acessibilidade que quero implementar
    general: {
        scrollButtons: true,
        soundEffects: true,
    },
    controller: {
        holdDelay: 600, // 450, 600, 750, 900 ms
        holdInterval: 150, // 150, 250, 350, 450 ms
        rememberExit: false,
    },
};

console.groupCollapsed("Valores das opções de acessibilidade");
// Isto trata de buscar os valores que estejam guardados no localStorage, para mostrar imediatamente no menu de opções
for (const [group, object] of Object.entries(accessOptions)) {
    // console.log(group, object);
    // console.log(Object.keys(object).length);

    for (const [key, value] of Object.entries(object)) {
        // console.log(key);

        const savedValue = JSON.parse(localStorage.getItem(`${group}.${key}`));
        // console.log(savedValue);

        const input = document.querySelector(`#options input[name='${group}.${key}'`);
        // console.log(document.querySelector(`#options input[name='${group}.${key}'`));

        if (savedValue !== null) {
            console.info(`A chave ${group}.${key} vai usar o valor guardado (${savedValue})`);
            accessOptions[group][key] = savedValue;

            if (input.getAttribute("type") === "range") {
                input.setAttribute("value", savedValue);
                input.parentElement.querySelector("output").innerText = `${(savedValue / 1000).toFixed(2)} s`;
            }
            if (input.getAttribute("type") === "checkbox") {
                input.checked = savedValue;

                if (input.getAttribute("name") === "general.scrollButtons") {
                    const scrollButtons = document.querySelector("#scroll-buttons");

                    if (savedValue === true) {
                        if (scrollButtons.hasAttribute("style")) {
                            scrollButtons.removeAttribute("style");
                        }
                    } else if (savedValue === false) {
                        scrollButtons.style.display = "none";
                    }
                }

                if (input.getAttribute("name") === "controller.rememberExit") {
                    const rememberExitClone = document.querySelector("input[id='controller.rememberExit-clone']");

                    rememberExitClone.checked = savedValue;
                }
            }
        } else {
            console.info(`A chave ${group}.${key} não tem valor guardado, a usar valor padrão`);

            if (input.getAttribute("type") === "range") {
                input.setAttribute("value", accessOptions[group][key]);
                input.parentElement.querySelector("output").innerText = `${(accessOptions[group][key] / 1000).toFixed(2)} s`;
                // console.log(input.parentElement.querySelector("output").innerText);
            }
            if (input.getAttribute("type") === "checkbox") {
                input.checked = accessOptions[group][key];

                if (input.getAttribute("name") === "general.scrollButtons") {
                    const scrollButtons = document.querySelector("#scroll-buttons");

                    if (savedValue === true) {
                        if (scrollButtons.hasAttribute("style")) {
                            scrollButtons.removeAttribute("style");
                        }
                    } else if (savedValue === false) {
                        scrollButtons.style.display = "none";
                    }
                }

                if (input.getAttribute("name") === "controller.rememberExit") {
                    const rememberExitClone = document.querySelector("input[id='controller.rememberExit-clone']");

                    rememberExitClone.checked = accessOptions[group][key];
                }
                // console.log(input.checked);
            }
        }
    }
}
// console.log(accessOptions);
console.groupEnd();

// window.test = accessOptions;

// =================================================== ÍCONES =============================================================

// Isto trata de adicionar os ícones de cada aplicação
// if (location.pathname.includes("/projects/")) {
const softwareList = Array.from(document.querySelectorAll(".software-list a, .software-list span"));

softwareList.forEach((software) => {
    const icon = software.getAttribute("software");

    if (icon) {
        const picture = document.createElement("picture");

        const jsURL = import.meta.url;
        // console.log(jsURL);
        const newURL = new URL("../software-icons", jsURL);
        // console.log(newURL.href);

        const sourceSVG = document.createElement("source");
        sourceSVG.srcset = `${newURL.href}/svg/${icon}.svg`;
        sourceSVG.type = "image/svg+xml";

        const img = document.createElement("img");
        img.src = `${newURL.href}/png/${icon}.png`;
        img.alt = "";

        picture.appendChild(sourceSVG);
        picture.appendChild(img);

        software.appendChild(picture);
    }
});
// }

// let gamepadVendorID = null;
// let gamepadProductID = null;

// let gamepadConnected = null;

// ========================================= EVENT LISTENERS ===============================================
// Isto desativa o ecrã de introdução
if (intro) {
    intro.addEventListener("mousedown", () => {
        ToggleIntroScreen();
    });
}

// Isto esconde o realce das secções não selecionadas
document.addEventListener("mouse-focus", (e) => {
    // console.log(document.activeElement);

    sectionFooter.forEach((focusable) => {
        focusable.classList.add("mouse-focus");
    });
});

const galleryButtons = main.querySelector("#gallery-buttons");

// Isto faz com que, ao clicar no website, os botões da galeria sejam desfocados
document.addEventListener("mousedown", () => {
    if (galleryButtons) galleryButtons.dispatchEvent(new Event("remove-focus"));

    document.dispatchEvent(new Event("mouse-focus"));
});

if (galleryButtons) {
    galleryButtons.addEventListener("remove-focus", () => {
        if (galleryButtons.classList.contains("focused")) {
            galleryButtons.classList.remove("focused");
        }
    });
}

// Ao clicar no botão de voltar para o topo com o rato, mostra os botões do teclado
document.querySelector("#go-to-top > a").addEventListener("click", () => {
    UpdateActionBar();
});

document.querySelectorAll("input").forEach((input) => {
    const [group, key] = input.name.split(".");
    // console.log(accessOptions[group][key]);

    input.addEventListener("input", () => {
        if (input.getAttribute("type") === "range") {
            input.parentElement.querySelector("output").innerText = `${(input.valueAsNumber / 1000).toFixed(2)} s`;
            // Toca o som de range
            PlaySound("range");
        }
    });
    input.addEventListener("change", () => {
        if (input.getAttribute("type") === "range") {
            // Caso a range esteja no menu de opções
            if (document.querySelector("#options").contains(input)) {
                if (input.valueAsNumber !== accessOptions[group][key]) {
                    accessOptions[group][key] = input.valueAsNumber;
                    input.parentElement.querySelector("output").innerText = `${(input.valueAsNumber / 1000).toFixed(2)} s`;
                }
            }
        }
        if (input.getAttribute("type") === "checkbox") {
            // console.log(input);

            // Caso a checkbox esteja no menu de opções ou noutro popup
            if (document.querySelector("#options").contains(input) || document.querySelector("#exit-popup").contains(input)) {
                // Toca sempre o som de checkbox ao se desativar os efeitos sonoros
                if (accessOptions.general.soundEffects === true) {
                    PlaySound("moverSeccao-checkbox");
                }
                if (input.checked !== accessOptions[group][key]) {
                    accessOptions[group][key] = input.checked;

                    // console.log(input.name);

                    if (input.getAttribute("name") === "general.scrollButtons") {
                        const scrollButtons = document.querySelector("#scroll-buttons");

                        if (accessOptions.general.scrollButtons === true) {
                            if (scrollButtons.hasAttribute("style")) {
                                scrollButtons.removeAttribute("style");
                            }
                        } else if (accessOptions.general.scrollButtons === false) {
                            scrollButtons.style.display = "none";
                        }
                    }

                    if (input.name === "controller.rememberExit") {
                        if (input.getAttribute("id").includes("clone")) {
                            document.querySelector("input[id='controller.rememberExit']").checked = input.checked;
                        } else {
                            document.querySelector("input[id='controller.rememberExit-clone']").checked = input.checked;
                        }
                    }
                }
            }
            // Toca o som de checkbox
            if (accessOptions.general.soundEffects === true) {
                PlaySound("moverSeccao-checkbox");
            }
        }

        // console.log(`A enviar valor ${accessOptions[group][key]} da chave ${input.name} para o localStorage`);
        localStorage.setItem(input.name, JSON.stringify(accessOptions[group][key]));
    });
});

document.querySelector("#background").addEventListener("click", (e) => {
    if (document.querySelector("#options").getAttribute("aria-hidden") === "false") ToggleAccessOptions("mouse");
    else if (document.querySelector("#options").getAttribute("aria-hidden") === "true") ToggleNavMenu("mouse");
    else if (document.querySelector("#exit-popup").getAttribute("aria-hidden") === "false") ToggleExitPopup("mouse", savedLink);
});

document.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
        PlaySound("selecionar");
    });
});

// Botões de menu e de opções de acessibilidade
navButton.addEventListener("click", () => {
    ToggleNavMenu("mouse");
});
document.querySelectorAll("#accessibility-button, #options-icon button").forEach((element) => {
    element.addEventListener("click", () => {
        ToggleAccessOptions("mouse");
    });
});

// Botões de scroll
document.querySelector("#scroll-up button").addEventListener("click", () => {
    Scroll(-1);
});
document.querySelector("#scroll-down button").addEventListener("click", () => {
    Scroll(1);
});

// Botões de galeria
if (main.querySelector("#gallery-buttons")) {
    main.querySelector("#gallery-left button").addEventListener("click", () => {
        ChangeGallerySlide(-1);
    });
    main.querySelector("#gallery-right button").addEventListener("click", () => {
        ChangeGallerySlide(1);

        if (galleryButtons) {
            galleryButtons.dispatchEvent(new Event("remove-focus"));
        }
    });
}

// Vídeo da galeria
main.querySelectorAll("#project-gallery figure video").forEach((video) => {
    video.addEventListener("click", () => {
        ToggleGalleryVideo(video);
    });
    video.addEventListener("mousemove", () => {
        ShowPauseButton("show");
    });
});

// Tratamento do writingMode dos campos de um formulário
// main.querySelectorAll(
//     "input[type='text'], input[type='email'], input[type='tel'], input[type='number'], input[type='password'], input[type='search'], input[type='url'], textarea",
// ).forEach((formItem) => {
main.querySelectorAll("form input, form textarea").forEach((formItem) => {
    formItem.addEventListener("click", () => {
        writingMode = true;
        formItem.dispatchEvent(new Event("focus"));

        // if ("virtualKeyboard" in navigator) {
        //     navigator.virtualKeyboard.show();
        // }
    });
    formItem.addEventListener("focus", () => {
        // console.log(formItem);

        // formItem.removeAttribute("readonly");
        let parent = formItem.parentElement;
        while (parent.tagName !== "FORM") {
            parent = parent.parentElement;
        }

        if (writingMode) {
            if (parent.classList.contains("selecting")) {
                parent.classList.remove("selecting");
                parent.classList.add("writing");

                if ("virtualKeyboard" in navigator) {
                    navigator.virtualKeyboard.show();
                }
            }
        } else {
            if (parent.classList.contains("writing")) {
                parent.classList.remove("writing");
                parent.classList.add("selecting");

                if ("virtualKeyboard" in navigator) {
                    navigator.virtualKeyboard.hide();
                }
            }
        }
        // writingMode = true;
    });
});

// ================================================= INTRO SCREEN ================================================
function ToggleIntroScreen() {
    if (intro.getAttribute("aria-hidden") === "false") {
        intro.setAttribute("aria-hidden", "true");
        localStorage.setItem("sawIntro", "yes");

        document.body.removeAttribute("style");

        header.removeAttribute("aria-hidden");
        main.removeAttribute("aria-hidden");
        footer.removeAttribute("aria-hidden");

        const avatarVideo = document.querySelector("#avatar video");
        if (avatarVideo) {
            avatarVideo.pause();
            avatarVideo.currentTime = 0;
            setTimeout(() => {
                PlayAnimation(avatarVideo);
                sawIntro = true;
            }, 100);
        }
    }
}

// ================================================= EFEITOS SONOROS ================================================
function PlaySound(sound) {
    if (!sound) console.error("Som a reproduzir não foi definido!");
    // console.log(sound);

    const soundEffect = document.querySelector(`#${sound}`);
    // console.log(soundEffect);

    // console.log(accessOptions.general.soundEffects);

    // Se a primeira interação no site for utilizar os sticks analógicos, não vai reproduzir nenhum som porque os sticks não contam como uma interação do utilizador
    if (accessOptions.general.soundEffects === true) {
        soundEffect.currentTime = 0;
        soundEffect.play();
    }
}

// ================================================== GALERIA DE PROJETOS =================================================
function ToggleGalleryVideo(video) {
    const icon = video.parentElement.querySelector("span > i");
    galleryHoverTime = 0;

    if (video.paused) {
        video.play();

        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
    } else {
        video.pause();

        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
    }
}

let galleryHoverTime = 0;
function ShowPauseButton(command) {
    // console.log(command);

    const iconList = main.querySelectorAll("#project-gallery figure span > i").forEach((icon) => {
        // debugger;
        if (icon.classList.contains("fa-pause")) {
            if (!icon.hasAttribute("hide")) {
                if (galleryHoverTime >= 1000) {
                    icon.setAttribute("hide", "");
                }
            }
        } else if (icon.classList.contains("fa-play")) {
            icon.removeAttribute("hide");
        }

        if (command === "show") {
            galleryHoverTime = 0;
            icon.removeAttribute("hide");
        }
    });
}

function ChangeGallerySlide(direction) {
    // let mouseDown;

    if (direction !== -1 && direction !== 1) console.error("Direção não definida!");

    const slidesArray = Array.from(main.querySelectorAll("#project-gallery figure"));
    const currentSlide = main.querySelector("figure[aria-current='true']");
    // console.log(slidesArray, currentSlide);

    const currentSlideIndex = slidesArray.findIndex((s) => s === currentSlide);
    // console.log(currentSlideIndex);

    // Isto trata de animar o botão que tiver sido clicado
    let galleryButton;
    if (direction === -1) galleryButton = main.querySelector("#gallery-left button");
    else if (direction === 1) galleryButton = main.querySelector("#gallery-right button");

    // Se o utilizador não tiver ativado a opção de reduzir as animações, anima os botões da galeria
    if (window.getComputedStyle(reducedMotionDetector).backgroundColor === "rgb(255, 0, 0)" && galleryButton.disabled === false)
        galleryButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });

    // debugger;

    // console.log(currentSlideIndex, slidesArray.length - 1);

    if ((currentSlideIndex === 0 && direction === -1) || (currentSlideIndex === slidesArray.length - 1 && direction === 1)) {
        // galleryButton.disabled = true;
        // return;
    } else {
        galleryButtons.querySelectorAll("button").forEach((button) => {
            button.disabled = false;
        });
        currentSlide.removeAttribute("aria-current");
        slidesArray[currentSlideIndex + direction].setAttribute("aria-current", "true");
        PlaySound("mover");
    }

    if (currentSlideIndex + direction === 0 || currentSlideIndex + direction === slidesArray.length - 1) {
        galleryButton.disabled = true;
    }
}

// ==================================================== ANIMAÇÕES + EXTRAS =====================================================

// Permite que a animação do avatar seja repetida após terminar
const alphaVideo = document.querySelector("#avatar stacked-alpha-video");
if (alphaVideo) {
    const video = alphaVideo.querySelector("video");

    alphaVideo.addEventListener("click", () => {
        PlayAnimation(video);
    });

    video.addEventListener("ended", () => {
        alphaVideo.setAttribute("title", "Reproduz esta animação");
    });
    video.addEventListener("play", () => {
        alphaVideo.removeAttribute("title");
    });
    // video.currentTime = 0.001
}

function PlayAnimation(element) {
    if (!element) console.error("Elemento a reproduzir não foi definido!");

    if (element.tagName === "FIGURE") {
        ToggleGalleryVideo(element.querySelector("video"));
        PlaySound("mover");
    } else {
        if (element.tagName === "VIDEO" && (element.ended || element.currentTime === 0)) {
            // element.currentTime = 0;
            element.play();
            PlaySound("mover");
        }
    }
}

// ===================================================== COMANDO DE JOGO =====================================================
let gamepadIndex = null;

window.addEventListener("gamepadconnected", (e) => {
    console.warn(
        `A gamepad was connected at index ${e.gamepad.index}. ${e.gamepad.id} has ${e.gamepad.buttons.length} buttons and ${e.gamepad.axes.length} axes`,
    );

    // let gamepadIndex = navigator.getGamepads().findIndex((g) => g === navigator.getGamepads().filter((g) => g !== null)[0]);
    // console.log(navigator.getGamepads().filter((g) => g !== null)[0]);
    // console.log(navigator.getGamepads().findIndex((g) => g === navigator.getGamepads().filter((g) => g !== null)[0]));
    // console.log(navigator.getGamepads());

    // if (e.gamepad.index === gamepadIndex) {
    GetGamepadInfo(e.gamepad, true);

    // if (window.getComputedStyle(actionbar).display === "none") {
    actionbar.parentElement.classList.add("show");
    // }
    // gamepadConnected = "PlayStation4";
    // UpdateActionBar(gamepadConnected);
    // }
});

window.addEventListener("gamepaddisconnected", (e) => {
    console.warn(`The gamepad at index ${e.gamepad.index} has been disconnected`);

    // if (e.gamepad.index === gamepadIndex) {
    // gamepadConnected = null;
    UpdateActionBar(null);

    // if (actionbar.getAttribute("style") === "display: flex;") {
    if (actionbar.parentElement.classList.contains("show")) {
        actionbar.parentElement.classList.remove("show");
    }
});

function GetGamepadInfo(gamepad, onConnection) {
    // Obrigado ao Gamepad API por ser open-source. Foi aqui que descobri como é que os browsers mostram: https://github.com/w3c/gamepad/issues/199
    if (!gamepad) console.error("Não veio nenhum gamepad");

    let gamepadVendorID = null;
    let gamepadProductID = null;

    let gamepadConnected = null;

    // Em Firefox
    if (gamepad.id[4] === "-" && gamepad.id[9] === "-") {
        // Como no Firefox é sempre "VVVV-PPPP-Nome do gamepad", basta buscar as strings no início
        gamepadVendorID = gamepad.id.substring(0, 4);
        gamepadProductID = gamepad.id.substring(5, 9);

        console.log(`Vendor: ${gamepadVendorID} Product: ${gamepadProductID}`);
    }

    // Em Chromium (Chrome, Edge, Opera, etc.)
    else if (gamepad.id.includes("Vendor: ") && gamepad.id.includes("Product: ")) {
        // Garantir que por acaso não há nenhum comando que se chame "Vendor: blablabla" ou algo do género
        if (gamepad.id.indexOf("(") < gamepad.id.indexOf("Vendor: ")) {
            // Como em Chromium é sempre "Nome do gamepad (STANDARD GAMEPAD Vendor: VVVV Product: PPPP)", tem de se calcular a posição das strings"
            const vendorString = "Vendor: ";
            const productString = "Product: ";

            const vendorStringIndex = gamepad.id.indexOf(vendorString);
            const productStringIndex = gamepad.id.indexOf(productString);

            const vendorIDIndex = vendorStringIndex + vendorString.length;
            const productIDIndex = productStringIndex + productString.length;

            gamepadVendorID = gamepad.id.substring(vendorIDIndex, vendorIDIndex + 4);
            gamepadProductID = gamepad.id.substring(productIDIndex, productIDIndex + 4);

            if (onConnection) console.log(`Vendor: ${gamepadVendorID} Product: ${gamepadProductID}`);
        }
    }

    // Caso sejam descobertos os IDs de vendedor e de produto, tenta-se descobrir qual é o comando em questão
    if (gamepadVendorID && gamepadProductID) {
        switch (gamepadVendorID) {
            // Microsoft (Xbox)
            case "045e":
                // Aqui todos os comandos têm os mesmos botões

                switch (gamepadProductID) {
                    case "0b13":
                        if (onConnection) console.warn("Xbox Series X/S Controller");
                        gamepadConnected = "Xbox";
                        UpdateActionBar("Xbox");
                        break;

                    case "028e":
                        if (onConnection) console.warn("Xbox One Controller (pelo menos segundo o Gamepad Tester)");
                        gamepadConnected = "Xbox";
                        UpdateActionBar("Xbox");
                        break;
                }
                break;

            // Sony (PlayStation)
            case "054c":
                // Aqui tem de se ver se é um comando da PS3, da PS4 ou da PS5 porque o Start e o Select mudam

                switch (gamepadProductID) {
                    case "0268":
                        if (onConnection) console.warn("PS3 Controller");

                        if (gamepad.mapping === "standard") {
                            if (onConnection) console.warn("PS3 funciona!!"); // No Firefox aparece standard mas os botões estão trocados :(
                        } else {
                            if (onConnection) console.warn("PS3 não funciona :("); // Em Chromium não dá :(
                        }

                        break;

                    case "09cc":
                        if (onConnection) console.warn("PS4 Controller");
                        gamepadConnected = "PlayStation4";
                        UpdateActionBar(gamepadConnected);
                        break;
                }

                break;
            // Nintendo
            case "057e":
                // Aqui vai fazer diferença se ambos os Joy-Cons estão ligados ou se apenas um

                switch (gamepadProductID) {
                    case "200e": // A junção dos Joy-Cons funciona em Chromium e Safari
                        if (onConnection) console.warn("Switch Joy-Cons");
                        gamepadConnected = "NintendoSwitch";
                        UpdateActionBar(gamepadConnected);
                        break;

                    case "2006": // No Firefox os analógicos não funcionam e no Safari os analógicos são mapeados para o d-pad
                        if (onConnection) console.warn("Switch Left Joy-Con");
                        gamepadConnected = "NintendoStandard";
                        UpdateActionBar(gamepadConnected);
                        break;

                    case "2007": // No Firefox os analógicos não funcionam e no Safari os analógicos são mapeados para o d-pad
                        if (onConnection) console.warn("Switch Right Joy-Con");
                        gamepadConnected = "NintendoStandard";
                        UpdateActionBar(gamepadConnected);
                        break;
                    case "2009": // O Firefox assume que muitos botões estão a ser pressionados
                        if (onConnection) console.warn("Switch Pro Controller");
                        gamepadConnected = "NintendoSwitch";
                        UpdateActionBar(gamepadConnected);
                        break;
                }
                break;
        }
    }
    // Caso não existam Vendor ID e Product ID, processa outros casos
    else {
        // Se o nome do comando ligado indicar "XInput" ou "xinput", é porque o comando funciona com o XInput e é interpretado como um comando Xbox genérico
        if (gamepad.id.includes("XInput") || gamepad.id.includes("xinput")) {
            if (onConnection) console.warn("Comando genérico XInput");
            gamepadConnected = "Xbox";
            UpdateActionBar(gamepadConnected);
        }
        // Se o nome do comando ligado indicar "DUALSHOCK 4" é porque estamos com um comando da PS4
        else if (gamepad.id.includes("DUALSHOCK 4")) {
            gamepadConnected = "PlayStation4";
            UpdateActionBar(gamepadConnected);
        }
        // else {
        //     alert(gamepad.id);
        // }
        // Se o nome do comando ligado indicar "Joy-Con" é porque estamos a lidar com comandos da Switch
        else if (gamepad.id.includes("Joy-Con")) {
            // alert("Switch");
            // O Safari consegue juntar os dois Joy-Con
            if (gamepad.id.includes("(L/R)")) {
                // alert("Switch Completo");
                if (onConnection) console.warn("Switch Joy-Cons");
                gamepadConnected = "NintendoSwitch";
                UpdateActionBar(gamepadConnected);
            }
            // O Joy-Con da esquerda tem o analógico mapeado para o d-pad e os botões trocados
            else if (gamepad.id.includes("(L)")) {
                // alert("Switch L");
                if (onConnection) console.warn("Switch Left Joy-Con");
                gamepadConnected = "NintendoStandard";
                UpdateActionBar(gamepadConnected);
            }
            // O Joy-Con da direita tem o analógico mapeado para o d-pad e os botões trocados
            else if (gamepad.id.includes("(R)")) {
                // alert("Switch R");
                if (onConnection) console.warn("Switch Right Joy-Con");
                gamepadConnected = "NintendoStandard";
                UpdateActionBar(gamepadConnected);
            }
            // Se o nome do comando ligado indicar "Xbox", é porque estamos a lidar com comandos da Xbox
        } else if (gamepad.id.includes("Xbox") || gamepad.id.includes("XInput")) {
            if (onConnection) console.warn("Xbox");
            gamepadConnected = "Xbox";
            UpdateActionBar(gamepadConnected);
        }
        // Caso o Safari (ou outro browser) não detete nenhum destes comandos, assume um comando genérico se o mapping for standard
        else {
            console.warn("Não tem VendorID nem ProductID disponíveis");
            if (gamepad.mapping === "standard") {
                if (onConnection) console.warn("Comando de jogo genérico");
                gamepadConnected = "standard";
                UpdateActionBar(gamepadConnected);
            }
        }
    }
    return gamepadConnected;
}

// ======================================================= BARRA DE AÇÕES =============================================================

// Isto vai definir o texto associado a cada botão
const actionbarLabels = {
    // Genéricos
    select: "Selecionar",
    return: "Voltar",
    none: "REMOVER!!!",

    // Menu de navegação
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    returnMenu: "Voltar ao menu",

    // Opções
    inputToggle: "Ativar/Desativar",
    inputActivate: "Ativar opção",
    inputDeactivate: "Desativar opção",
    inputSlide: "Mudar opção",

    // slideHor: "Navegar horiz.",
    // slideVer: "Navegar vert.",

    // Escrita e formulários
    startWrite: "Escrever",
    stopWrite: "Parar de escrever",
    sendForm: "Enviar form.",

    // Extras
    playAnimation: "Reprod. animação",
    gallerySlide: "Trocar imagem",
};

function UpdateActionBar(gamepadType) {
    if (gamepadType === undefined) console.error("gamepadType não foi definido!");

    const mainActions = actionbar.querySelector("#main-actions");
    const focusedElement = document.activeElement;

    // console.log(focusedElement);

    // Trata do realce verde das <section> e do <footer>
    // Adiciona sempre a class "mouse-focus", para tornar as secções e o footer todos escuros
    document.dispatchEvent(new Event("mouse-focus"));

    if (focusedElement.tagName === "SECTION" || focusedElement.tagName === "FOOTER") {
        if (focusedElement.classList.contains("mouse-focus")) focusedElement.classList.remove("mouse-focus");
    } else {
        sectionFooter.forEach((focusable) => {
            if (!focusable.classList.contains("mouse-focus")) focusable.classList.add("mouse-focus");
        });
    }

    // No início, quando ainda não existe nada na barra de ações, cria duas ações ("select" e "return")
    if (mainActions.childElementCount === 0) {
        let action;
        for (let i = 0; i < 3; i++) {
            // switch (i) {
            //     case 0:
            //         action = "select";
            //         break;
            //     case 1:
            //         action = "return";
            //         break;
            // }
            const div = document.createElement("div");
            div.innerHTML = "<span></span>";
            // div.setAttribute("action", action);
            mainActions.appendChild(div);
        }
    }

    const actionArray = Array.from(mainActions.children);

    for (let i = 0; i < mainActions.childElementCount; i++) {
        let action;
        let imgName;

        switch (i) {
            case 0:
                if (
                    (focusedElement.tagName === "INPUT" &&
                        (focusedElement.getAttribute("type") === "text" ||
                            focusedElement.getAttribute("type") === "email" ||
                            focusedElement.getAttribute("type") === "tel" ||
                            focusedElement.getAttribute("type") === "number" ||
                            focusedElement.getAttribute("type") === "password" ||
                            focusedElement.getAttribute("type") === "search" ||
                            focusedElement.getAttribute("type") === "url")) ||
                    focusedElement.tagName === "TEXTAREA"
                ) {
                    // console.log("ISTO É UM CAMPO EM QUE SE PODE ESCREVER");
                    if (!writingMode) {
                        imgName = "select";
                        action = "startWrite";
                    } else {
                        imgName = "select";
                        action = "none";
                    }
                } else if (focusedElement.tagName === "INPUT" && focusedElement.getAttribute("type") === "checkbox") {
                    let checkbox;
                    if (focusedElement.matches("input[type='checkbox']")) {
                        checkbox = focusedElement;
                    } else if (focusedElement.parentElement.querySelector("input[type='checkbox']")) {
                        checkbox = focusedElement.parentElement.querySelector("input[type='checkbox']");
                    }

                    imgName = "select";
                    // action = "inputToggle";
                    if (checkbox.checked) {
                        action = "inputDeactivate";
                    } else {
                        action = "inputActivate";
                    }
                } else if (focusedElement.tagName === "BUTTON" && focusedElement.getAttribute("type") === "submit") {
                    // console.log("ISTO É UM BOTÃO DE ENVIAR");
                    imgName = "select";
                    action = "sendForm";
                } else if (focusedElement.tagName === "SECTION") {
                    if (focusedElement.querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                        imgName = "select";
                        action = "select";
                    } else {
                        imgName = "select";
                        action = "none";
                    }
                } else if (focusedElement === main.querySelector("#gallery-buttons")) {
                    // console.log("ISTO SÃO OS BOTÕES DE GALERIA");
                    imgName = "return";
                    action = "return";
                } else {
                    // console.log("ISTO É UM OBJETO GENÉRICO");
                    imgName = "select";
                    action = "select";
                }
                break;

            case 1:
                if (
                    (focusedElement.tagName === "INPUT" &&
                        (focusedElement.getAttribute("type") === "text" ||
                            focusedElement.getAttribute("type") === "email" ||
                            focusedElement.getAttribute("type") === "tel" ||
                            focusedElement.getAttribute("type") === "number" ||
                            focusedElement.getAttribute("type") === "password" ||
                            focusedElement.getAttribute("type") === "search" ||
                            focusedElement.getAttribute("type") === "url")) ||
                    focusedElement.tagName === "TEXTAREA"
                ) {
                    // console.log("ISTO É UM CAMPO EM QUE SE ESTÁ A ESCREVER");
                    if (!writingMode) {
                        imgName = "return";
                        action = "return";
                    } else {
                        imgName = "stopWrite";
                        action = "stopWrite";
                    }
                } else if (focusedElement.tagName === "SECTION" || focusedElement.tagName === "FOOTER" || focusedElement === document.body) {
                    // console.log("ISTO É UMA SECÇÃO");
                    imgName = "return";
                    action = "openMenu";
                } else if (document.querySelector("#main-nav").contains(focusedElement)) {
                    // console.log("ISTO É O MENU DE NAVEGAÇÃO");
                    imgName = "return";
                    action = "closeMenu";
                } else if (document.querySelector("#options").contains(focusedElement)) {
                    // console.log("ISTO É O MENU DE OPÇÕES DE ACESSIBILIDADE");
                    imgName = "return";
                    action = "returnMenu";
                } else if (focusedElement === main.querySelector("#gallery-buttons")) {
                    // console.log("ISTO SÃO OS BOTÕES DE GALERIA");
                    imgName = "inputSlide";
                    action = "gallerySlide";
                } else {
                    // console.log("ISTO É UM OBJETO GENÉRICO");
                    imgName = "return";
                    action = "return";
                }

                break;
            case 2:
                const heroHome = main.querySelector("#hero-home");

                if (focusedElement.tagName === "INPUT" && focusedElement.getAttribute("type") === "range") {
                    // console.log("ISTO É UM INPUT DE RANGE");
                    imgName = "inputSlide";
                    action = "inputSlide";
                } else if (focusedElement === main.querySelector("#gallery-buttons")) {
                    // console.log("ISTO SÃO OS BOTÕES DE GALERIA");
                    const currentSlide = main.querySelector("figure[aria-current='true']");
                    if (currentSlide.querySelector("video")) {
                        imgName = "playAnimation";
                        action = "playAnimation";
                    } else {
                        imgName = "playAnimation";
                        action = "none";
                    }
                } else if (heroHome && heroHome.contains(focusedElement) && heroHome.querySelector("stacked-alpha-video")) {
                    // console.log("ISTO TEM UMA ANIMAÇÃO");
                    imgName = "playAnimation";
                    action = "playAnimation";
                } else {
                    imgName = "inputSlide";
                    action = "none";
                }
                break;
        }

        actionArray[i].setAttribute("action", action);
        actionArray[i].innerHTML = `<span></span>${actionbarLabels[action]}`;

        const actionType = actionArray[i].getAttribute("action");
        const span = actionArray[i].querySelector("span");

        const jsURL = import.meta.url;
        // console.log(jsURL);
        const newURL = new URL("../action-icons/", jsURL);
        // console.log(newURL.href);

        let img = span.querySelector("img");
        // Se ainda não existir um ícone da tecla/botão, cria-o
        if (!img) {
            img = document.createElement("img");
            span.appendChild(img);
        }

        if (!gamepadType) {
            img.src = `${newURL.href}keyboard/${imgName}.png`;
            img.alt = "";
        } else {
            img.src = `${newURL.href}${gamepadType}/${imgName}.png`;
            img.alt = "";
        }

        // console.log(actionType);

        if (actionType === "none") {
            actionArray[i].style.display = "none";
        } else {
            actionArray[i].removeAttribute("style");
        }
    }
}

const currentKeys = [];

// let keyPressed = false;

document.addEventListener("keydown", (e) => {
    if (!currentKeys.includes(e.key)) {
        // keyPressed = true;
        currentKeys.push(e.key);
    }

    // console.log(e.key, e.repeat);

    if (e.repeat === true) {
        // Caso a tecla esteja a ser repetida, repete a ação
        KeyActions();
    } else {
        if (!currentKeys.includes(e.key)) holdTime = 0;
        KeyActions();
    }

    function KeyActions() {
        const focusedElement = document.activeElement;
        const form = main.querySelector("form");

        // debugger;

        if (
            e.altKey === false &&
            e.ctrlKey === false &&
            e.metaKey === false &&
            e.key !== "F1" &&
            e.key !== "F2" &&
            e.key !== "F3" &&
            e.key !== "F4" &&
            e.key !== "F5" &&
            e.key !== "F6" &&
            e.key !== "F7" &&
            e.key !== "F8" &&
            e.key !== "F9" &&
            e.key !== "F10" &&
            e.key !== "F11" &&
            e.key !== "F12" &&
            e.key !== "PageUp" &&
            e.key !== "PageDown"
        ) {
            if (focusedElement === document.body) {
                if (intro && intro.getAttribute("aria-hidden") === "false") {
                    ToggleIntroScreen();
                }
            }

            if (!currentKeys.includes("Tab")) {
                if (focusedElement === document.body) {
                    if (e.key === "Backspace" || e.key === "Escape" || e.key === "Esc") {
                        ActionsMegaFunction("return", "keyboard");
                        return;
                    }
                }

                if (form) {
                    if (
                        !header.contains(focusedElement) &&
                        !document.querySelector("#options").contains(focusedElement) &&
                        !document.querySelector("#exit-popup").contains(focusedElement)
                    ) {
                        if (form.contains(focusedElement) && (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA")) {
                            if (writingMode && (e.key === "Esc" || e.key === "Escape")) {
                                ActionsMegaFunction("return", "keyboard");
                                return;
                            }
                        } else {
                            writingMode = false;
                            if ("virtualKeyboard" in navigator) {
                                navigator.virtualKeyboard.hide();
                            }
                        }
                    }
                }

                if (!form || (form && !writingMode) || (form && !form.contains(focusedElement))) {
                    e.preventDefault();

                    // Inicia o foco automaticamente caso o utilizador não queira abrir imediatamente o menu
                    if (focusedElement === document.body) {
                        if (
                            currentKeys.includes("ArrowUp") ||
                            currentKeys.includes("ArrowDown") ||
                            currentKeys.includes("ArrowLeft") ||
                            currentKeys.includes("ArrowRight") ||
                            currentKeys.includes("w") ||
                            currentKeys.includes("W") ||
                            currentKeys.includes("s") ||
                            currentKeys.includes("S") ||
                            currentKeys.includes("a") ||
                            currentKeys.includes("A") ||
                            currentKeys.includes("d") ||
                            currentKeys.includes("D") ||
                            currentKeys.includes(" ") ||
                            currentKeys.includes("Spacebar") ||
                            currentKeys.includes("Enter") ||
                            currentKeys.includes("Backspace") ||
                            currentKeys.includes("e") ||
                            currentKeys.includes("E") ||
                            currentKeys.includes("p") ||
                            currentKeys.includes("P")
                        ) // Se alguma das teclas de navegação for acionada, mas não estiver
                        {
                            e.preventDefault();

                            if (
                                navButton.getAttribute("aria-expanded") === "false" &&
                                document.querySelector("#exit-popup").getAttribute("aria-hidden") === "true"
                            ) {
                                main.querySelector("section").focus();
                                if (!intro || (intro && intro.opacity === 0)) {
                                    PlaySound("mover");
                                }
                            } else if (
                                navButton.getAttribute("aria-expanded") === "false" &&
                                document.querySelector("#exit-popup").getAttribute("aria-hidden") === "false"
                            ) {
                                document.querySelector("#exit-popup #cancel").focus();
                                PlaySound("mover");
                            } else if (
                                navButton.getAttribute("aria-expanded") === "true" &&
                                document.querySelector("#options").getAttribute("aria-hidden") === "true"
                            ) {
                                document.querySelector("#nav-list li > a").focus();
                                PlaySound("mover");
                            } else if (document.querySelector("#options").getAttribute("aria-hidden") === "false") {
                                document.querySelector("#options input").focus();
                                PlaySound("mover");
                            }

                            UpdateActionBar(null);
                            return;
                        }
                    }

                    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
                        e.preventDefault();

                        MoveSelection(1, "column");
                    }
                    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
                        e.preventDefault();

                        MoveSelection(-1, "column");
                    }
                    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                        e.preventDefault();

                        // Repõe o atalho de teclado para avançar no histórico
                        if (e.key === "ArrowRight" && e.altKey === true) {
                            history.forward();
                        }

                        MoveSelection(1, "row");
                    }
                    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                        e.preventDefault();

                        // Repõe o atalho de teclado para recuar no histórico
                        if (e.key === "ArrowLeft" && e.altKey === true) {
                            history.back();
                        }

                        MoveSelection(-1, "row");
                    }

                    if (e.key === "e" || e.key === "E" || e.key === "p" || e.key === "P") {
                        // e.preventDefault();

                        const heroHome = main.querySelector("#hero-home");

                        if (heroHome && heroHome.contains(focusedElement) && heroHome.querySelector("stacked-alpha-video")) {
                            PlayAnimation(heroHome.querySelector("#avatar video"));
                        }
                        if (main.querySelector("figure[aria-current='true'] video")) {
                            PlayAnimation(main.querySelector("figure[aria-current='true']"));
                        }
                    }

                    if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
                        e.preventDefault();

                        ActionsMegaFunction("select", "keyboard");
                    }
                    if (e.key === "Backspace" || e.key === "Escape" || e.key === "Esc") {
                        ActionsMegaFunction("return", "keyboard");
                    }

                    UpdateActionBar(null);
                }
            }
        }

        // Para controlar os tabs e para restaurar os atalhos de teclado
        if (e.key === "Tab") {
            // debugger;
            const mainNav = document.querySelector("#main-nav");
            const navList = Array.from(document.querySelector("#nav-list ul").children);
            const options = document.querySelector("#options");
            const optionsList = Array.from(options.querySelectorAll("input"));
            const exitPopup = document.querySelector("#exit-popup");
            const exitPopupList = Array.from(exitPopup.querySelectorAll("input, button"));

            if (main.querySelector("form") && main.querySelector("form").contains(focusedElement)) {
                writingMode = true;
                if ("virtualKeyboard" in navigator) {
                    navigator.virtualKeyboard.show();
                }
            }

            // Se sair do menu pelo fim da lista
            if (
                navList[navList.length - 1].contains(focusedElement) &&
                navButton.getAttribute("aria-expanded") === "true" &&
                options.getAttribute("aria-hidden") === "true" &&
                e.shiftKey === false
            ) {
                // e.preventDefault();
                ToggleNavMenu("keyboard");
            }
            // Se sair do menu pelo início (pelo botão)
            if (
                navButton.contains(focusedElement) &&
                navButton.getAttribute("aria-expanded") === "true" &&
                options.getAttribute("aria-hidden") === "true" &&
                e.shiftKey === true
            ) {
                // e.preventDefault();
                ToggleNavMenu("keyboard");
            }
            // Se sair das opções pelo início da lista
            if (options.querySelector("#options-icon button").contains(focusedElement) && e.shiftKey === true) {
                e.preventDefault();
                ToggleAccessOptions("keyboard");
            }
            // Se sair das opções pelo fim da lista
            if (optionsList[optionsList.length - 1].contains(focusedElement) && e.shiftKey === false) {
                e.preventDefault();
                ToggleAccessOptions("keyboard");
            }
            // Se sair do popup pelo fim da lista
            if (exitPopupList[0].contains(focusedElement) && e.shiftKey === true) {
                e.preventDefault();
                ToggleExitPopup("keyboard", savedLink);
            }
            // Se sair do popup pelo fim da lista
            if (exitPopupList[exitPopupList.length - 1].contains(focusedElement) && e.shiftKey === false) {
                e.preventDefault();
                ToggleExitPopup("keyboard", savedLink);
            }

            // Toca o som da ação
            if (sawIntro) {
                PlaySound("mover");
            }

            document.dispatchEvent(new Event("mouse-focus"));
            // UpdateActionBar(null);
        }
    }
});

// document.querySelectorAll("label:has(~ input)").forEach((label) => {
//     label.parentElement.addEventListener("click", (e) => {
//         // e.preventDefault();
//         // div.parentElement.blur();
//         const input = label.parentElement.querySelector("input");

//         // console.log(input);

//         if (document.activeElement !== input) {
//             label.focus();
//             if (input.getAttribute("type") === "checkbox") {
//                 input.click();
//             }
//         }
//     });
// });

document.addEventListener("keyup", (e) => {
    // keyPressed = false;
    // holdTime = 0;
    currentKeys.splice(e.key);
});

// ================================== MEGA FUNÇÃO DAS AÇÕES POSSÍVEIS ==========================================
function ActionsMegaFunction(action, device) {
    const focusedElement = document.activeElement;

    // ------------------------------------- SELECT ---------------------------------------
    if (action === "select") {
        // debugger;
        if (
            focusedElement.tagName === "A" ||
            focusedElement.tagName === "BUTTON" ||
            focusedElement.tagName === "INPUT" ||
            focusedElement.tagName === "TEXTAREA" ||
            focusedElement.tagName === "SUMMARY"
        ) {
            // Se estiver o botão de navegação
            if (focusedElement === navButton) {
                ToggleNavMenu(device);
            }
            // Se estiver a focar o botão de acessibilidade
            else if (focusedElement === document.querySelector("#accessibility-button")) {
                ToggleAccessOptions(device);
            }
            // Se estiver a focar o botão de fechar o menu de opções
            else if (focusedElement === document.querySelector("#options-icon button")) {
                ToggleAccessOptions(device);
            }
            // Se estiver a focar o botão de voltar para o topo
            else if (focusedElement === footer.querySelector("#go-to-top > a")) {
                main.querySelector("section").focus();
                footer.querySelector("#go-to-top > a").animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });
                PlaySound("selecionar");
                UpdateActionBar(device);
                // return;
            }
            // Outras opções
            else {
                const pathname = location.pathname;
                const currentUrl = location.href;
                const currentDomain = currentUrl.substring(0, currentUrl.indexOf(pathname));

                if (focusedElement.tagName === "A" && !focusedElement.href.startsWith(currentDomain)) {
                    // console.log(device);
                    if (device === "gamepad" && !accessOptions.controller.rememberExit) {
                        ToggleExitPopup(device, focusedElement);
                    } else {
                        focusedElement.click();
                    }
                    return;
                } else {
                    if (main.querySelector("form")) {
                        if (main.querySelector("form").contains(focusedElement)) {
                            if (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA") {
                                writingMode = true;
                                focusedElement.dispatchEvent(new Event("focus"));
                                PlaySound("selecionar");

                                if ("virtualKeyboard" in navigator) {
                                    navigator.virtualKeyboard.show();
                                }
                                return;
                            }
                        }
                    }
                    focusedElement.click();
                }
            }
        } else if (document.querySelector("#options").contains(focusedElement) && focusedElement.tagName === "INPUT") {
            focusedElement.click();
        } else if (focusedElement === main.querySelector("#gallery-buttons")) {
            return;
        } else {
            EnterSelection();
        }
    }
    // -------------------------------------- RETURN --------------------------------------
    if (action === "return") {
        // debugger;

        if (
            (focusedElement === document.body && navButton.getAttribute("aria-expanded") === "false") ||
            focusedElement.tagName === "SECTION" ||
            focusedElement.tagName === "FOOTER"
        ) {
            ToggleNavMenu(device);
            return;
        }
        if (navButton.getAttribute("aria-expanded") === "true" && document.querySelector("#options").getAttribute("aria-hidden") === "true") {
            // Se o menu de navegação estiver aberto, fecha o menu e volta para a página
            ToggleNavMenu(device);
            return;
        }
        // Se o menu de opções estiver aberto, fecha as opções e volta para o menu nav
        else if (navButton.getAttribute("aria-expanded") === "true" && document.querySelector("#options").getAttribute("aria-hidden") === "false") {
            ToggleAccessOptions(device);
            return;
        } else if (document.querySelector("#exit-popup").getAttribute("aria-hidden") === "false") {
            ToggleExitPopup(device, savedLink);
            return;
        }
        // Se o menu nav não estiver aberto, retira o foco atual e averigua o que fazer
        else if (!header.contains(focusedElement)) {
            // Se estivermos a lidar com um campo de um formulário, fecha o modo de edição
            if (main.querySelector("form")) {
                if (main.querySelector("form").contains(focusedElement)) {
                    if (focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA") {
                        if (writingMode) {
                            writingMode = false;
                            PlaySound("recuar");
                            focusedElement.dispatchEvent(new Event("focus"));

                            if ("virtualKeyboard" in navigator) {
                                navigator.virtualKeyboard.hide();
                            }
                            return;
                        }
                    }
                }
            }
            ExitSelection();
        }
    }
}

// ================================================= POPUP DE SAÍDA DO SITE ==============================================
let savedLink = null;
function ToggleExitPopup(input, link) {
    if (!input) console.error("Método de entrada não foi definido!");

    // debugger;
    // console.log(input);
    // console.log(link);

    if (link) savedLink = link;
    else savedLink = null;
    console.log(savedLink);

    const exitPopup = document.querySelector("#exit-popup");
    const background = document.querySelector("#background");

    if (exitPopup.getAttribute("aria-hidden") === "true") {
        exitPopup.setAttribute("aria-hidden", "false");
        background.classList.replace("menu-closed", "popup-open");
        PlaySound("popups");

        exitPopup.querySelectorAll("[tabindex='-1']").forEach((element) => {
            element.setAttribute("tabindex", "0");
        });

        exitPopup.querySelector("#cancel").focus();
    } else if (exitPopup.getAttribute("aria-hidden") === "false") {
        exitPopup.setAttribute("aria-hidden", "true");
        background.classList.replace("popup-open", "menu-closed");

        if (savedLink) savedLink.focus();
        savedLink = null;

        exitPopup.querySelectorAll("[tabindex='0']").forEach((element) => {
            element.setAttribute("tabindex", "-1");
        });

        // PlaySound("selecionar");
    }
}

// Botão de cancelar
document.querySelector("#cancel").addEventListener("click", (e) => {
    // e.preventDefault();
    if (savedLink) {
        savedLink.focus();
    }

    // Isto apaga o link após o abrir, porque senão os links acumulam-se e abrem todos de uma só vez
    savedLink = null;

    ToggleExitPopup("gamepad", null);
});
// Botão de confirmar
document.querySelector("#confirm").addEventListener("click", (e) => {
    // e.preventDefault();

    if (savedLink) {
        savedLink.click();
        savedLink.focus();
    }

    // Isto apaga o link após o abrir, porque senão os links acumulam-se e abrem todos de uma só vez
    savedLink = null;

    ToggleExitPopup("gamepad", null);
});

// ================================================= MENU DE NAVEGAÇÃO ====================================================
function ToggleNavMenu(input) {
    if (!input) console.error("Método de entrada não foi definido!");
    // debugger;
    // console.log(input);

    const menuList = document.querySelector("#main-nav ul");
    const background = document.querySelector("#background");

    // Se o utilizador não tiver ativado a opção de reduzir as animações, anima o botão do menu de navegação
    if (window.getComputedStyle(reducedMotionDetector).backgroundColor === "rgb(255, 0, 0)")
        navButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });

    if (menuList.getAttribute("aria-hidden") === "true") {
        // console.log("A tentar mostrar");

        menuList.setAttribute("aria-hidden", "false"); // mostra o menu e informa que está visível
        navButton.setAttribute("aria-expanded", "true");
        background.classList.replace("menu-closed", "menu-open");

        menuList.querySelectorAll("[tabindex='-1']").forEach((link) => {
            link.setAttribute("tabindex", "0");
        });

        const menuFirstOption = menuList.querySelector("li > a");
        // console.log(menuFirstOption);

        menuFirstOption.focus();
        if (input === "mouse") document.activeElement.blur();
    } else if (menuList.getAttribute("aria-hidden") === "false") {
        // console.log("A tentar esconder");

        document.activeElement.blur(); // tira o foco atual
        menuList.setAttribute("aria-hidden", "true"); // esconde o menu e informa que está escondido
        navButton.setAttribute("aria-expanded", "false");
        background.classList.replace("menu-open", "menu-closed");

        menuList.querySelectorAll("[tabindex='0']").forEach((link) => {
            link.setAttribute("tabindex", "-1");
        });

        if (input !== "mouse") main.querySelector("section").focus();
    }

    PlaySound("popups");

    // if(input === "keyboard") input = null;
    UpdateActionBar(null);

    // Tira o foco do ícone de navegação (mas o problema é o hover, não o focus)
    // if (document.activeElement === navButton) navButton.blur();
}

// =================================================== MENU DE OPÇÕES =========================================================
function ToggleAccessOptions(input) {
    if (!input) console.error("Método de entrada não foi definido!");
    // debugger;

    // console.log(input);

    const options = document.querySelector("#options");

    const menuList = document.querySelector("#main-nav ul");
    const background = document.querySelector("#background");

    if (options.getAttribute("aria-hidden") === "true") {
        // console.log("A tentar mostrar");

        options.setAttribute("aria-hidden", "false"); // mostra o menu e informa que está visível
        background.classList.replace("menu-open", "options-open");

        options.querySelectorAll("[tabindex='-1']").forEach((element) => {
            element.setAttribute("tabindex", "0");
            // console.log(element);
        });

        const menuFirstOption = options.querySelector("input");
        // console.log(menuFirstOption);
        menuFirstOption.focus();

        // Se o input vier to teclado ou do comando
        if (input === "mouse") document.activeElement.blur();
    } else if (options.getAttribute("aria-hidden") === "false") {
        // console.log("A tentar esconder");
        const optionsButton = options.querySelector("#options-icon button");

        // Se o utilizador não tiver ativado a opção de reduzir as animações, anima o botão de fechar as opções de acessibilidade
        if (window.getComputedStyle(reducedMotionDetector).backgroundColor === "rgb(255, 0, 0)")
            optionsButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });

        // setTimeout(() => {
        document.activeElement.blur(); // tira o foco atual

        options.setAttribute("aria-hidden", "true"); // esconde o menu e informa que está escondido
        background.classList.replace("options-open", "menu-open");

        options.querySelectorAll("[tabindex='0']").forEach((element) => {
            element.setAttribute("tabindex", "-1");
            // console.log(element);
        });

        const accessOptionsButton = document.querySelector("#accessibility-button");
        // console.log(accessOptionsButton);
        accessOptionsButton.focus();

        // Se o input vier to teclado ou do comando
        if (input === "mouse") document.activeElement.blur();
        // }, 50);
    }

    PlaySound("popups");
}

function EnterSelection() {
    // debugger;

    const childrenArray = Array.from(document.activeElement.children);

    if (document.activeElement !== document.body) {
        // if (document.activeElement.tagName === "SECTION")
        for (let i = 0; i < childrenArray.length; i++) {
            // Vai à procura do primeiro link ou botão que encontre para lhe dar foco
            const interactibleChild = childrenArray[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary");

            if (interactibleChild) {
                if (interactibleChild.matches("#gallery-left button") || interactibleChild.matches("#gallery-right button")) {
                    if (!galleryButtons.classList.contains("focused")) {
                        galleryButtons.classList.add("focused");
                    }
                    galleryButtons.focus();
                    PlaySound("mover");
                    break;
                }
                interactibleChild.focus();
                PlaySound("selecionar");
                break;
            }
        }
    } else return;
}

function ExitSelection() {
    // debugger;

    if (document.activeElement.tagName !== "SECTION" && document.activeElement !== footer) {
        const focusedElement = document.activeElement;

        let parent = focusedElement.parentElement;
        if (parent) {
            while (parent.tagName !== "SECTION" && parent !== footer) {
                parent = parent.parentElement;
            }

            if (galleryButtons) {
                galleryButtons.dispatchEvent(new Event("remove-focus"));
            }

            parent.focus();
            PlaySound("recuar");
        }

        // alert("falta programar esta parte!");
    } else return;
}

function MoveSelection(direction, columnOrRow) {
    if (direction !== 1 && direction !== -1) console.error("Direção não definida!");
    if (columnOrRow !== "row" && columnOrRow !== "column") console.error("Disposição não definida!");

    const focusedElement = document.activeElement;
    // console.log(focusedElement);

    // debugger;

    if (focusedElement.classList.contains("mouse-focus")) {
        focusedElement.focus();
        PlaySound("mover");
        return;
    }

    if (columnOrRow === "row") {
        if (focusedElement.tagName === "SECTION" || focusedElement === footer) {
            EnterSelection();
            return;
        }
        if (focusedElement === main.querySelector("#gallery-left button") || focusedElement === main.querySelector("#gallery-right button")) {
            const galleryButtons = main.querySelector("#gallery-buttons");
            if (!galleryButtons.classList.contains("focused")) {
                galleryButtons.classList.add("focused");
            }
            galleryButtons.focus();
            return;
        }
    }

    const mainNav = document.querySelector("#main-nav");
    const navList = document.querySelector("#nav-list");
    const options = document.querySelector("#options");
    const exitPopup = document.querySelector("#exit-popup");

    // Se não estivermos no menu de navegação nem no menu de opções, muda para o modo de seleção normal
    if (main.contains(focusedElement) || footer.contains(focusedElement)) {
        writingMode = false;

        if ("virtualKeyboard" in navigator) {
            navigator.virtualKeyboard.hide();
        }

        const form = document.querySelector("form");
        if (form && form.contains(focusedElement)) focusedElement.dispatchEvent(new Event("focus"));
    }

    if (
        main.contains(focusedElement) ||
        footer.contains(focusedElement) ||
        mainNav.contains(focusedElement) ||
        options.contains(focusedElement) ||
        exitPopup.contains(focusedElement)
    ) {
        let currentNode = focusedElement;
        // let elementList = Array.from(currentNode.children);
        // let elementIndex;

        // debugger;

        if (mainNav.contains(focusedElement) && columnOrRow === "row") {
            return;
        }

        // Isto aqui vai ser o loop de navegação, olha para o parent do elemento em que está e analisa os filhos à procura de <a> ou <button>
        while (currentNode) {
            const parent = currentNode.parentElement;

            if (!parent) break;

            let elementList = Array.from(parent.children);
            let elementIndex = elementList.findIndex((n) => n === currentNode);

            // debugger;

            // Aqui tratamos logo de alterar as opções do Menu de Acessibilidade
            if (columnOrRow === "row" && options.contains(focusedElement) && focusedElement.tagName === "INPUT") {
                // debugger;

                const input = parent.querySelector("input");
                if (input) {
                    if (input.getAttribute("type") === "range") {
                        // const name = input.name;

                        if (direction === 1) {
                            if (input.valueAsNumber < parseInt(input.max)) {
                                input.stepUp();
                                // console.log(input.valueAsNumber, parseInt(input.max));

                                PlaySound("range");
                                input.dispatchEvent(new Event("change"));
                            }
                        } else if (direction === -1) {
                            if (input.valueAsNumber > parseInt(input.min)) {
                                input.stepDown();
                                // console.log(input.valueAsNumber, parseInt(input.min));

                                PlaySound("range");
                                input.dispatchEvent(new Event("change"));
                            }
                        }

                        return;
                    } else if (input.getAttribute("type") === "checkbox") {
                        if (input.checked && direction === -1) {
                            input.click();
                        } else if (!input.checked && direction === 1) {
                            input.click();
                        }
                        return;
                    }
                }
            }

            if (columnOrRow === "row" && focusedElement === galleryButtons) {
                // debugger;

                if (direction === -1) {
                    ChangeGallerySlide(-1);
                } else if (direction === 1) {
                    ChangeGallerySlide(1);
                }

                if (!galleryButtons.classList.contains("focused")) {
                    galleryButtons.classList.add("focused");
                }
                return;
            }

            /*// Exceções da navegação para o rodapé
            if (columnOrRow === "row") {
                // Se o elemento em foco for o botão de voltar para o topo
                if (currentNode === footer.querySelector("#go-to-top > a")) {
                    debugger;

                    if (direction === 1) {
                        return;
                    } else if (direction === -1) {
                        const array = Array.from(footer.querySelector("ul#social-media").children);

                        if (array.length !== 0) {
                            for (let i = array.length - 1; i >= 0; i = i--) {
                                if (array[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                    array[i].focus();
                                    return;
                                } else if (array[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    array[i]
                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                        .focus();
                                    return;
                                }
                            }
                        }
                    }
                }
                // Se o elemento em foco for o link para a página principal
                else if (currentNode === footer.querySelector("a.main-logo") && direction === -1) {
                    debugger;

                    // alert("yo");
                    // direction *= -1;
                    // console.log(direction);
                    // debugger;
                }
            }*/

            let i = elementIndex + direction;

            // Isto é o loop dos irmãos do elemento atual
            while (i >= 0 && i <= elementList.length - 1) {
                // Isto acontece quando o foco vai para o header ou para o footer a partir do main
                if (!main.contains(elementList[i]) && main.contains(currentNode)) {
                    // debugger;

                    if (elementList[i] === footer && columnOrRow === "column") {
                        footer.focus();
                        PlaySound("moverSeccao-checkbox");
                        return;
                    }
                }
                // E este é o comportamento dentro do main
                else {
                    if (galleryButtons) {
                        galleryButtons.dispatchEvent(new Event("remove-focus"));
                    }

                    if (elementList[i].tagName === "SECTION" && columnOrRow === "column") {
                        elementList[i].focus();
                        PlaySound("moverSeccao-checkbox");
                        return;
                    } else {
                        // debugger;

                        // Se o foco estiver no menu de opções, impede que saia do mesmo
                        if (options.contains(currentNode) && !options.contains(elementList[i])) {
                            return;
                        }

                        // Se o foco estiver no popup de saída, impede que saia do mesmo
                        if (exitPopup.contains(currentNode) && !exitPopup.contains(elementList[i])) {
                            return;
                        }

                        if (columnOrRow === "column") {
                            // Se por acaso o foco passar para dentro de um dos botões de foco ou da barra de ações, ignora-os
                            if (currentNode === footer && elementList[i] === document.querySelector("#scroll-n-actions")) {
                                i += direction;
                                continue;
                            }
                            // Se vier do footer e passar para o main
                            if (currentNode === footer && elementList[i] === main) {
                                if (elementList[i].querySelector("section")) {
                                    const mainChildren = Array.from(main.children);
                                    mainChildren[mainChildren.length - 1].focus();
                                    PlaySound("moverSeccao-checkbox");
                                    return;
                                }
                            }
                        }

                        // console.log(currentNode, elementList[i]);

                        // debugger;

                        // Caso estejamos a percorrer uma lista de <details>, tem de se saltar corretamente quando estão fechados
                        if (direction === 1 && currentNode.tagName === "SUMMARY" && !currentNode.parentElement.hasAttribute("open")) {
                            i += direction;
                            continue;
                        }

                        // Caso estejamos a lidar com um <details>, tem de se focar o conteúdo lá dentro
                        if (direction === -1 && elementList[i].tagName === "DETAILS") {
                            if (elementList[i].hasAttribute("open")) {
                                const interactibleList = Array.from(
                                    elementList[i].querySelectorAll("a, button:not([disabled]), [tabindex='0'], input, textarea, summary"),
                                );
                                if (interactibleList.length !== 0) {
                                    // console.log(interactibleList[interactibleList.length - 1]);
                                    interactibleList[interactibleList.length - 1].focus();
                                    PlaySound("mover");
                                    return;
                                }
                            } else {
                                const summary = elementList[i].querySelector("summary");
                                // console.log(summary);
                                if (summary) {
                                    summary.focus();
                                    PlaySound("mover");
                                    return;
                                }
                            }
                        }

                        // debugger;
                        if (columnOrRow === "column") {
                            // Se estivermos a lidar com ítens dispostos numa linha, cancela a função e foca o elemento pai
                            if (
                                window.getComputedStyle(parent).display.includes("flex") &&
                                window.getComputedStyle(parent).flexDirection.includes("row")
                            ) {
                                i += direction;
                                continue;
                            }
                            // Se não, executa a função
                            else {
                                // console.log(elementList[i]);
                                if (elementList[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // se o próximo/anterior item for um <a> ou <button> ou outro, foca

                                    elementList[i].focus();
                                    PlaySound("mover");
                                    return;
                                } else if (elementList[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // console.log(elementList[i].querySelector("a, button, [tabindex='0'], input, summary"));
                                    // se o próximo/anterior item contiver um <a> ou <button> ou outro, foca no que encontrar primeiro
                                    const array = Array.from(
                                        elementList[i].querySelectorAll("a, button:not([disabled]), [tabindex='0'], input, textarea, summary"),
                                    );

                                    if (
                                        array.includes(main.querySelector("#gallery-left button")) ||
                                        array.includes(main.querySelector("#gallery-right button"))
                                    ) {
                                        if (!galleryButtons.classList.contains("focused")) {
                                            galleryButtons.classList.add("focused");
                                        }
                                        galleryButtons.focus();
                                        PlaySound("mover");
                                        return;
                                    }

                                    // console.log(array);
                                    if (direction === 1 || (direction === -1 && footer.contains(elementList[i]))) {
                                        const summary = elementList[i].querySelector("summary");
                                        if (summary) {
                                            for (let j = 0; j < elementList.length; j++) {
                                                if (summary.parentElement.hasAttribute("open") && summary.parentElement.contains(elementList[i])) {
                                                    array.splice(i, 1);
                                                }
                                            }
                                        }
                                        array[0].focus();
                                        PlaySound("mover");
                                    } else if (direction === -1 && !footer.contains(elementList[i])) {
                                        const summary = elementList[i].querySelector("summary");
                                        if (summary) {
                                            for (let j = 0; j < elementList.length; j++) {
                                                if (summary.parentElement.hasAttribute("open") && summary.parentElement.contains(elementList[i])) {
                                                    array.splice(i, 1);
                                                }
                                            }
                                        }
                                        array[array.length - 1].focus();
                                        PlaySound("mover");
                                    }

                                    return;
                                }
                            }
                        } else if (columnOrRow === "row") {
                            // debugger;
                            // Se estivermos a lidar com ítens dispostos numa linha, executa a função
                            if (
                                window.getComputedStyle(parent).display.includes("flex") &&
                                window.getComputedStyle(parent).flexDirection.includes("row")
                            ) {
                                if (elementList[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    // se o próximo/anterior item for um <a> ou <button> ou outro, foca

                                    elementList[i].focus();
                                    PlaySound("mover");
                                    return;
                                } else if (elementList[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                    /*const newElementArray = Array.from(elementList[i].children);
                                    if (newElementArray.length !== 0) {
                                        if (direction === 1) {
                                            for (let i = 0; i < newElementArray.length; i = i++) {
                                                if (newElementArray[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                                    newElementArray[i].focus();
                                                    return;
                                                } else if (
                                                    newElementArray[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                ) {
                                                    newElementArray[i]
                                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                        .focus();
                                                    return;
                                                }
                                            }
                                        } else if (direction === -1) {
                                            for (let i = newElementArray.length - 1; i >= 0; i = i--) {
                                                if (newElementArray[i].matches("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")) {
                                                    // se o próximo/anterior item for um <a> ou <button>, foca
                                                    newElementArray[i].focus();
                                                    return;
                                                } else if (
                                                    newElementArray[i].querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                ) {
                                                    newElementArray[i]
                                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                                        .focus();
                                                    return;
                                                }
                                            }
                                        }
                                    }
                                    // se o próximo/anterior item contiver um <a> ou <button>, foca no que encontrar primeiro
                                    elementList[i]
                                        .querySelector("a, button:not([disabled]), [tabindex='0'], input, textarea, summary")
                                        .focus();
                                    return;*/

                                    // se o próximo/anterior item contiver um <a> ou <button> ou outro, foca no que encontrar primeiro
                                    const array = Array.from(
                                        elementList[i].querySelectorAll("a, button:not([disabled]), [tabindex='0'], input, textarea, summary"),
                                    );

                                    // Se o elemento a ser realçado for um dos botões da galeria, força a que selecione o container, de forma que a navegação funcione

                                    if (direction === 1) {
                                        array[0].focus();
                                        PlaySound("mover");
                                    } else if (direction === -1) {
                                        array[array.length - 1].focus();
                                        PlaySound("mover");
                                    }
                                    return;
                                }
                            }
                            // Se não, cancela a função e foca o elemento pai
                            else {
                                i += direction;
                                continue;
                            }
                        }
                    }
                }

                // Se não encontrar, procura no próximo/anterior index, até que não haja mais
                i += direction;
            }

            // debugger;

            // console.log("já não tem mais filhos, a subir de nível");

            // Se já não houver mais, procura no nível acima
            if (
                main.contains(currentNode) ||
                footer.contains(currentNode) ||
                navButton.contains(currentNode) ||
                navList.contains(currentNode) ||
                options.contains(currentNode) ||
                exitPopup.contains(currentNode)
            ) {
                currentNode = parent;
            } else return;
        }
    }
}

function Scroll(direction) {
    if (direction !== -1 && direction !== 1) console.error("direção não definida!");

    // Faz scroll para cima ou para baixo, consoante a direção
    window.scrollBy(0, (window.innerHeight / 2) * direction);
    PlaySound("selecionar");

    let scrollButton;
    if (direction === -1) scrollButton = document.querySelector("#scroll-up");
    else if (direction === 1) scrollButton = document.querySelector("#scroll-down");

    // Se o utilizador não tiver ativado a opção de reduzir as animações, anima os botões de scroll
    if (window.getComputedStyle(reducedMotionDetector).backgroundColor === "rgb(255, 0, 0)") {
        scrollButton.animate(buttonWiggleAnimation, { duration: 150, iterations: 1 });
    }
}

let previousButtons = [[], [], [], []]; // no final de cada frame, vai guardar as informações dos botões
let previousAxes = [[], [], [], []];

let lastFrame = performance.now();

let holdTime = 0;
let gamepadHoldTime = [0, 0, 0, 0];
let holdActionStartTime = 0;
let gamepadHoldActionStartTime = [0, 0, 0, 0];

// gamepadConnected = "PlayStation4";

// Tem de ser feito um loop de cada frame para que se possa detetar os botões
function MainLoop() {
    const currentFrame = performance.now();

    // console.log(navigator.getGamepads());

    // Caso sem querer atribua o index 1 e o 0 estiver vazio, por exemplo
    const gamepad = navigator.getGamepads().filter((g) => g !== null && g.mapping === "standard");
    // console.log(gamepad);

    const focusedElement = document.activeElement;

    // console.log(writingMode);

    // console.log(currentKeys);

    galleryHoverTime += deltaTime;
    // if (galleryHoverTime >= 1000) {
    ShowPauseButton();
    // }
    // console.log(galleryHoverTime);

    if (gamepad.length > 0) {
        gamepad.forEach((gamepadObject, i) => {
            // console.log(gamepadObject);
            // console.log(navigator.getGamepads());

            // if (gamepad.every((g) => g.mapping === "standard")) {
            // Isto trata de scrollar na página
            if (Math.abs(gamepadObject.axes[3]) >= 0.07) {
                window.scrollBy({ left: 0, top: gamepadObject.axes[3] * 2 * deltaTime, behavior: "instant" });
                GetGamepadInfo(gamepadObject);
            }

            // Isto apenas faz arrays dos valores de todos os botões e dos eixos
            const currentButtons = gamepadObject.buttons.map((b) => b.value);
            const currentAxes = gamepadObject.axes;

            // Apenas basta adicionar quando uma tecla é pressionada
            if (currentKeys.length > 0 || !currentButtons.every((b) => b === 0) || currentAxes.some((a) => Math.abs(a) >= 0.7)) {
                // console.log(currentButtons);

                gamepadHoldTime[i] += deltaTime;
                // gamepadHoldActionStartTime[i] += deltaTime;
            } else {
                gamepadHoldTime[i] = 0;
                gamepadHoldActionStartTime[i] = 0;
            }

            // console.log(gamepadHoldTime[i], gamepadHoldActionStartTime[i]);

            // No momento em que o comando é detetado, assume que no frame anterior nenhum botão foi pressionado e que nenhum eixo foi movido
            if (previousButtons[i].length === 0) {
                previousButtons[i] = currentButtons.map((b) => 0);
                // console.log("previousButtons", previousButtons);
            }
            if (previousAxes[i].length === 0) {
                previousAxes[i] = currentAxes.map((a) => 0);
                // console.log("previousButtons", previousButtons);
            }

            // --------------------------------------- BOTÕES COMANDO ----------------------------------------------
            // Ações de PRESSIONAR um botão
            const buttonPressActions = {
                0: () => {
                    if (
                        GetGamepadInfo(gamepadObject).includes("Nintendo") &&
                        !gamepadObject.id.includes("(L/R)") &&
                        !gamepadObject.id.includes("(L)") &&
                        !gamepadObject.id.includes("(R)")
                    ) {
                        // B (Nintendo) tem a ação de voltar
                        ActionsMegaFunction("return", "gamepad");
                    } else {
                        // Xis e A têm a função de selecionar
                        ActionsMegaFunction("select", "gamepad");
                    }
                },
                1: () => {
                    if (
                        GetGamepadInfo(gamepadObject).includes("Nintendo") &&
                        !gamepadObject.id.includes("(L/R)") &&
                        !gamepadObject.id.includes("(L)") &&
                        !gamepadObject.id.includes("(R)")
                    ) {
                        // A (Nintendo) tem a ação de selecionar
                        ActionsMegaFunction("select", "gamepad");
                    } else {
                        // Círculo e B têm a função de voltar
                        ActionsMegaFunction("return", "gamepad");
                    }
                },
                2: () => {
                    if (
                        GetGamepadInfo(gamepadObject).includes("Nintendo") &&
                        !gamepadObject.id.includes("(L/R)") &&
                        !gamepadObject.id.includes("(L)") &&
                        !gamepadObject.id.includes("(R)")
                    ) {
                        const heroHome = main.querySelector("#hero-home");

                        if (heroHome && heroHome.contains(focusedElement) && heroHome.querySelector("stacked-alpha-video")) {
                            // Y (Nintendo) tem a função de reproduzir a animação
                            PlayAnimation(heroHome.querySelector("#avatar video"));
                        }
                        if (main.querySelector("figure[aria-current='true'] video")) {
                            PlayAnimation(main.querySelector("figure[aria-current='true']"));
                        }
                    }
                },
                3: () => {
                    if (
                        GetGamepadInfo(gamepadObject).includes("Nintendo") &&
                        !gamepadObject.id.includes("(L/R)") &&
                        !gamepadObject.id.includes("(L)") &&
                        !gamepadObject.id.includes("(R)")
                    ) {
                        // ignorar
                    } else {
                        const heroHome = main.querySelector("#hero-home");

                        if (heroHome && heroHome.contains(focusedElement) && heroHome.querySelector("stacked-alpha-video")) {
                            // Triângulo e Y têm a função de reproduzir a animação
                            PlayAnimation(heroHome.querySelector("#avatar video"));
                        }
                        if (main.querySelector("figure[aria-current='true'] video")) {
                            PlayAnimation(main.querySelector("figure[aria-current='true']"));
                        }
                    }
                },
                9: () => {
                    // Start
                    if (document.querySelector("#options").getAttribute("aria-hidden") === "true") ToggleNavMenu("gamepad");
                    else ToggleAccessOptions("gamepad");
                },
                12: () => {
                    // D-pad up
                    MoveSelection(-1, "column");
                },
                13: () => {
                    // D-pad down
                    MoveSelection(1, "column");
                },
                14: () => {
                    // D-pad left
                    MoveSelection(-1, "row");
                },
                15: () => {
                    // D-pad right
                    MoveSelection(1, "row");
                },
            };

            // Ações de LARGAR um botão
            const buttonReleaseActions = {};

            // Avalia o estado atual e anterior dos botões e realiza as ações respetivas
            for (let b = 0; b < currentButtons.length; b++) {
                // Ação PRESS
                if (currentButtons[b] > 0 && previousButtons[i][b] === 0) {
                    // debugger;

                    // Inicia o foco automaticamente caso o utilizador não queira abrir imediatamente o menu
                    if (focusedElement === document.body) {
                        if (intro && intro.getAttribute("aria-hidden") === "false") {
                            ToggleIntroScreen();
                        }
                        // Vai para o elemento de foco, a não ser que o utilizador esteja a abrir/fechar um popup
                        if (!currentButtons[9] > 0) {
                            // debugger;
                            if (
                                (!currentButtons[0] > 0 &&
                                    GetGamepadInfo(gamepadObject).includes("Nintendo") &&
                                    !gamepadObject.id.includes("(L/R)") &&
                                    !gamepadObject.id.includes("(L)") &&
                                    !gamepadObject.id.includes("(R)")) ||
                                (!currentButtons[1] > 0 &&
                                    !(
                                        GetGamepadInfo(gamepadObject).includes("Nintendo") &&
                                        !gamepadObject.id.includes("(L/R)") &&
                                        !gamepadObject.id.includes("(L)") &&
                                        !gamepadObject.id.includes("(R)")
                                    ))
                            ) {
                                if (
                                    navButton.getAttribute("aria-expanded") === "false" &&
                                    document.querySelector("#exit-popup").getAttribute("aria-hidden") === "true"
                                ) {
                                    main.querySelector("section").focus();
                                    if (!intro || (intro && intro.opacity === 0)) {
                                        PlaySound("mover");
                                    }
                                } else if (
                                    navButton.getAttribute("aria-expanded") === "false" &&
                                    document.querySelector("#exit-popup").getAttribute("aria-hidden") === "false"
                                ) {
                                    document.querySelector("#exit-popup #cancel").focus();
                                    PlaySound("mover");
                                } else if (
                                    navButton.getAttribute("aria-expanded") === "true" &&
                                    document.querySelector("#options").getAttribute("aria-hidden") === "true"
                                ) {
                                    document.querySelector("#nav-list a").focus();
                                    PlaySound("mover");
                                } else if (document.querySelector("#options").getAttribute("aria-hidden") === "false") {
                                    document.querySelector("#options input").focus();
                                    PlaySound("mover");
                                }
                                if (i === 0) {
                                    UpdateActionBar("Xbox");
                                } else {
                                    GetGamepadInfo(gamepadObject);
                                }

                                continue; // isto impede de mudar o foco para outro sítio
                            }
                        }
                    }

                    if (buttonPressActions[b]) buttonPressActions[b]();
                    if (i === 0) {
                        UpdateActionBar("Xbox");
                    } else {
                        GetGamepadInfo(gamepadObject);
                    }
                }
                // Ação RELEASE
                if (currentButtons[b] === 0 && previousButtons[i][b] > 0) {
                    if (buttonReleaseActions[b]) buttonReleaseActions[b]();
                }
                // Ação HOLD
                if (currentButtons[b] > 0 && previousButtons[i][b] > 0) {
                    // debugger;

                    // Se ainda não existir, regista o tempo em que se começou a pressionar o botão
                    if (gamepadHoldActionStartTime[i] === 0) {
                        gamepadHoldActionStartTime[i] = performance.now();
                        // console.log(gamepadHoldActionStartTime[i]);
                    }
                    // Se o botão estiver a ser pressionado por mais de 750 ms, inicia as ações de hold
                    if (gamepadHoldTime[i] >= accessOptions.controller.holdDelay) {
                        // debugger;

                        // As ações de hold só iniciam segundo um intervalo estipulado anteriormente (padrão é 250 ms)
                        if (currentFrame - gamepadHoldActionStartTime[i] >= accessOptions.controller.holdInterval) {
                            // console.log("NOW");
                            if (buttonPressActions[b]) buttonPressActions[b]();
                            if (i === 0) {
                                UpdateActionBar("Xbox");
                            } else {
                                GetGamepadInfo(gamepadObject);
                            }

                            gamepadHoldActionStartTime[i] = 0;
                        }
                    }

                    // console.log(i);
                    // console.log(gamepadHoldTime[i], gamepadHoldActionStartTime[i]);
                }
            }

            // Vibração
            // if ("vibrationActuator" in navigator.getGamepads()) {
            //     //
            // }

            // ---------------------------------------- STICKS ANALÓGICOS ---------------------------------------------
            for (let a = 0; a < currentAxes.length; a++) {
                // Ações de MOVER um stick analógico numa direção
                const axisMoveActions = {
                    0: () => {
                        // Stick analógico esquerdo para esquerda/direita
                        if (currentAxes[0] <= -0.7) {
                            MoveSelection(-1, "row");
                            if (i === 0) {
                                UpdateActionBar("Xbox");
                            } else {
                                GetGamepadInfo(gamepadObject);
                            }
                        }
                        if (currentAxes[0] >= 0.7) {
                            MoveSelection(1, "row");
                            if (i === 0) {
                                UpdateActionBar("Xbox");
                            } else {
                                GetGamepadInfo(gamepadObject);
                            }
                        }
                    },
                    1: () => {
                        // Stick analógico esquerdo para cima/baixo
                        if (currentAxes[1] <= -0.7) {
                            MoveSelection(-1, "column");
                            if (i === 0) {
                                UpdateActionBar("Xbox");
                            } else {
                                GetGamepadInfo(gamepadObject);
                            }
                        }
                        if (currentAxes[1] >= 0.7) {
                            MoveSelection(1, "column");
                            if (i === 0) {
                                UpdateActionBar("Xbox");
                            } else {
                                GetGamepadInfo(gamepadObject);
                            }
                        }
                    },
                };

                // Ações de LARGAR um stick analógico para o centro
                const axisReleaseActions = {};

                // Ação PRESS
                if ((currentAxes[a] <= -0.7 && previousAxes[i][a] > -0.7) || (currentAxes[a] >= 0.7 && previousAxes[i][a] < 0.7)) {
                    if (!intro || (intro && intro.getAttribute("aria-hidden") === "true")) {
                        if (focusedElement === document.body) {
                            if (
                                navButton.getAttribute("aria-expanded") === "false" &&
                                document.querySelector("#exit-popup").getAttribute("aria-hidden") === "true"
                            ) {
                                main.querySelector("section").focus();
                                if (!intro || (intro && intro.opacity === 0)) {
                                    PlaySound("mover");
                                }
                            } else if (
                                navButton.getAttribute("aria-expanded") === "false" &&
                                document.querySelector("#exit-popup").getAttribute("aria-hidden") === "false"
                            ) {
                                document.querySelector("#exit-popup #cancel").focus();
                                PlaySound("mover");
                            } else if (
                                navButton.getAttribute("aria-expanded") === "true" &&
                                document.querySelector("#options").getAttribute("aria-hidden") === "true"
                            ) {
                                document.querySelector("#nav-list a").focus();
                                PlaySound("mover");
                            } else if (document.querySelector("#options").getAttribute("aria-hidden") === "false") {
                                document.querySelector("#options input").focus();
                                PlaySound("mover");
                            }
                            if (i === 0) {
                                UpdateActionBar("Xbox");
                            } else {
                                GetGamepadInfo(gamepadObject);
                            }

                            continue; // isto impede de mudar o foco para outro sítio
                        }

                        if (axisMoveActions[a]) axisMoveActions[a]();
                        if (i === 0) {
                            UpdateActionBar("Xbox");
                        } else {
                            GetGamepadInfo(gamepadObject);
                        }
                    }
                }

                // Ação RELEASE
                if ((currentAxes[a] > -0.7 && previousAxes[i][a] <= -0.7) || (currentAxes[a] < 0.7 && previousAxes[i][a] >= 0.7)) {
                    if (axisReleaseActions[a]) axisReleaseActions[a]();
                }

                // Ação HOLD
                if ((currentAxes[a] <= -0.7 && previousAxes[i][a] <= -0.7) || (currentAxes[a] >= 0.7 && previousAxes[i][a] >= 0.7)) {
                    if (gamepadHoldActionStartTime[i] === 0) {
                        gamepadHoldActionStartTime[i] = performance.now();
                        // console.log(gamepadHoldActionStartTime[i]);
                        // console.log(gamepadHoldTime);
                    }
                    // Se o botão estiver a ser pressionado por mais de 750 ms, inicia as ações de hold
                    if (gamepadHoldTime[i] >= accessOptions.controller.holdDelay) {
                        // debugger;

                        // As ações de hold só iniciam segundo um intervalo estipulado anteriormente (padrão é 250 ms)
                        if (currentFrame - gamepadHoldActionStartTime[i] >= accessOptions.controller.holdInterval) {
                            // console.log("NOW");
                            if (!intro || (intro && intro.getAttribute("aria-hidden") === "true")) {
                                if (axisMoveActions[a]) axisMoveActions[a]();
                                if (i === 0) {
                                    UpdateActionBar("Xbox");
                                } else {
                                    GetGamepadInfo(gamepadObject);
                                }
                                gamepadHoldActionStartTime[i] = 0;
                            }
                        }
                    }
                }
            }

            previousButtons[i] = currentButtons;
            previousAxes[i] = currentAxes;

            // console.log(currentAxes, currentButtons);
            // debugger;
        });
    } else {
        // Apenas basta adicionar quando uma tecla é pressionada
        if (currentKeys.length > 0) {
            holdTime += deltaTime;
        } else {
            holdTime = 0;
            holdActionStartTime = 0;
        }

        // console.log(holdTime, holdActionStartTime);
    }

    // ----------------------------------- DESATIVAÇÃO DOS BOTÕES DE SCROLL E GALERIA -------------------------------------

    // Os botões de scroll
    const scrollUp = document.querySelector("#scroll-up button");
    const scrollDown = document.querySelector("#scroll-down button");

    // console.log(window.scrollY, document.body.clientHeight - window.innerHeight);

    // Isto trata de desativar os botões de scroll quando eles não vao fazer efetivamente nada
    if (window.scrollY === 0) {
        scrollUp.disabled = true;
        // scrollUp.getAttribute("aria-Disabled = "true";
    } else {
        scrollUp.disabled = false;
        // scrollUp.getAttribute("aria-Disabled = "false";
    }
    if (Math.abs(window.scrollY - (document.body.clientHeight - window.innerHeight)) <= 1) {
        scrollDown.disabled = true;
        // scrollDown.getAttribute("aria-Disabled = "true";
    } else {
        scrollDown.disabled = false;
        // scrollDown.getAttribute("aria-Disabled = "false";
    }

    // Os botões da galeria de imagens
    const galleryLeft = document.querySelector("#gallery-left button");
    const galleryRight = document.querySelector("#gallery-right button");

    // O necessário para calcular em que slide se está
    const slidesArray = Array.from(main.querySelectorAll("#project-gallery figure"));
    const currentSlide = main.querySelector("figure[aria-current='true']");

    // -------------------------------- CÁLCULO DO DELTA TIME E INÍCIO DA PRÓXIMA FRAME ---------------------------------
    lastFocusedElement = focusedElement;

    // console.log(focusedElement, lastFocusedElement);

    deltaTime = currentFrame - lastFrame; // tempo atual menos o tempo da frame anterior

    lastFrame = currentFrame;
    // console.log(deltaTime);

    // Reinicia o loop
    requestAnimationFrame(MainLoop);
}
MainLoop();
