
/* =========================================================
   ALGEMENE INSTELLINGEN
   ========================================================= */

const INSTELLINGEN = {

    aantalNoten: 8,

    tempo: 40,

    maxZelfdeInterval: 2,

    laagsteNoot: 48,

    hoogsteNoot: 96,

    startNoot: 60
};

document.getElementById(
    "aantalNoten"
).value = INSTELLINGEN.aantalNoten;

document.getElementById(
    "tempo"
).value = INSTELLINGEN.tempo;

document.getElementById(
    "tempoWaarde"
).textContent = INSTELLINGEN.tempo;


/* =========================================================
   INSTELLINGEN ONTHOUDEN
   ========================================================= */

const OPSLAG_SLEUTEL = "melodischDictee.instellingen";

const BEWAARDE_VELDEN = [
    "intervalKleineSecunde",
    "intervalGroteSecunde",
    "intervalKwart",
    "intervalKwint",
    "intervalOctaaf",
    "aantalNoten",
    "richting",
    "beginnoot",
    "tempo"
];


function bewaarInstellingen() {

    const waarden = {};

    BEWAARDE_VELDEN.forEach(
        id => {

            const veld =
                document.getElementById(id);

            waarden[id] =
                veld.type === "checkbox"
                    ? veld.checked
                    : veld.value;
        }
    );

    try {
        localStorage.setItem(
            OPSLAG_SLEUTEL,
            JSON.stringify(waarden)
        );
    }
    catch (fout) {
    }
}


function herstelInstellingen() {

    let waarden = null;

    try {
        waarden = JSON.parse(
            localStorage.getItem(OPSLAG_SLEUTEL)
        );
    }
    catch (fout) {
    }

    if (!waarden) {
        return;
    }

    BEWAARDE_VELDEN.forEach(
        id => {

            if (!(id in waarden)) {
                return;
            }

            const veld =
                document.getElementById(id);

            if (veld.type === "checkbox") {
                veld.checked = Boolean(waarden[id]);
            }
            else {
                veld.value = waarden[id];
            }
        }
    );

    INSTELLINGEN.tempo =
        Number(
            document.getElementById("tempo").value
        );

    document.getElementById(
        "tempoWaarde"
    ).textContent = INSTELLINGEN.tempo;
}


herstelInstellingen();

document.addEventListener(
    "input",
    bewaarInstellingen
);

document.addEventListener(
    "change",
    bewaarInstellingen
);


