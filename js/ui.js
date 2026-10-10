/* =========================================================
   DICTEE MAKEN
   ========================================================= */

function maakDictee() {

    stopMarkering();


    const intervallen =
        geselecteerdeIntervallen();


    if (
        Object.keys(
            intervallen
        ).length === 0
    ) {

        document.getElementById(
            "melding"
        ).textContent =
            "kies minstens één interval.";


        melodie = [];


        return false;
    }


    let aantal =
        Number(
            document.getElementById(
                "aantalNoten"
            ).value
        );


    if (
        !Number.isInteger(aantal) ||
        aantal < 2
    ) {

        aantal = INSTELLINGEN.aantalNoten;

        document.getElementById(
            "aantalNoten"
        ).value = aantal;
    }


    if (aantal > 32) {

        aantal = 32;

        document.getElementById(
            "aantalNoten"
        ).value = 32;
    }


    INSTELLINGEN.aantalNoten =
        aantal;


    INSTELLINGEN.startNoot =
        Number(
            document.getElementById(
                "beginnoot"
            ).value
        );


    document.getElementById(
        "melding"
    ).textContent =
        "";


    const resultaat =
        bouwMelodie(
            [INSTELLINGEN.startNoot],
            intervallen,
            null,
            0
        );


    if (!resultaat) {

        document.getElementById(
            "melding"
        ).textContent =
            "met deze combinatie kan binnen het bereik geen dictee worden gemaakt.";


        melodie = [];


        return false;
    }


    melodie =
        resultaat;


    return true;
}


/* =========================================================
   AFSPELEN
   ========================================================= */

let markeerTimers = [];


function stopMarkering() {

    markeerTimers.forEach(clearTimeout);

    markeerTimers = [];

    if (actieveNoot !== -1) {

        actieveNoot = -1;

        tekenNotenbalk();
    }
}


function markeerNoot(index, vertraging) {

    markeerTimers.push(
        setTimeout(
            () => {

                actieveNoot = index;

                tekenNotenbalk();
            },
            vertraging
        )
    );
}


async function speelDictee() {

    if (
        melodie.length === 0
    ) {

        if (!maakDictee()) {
            return;
        }
    }


    const klaar =
        await zorgVoorAudio();


    if (!klaar) {

        document.getElementById(
            "melding"
        ).textContent =
            "audio kon niet worden gestart. tik opnieuw op nieuw dictee of afspelen; probeer anders reset audio.";


        return;
    }


    document.getElementById(
        "melding"
    ).textContent =
        "";


    const tussenruimte =
        60 /
        INSTELLINGEN.tempo;


    const nootDuur =
        tussenruimte *
        0.82;


    const start =
        audioContext.currentTime +
        0.15;


    stopMarkering();


    const wachttijd =
        (start - audioContext.currentTime) * 1000;


    melodie.forEach(
        (noot, index) => {

            speelNoot(
                noot,
                start +
                index *
                tussenruimte,
                nootDuur
            );

            markeerNoot(
                index,
                wachttijd +
                index *
                tussenruimte *
                1000
            );
        }
    );


    markeerTimers.push(
        setTimeout(
            stopMarkering,
            wachttijd +
            (melodie.length - 1) *
            tussenruimte * 1000 +
            nootDuur * 1000
        )
    );
}


/* =========================================================
   NIEUW DICTEE
   ========================================================= */

async function nieuwDictee() {

    verbergOplossing();


    if (maakDictee()) {

        await speelDictee();
    }
}


/* =========================================================
   TEMPO
   ========================================================= */

function veranderTempo(
    nieuwTempo
) {

    INSTELLINGEN.tempo =
        Number(
            nieuwTempo
        );


    document.getElementById(
        "tempoWaarde"
    ).textContent =
        nieuwTempo;
}


/* =========================================================
   OPLOSSING TONEN / VERBERGEN
   ========================================================= */

function toonOplossing() {

    if (
        melodie.length === 0
    ) {
        return;
    }


    document.getElementById(
        "oplossing"
    ).style.display =
        "block";


    document.getElementById(
        "oplossingKnop"
    ).textContent =
        "verberg oplossing";


    tekenNotenbalk();
}


function verbergOplossing() {

    document.getElementById(
        "oplossing"
    ).style.display =
        "none";


    document.getElementById(
        "oplossingKnop"
    ).textContent =
        "toon oplossing";
}


function wisselOplossing() {

    const oplossing =
        document.getElementById(
            "oplossing"
        );


    if (
        oplossing.style.display ===
        "block"
    ) {

        verbergOplossing();

    }
    else {

        toonOplossing();
    }
}


/* =========================================================
   KNOPPEN
   ========================================================= */

document.getElementById(
    "nieuwKnop"
).addEventListener(
    "click",
    nieuwDictee
);


document.getElementById(
    "speelKnop"
).addEventListener(
    "click",
    speelDictee
);


document.getElementById(
    "oplossingKnop"
).addEventListener(
    "click",
    wisselOplossing
);


document.getElementById(
    "audioResetKnop"
).addEventListener(
    "click",
    resetAudio
);


document.getElementById(
    "tempo"
).addEventListener(
    "input",
    function() {

        veranderTempo(
            this.value
        );
    }
);


/* =========================================================
   START
   ========================================================= */

maakDictee();


/* De AudioContext blijft "suspended" tot de eerste klik; samples laden kan al wel. */
if (maakAudioContext()) {
    laadPiano();
}
