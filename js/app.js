
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


/* =========================================================
   INTERVALLEN
   ========================================================= */

const ALLE_INTERVALLEN = {

    kleineSecunde: {
        afstand: 1,
        checkbox: "intervalKleineSecunde"
    },

    groteSecunde: {
        afstand: 2,
        checkbox: "intervalGroteSecunde"
    },

    kwart: {
        afstand: 5,
        checkbox: "intervalKwart"
    },

    kwint: {
        afstand: 7,
        checkbox: "intervalKwint"
    },

    octaaf: {
        afstand: 12,
        checkbox: "intervalOctaaf"
    }
};


let melodie = [];


/* =========================================================
   PIANOSAMPLES
   ========================================================= */

const SAMPLE_BASE_URL =
    "https://tonejs.github.io/audio/salamander/";


const PIANO_SAMPLES = [

    { midi: 48, bestand: "C3.mp3"  },
    { midi: 51, bestand: "Ds3.mp3" },
    { midi: 54, bestand: "Fs3.mp3" },
    { midi: 57, bestand: "A3.mp3"  },

    { midi: 60, bestand: "C4.mp3"  },
    { midi: 63, bestand: "Ds4.mp3" },
    { midi: 66, bestand: "Fs4.mp3" },
    { midi: 69, bestand: "A4.mp3"  },

    { midi: 72, bestand: "C5.mp3"  },
    { midi: 75, bestand: "Ds5.mp3" },
    { midi: 78, bestand: "Fs5.mp3" },
    { midi: 81, bestand: "A5.mp3"  },

    { midi: 84, bestand: "C6.mp3"  },
    { midi: 87, bestand: "Ds6.mp3" },
    { midi: 90, bestand: "Fs6.mp3" },
    { midi: 93, bestand: "A6.mp3"  },

    { midi: 96, bestand: "C7.mp3"  }

];


let audioContext = null;

let masterOutput = null;

let pianoBuffers = new Map();

let pianoGeladen = false;

let pianoWordtGeladen = false;


/* =========================================================
   AUDIOCONTEXT
   ========================================================= */

function maakAudioContext() {

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContextClass) {

        document.getElementById("melding").textContent =
            "deze browser ondersteunt Web Audio niet.";

        return false;
    }


    audioContext =
        new AudioContextClass();


    masterOutput =
        audioContext.createGain();


    masterOutput.gain.value =
        0.85;


    masterOutput.connect(
        audioContext.destination
    );


    return true;
}


/* =========================================================
   SAMPLE LADEN
   ========================================================= */

async function laadSample(sample) {

    const url =
        SAMPLE_BASE_URL +
        sample.bestand;


    const antwoord =
        await fetch(url);


    if (!antwoord.ok) {

        throw new Error(
            "kon " +
            sample.bestand +
            " niet laden."
        );
    }


    const data =
        await antwoord.arrayBuffer();


    const buffer =
        await audioContext.decodeAudioData(
            data
        );


    pianoBuffers.set(
        sample.midi,
        buffer
    );
}


/* =========================================================
   PIANO LADEN
   ========================================================= */

async function laadPiano() {

    if (pianoGeladen) {
        return true;
    }


    if (pianoWordtGeladen) {

        while (pianoWordtGeladen) {

            await new Promise(
                resolve =>
                    setTimeout(resolve, 100)
            );
        }


        return pianoGeladen;
    }


    pianoWordtGeladen = true;


    const status =
        document.getElementById(
            "audioStatus"
        );


    status.textContent =
        "piano wordt geladen…";


    try {

        await Promise.all(

            PIANO_SAMPLES.map(
                sample =>
                    laadSample(sample)
            )

        );


        pianoGeladen = true;

        pianoWordtGeladen = false;


        status.textContent =
            "piano klaar";


        return true;

    }
    catch (fout) {

        console.error(fout);


        pianoWordtGeladen = false;


        status.textContent =
            "piano kon niet worden geladen";


        document.getElementById(
            "melding"
        ).textContent =
            "de pianoklank kon niet worden geladen. controleer de internetverbinding.";


        return false;
    }
}


/* =========================================================
   AUDIO KLAARMAKEN
   ========================================================= */

async function zorgVoorAudio() {

    if (
        !audioContext ||
        audioContext.state === "closed"
    ) {

        if (!maakAudioContext()) {
            return false;
        }


        pianoBuffers.clear();

        pianoGeladen = false;
    }


    if (
        audioContext.state === "suspended"
    ) {

        try {

            await audioContext.resume();

        }
        catch (fout) {

            console.error(fout);
        }
    }


    if (
        audioContext.state !== "running"
    ) {

        return false;
    }


    return await laadPiano();
}


/* =========================================================
   DICHTSTBIJZIJNDE SAMPLE
   ========================================================= */

function vindDichtsteSample(midi) {

    let beste =
        PIANO_SAMPLES[0];


    let kleinsteAfstand =
        Math.abs(
            midi - beste.midi
        );


    for (
        const sample
        of PIANO_SAMPLES
    ) {

        const afstand =
            Math.abs(
                midi - sample.midi
            );


        if (
            afstand <
            kleinsteAfstand
        ) {

            beste =
                sample;


            kleinsteAfstand =
                afstand;
        }
    }


    return beste;
}


/* =========================================================
   PIANONOOT AFSPELEN
   ========================================================= */

function speelNoot(
    midi,
    startTijd,
    duur
) {

    const sample =
        vindDichtsteSample(
            midi
        );


    const buffer =
        pianoBuffers.get(
            sample.midi
        );


    if (!buffer) {
        return;
    }


    const bron =
        audioContext.createBufferSource();


    bron.buffer =
        buffer;


    const verschil =
        midi -
        sample.midi;


    bron.playbackRate.value =
        Math.pow(
            2,
            verschil / 12
        );


    const gain =
        audioContext.createGain();


    gain.gain.setValueAtTime(
        0.9,
        startTijd
    );


    const fadeStart =
        Math.max(
            startTijd + 0.05,
            startTijd + duur - 0.08
        );


    gain.gain.setValueAtTime(
        0.9,
        fadeStart
    );


    gain.gain.linearRampToValueAtTime(
        0.0001,
        startTijd + duur
    );


    bron.connect(
        gain
    );


    gain.connect(
        masterOutput
    );


    bron.start(
        startTijd
    );


    bron.stop(
        startTijd + duur + 0.02
    );


    bron.onended =
        function() {

            try {

                bron.disconnect();

                gain.disconnect();

            }
            catch (fout) {
            }
        };
}


/* =========================================================
   AUDIO RESET
   ========================================================= */

async function resetAudio() {

    document.getElementById(
        "audioStatus"
    ).textContent =
        "audio wordt opnieuw gestart…";


    pianoGeladen = false;

    pianoWordtGeladen = false;

    pianoBuffers.clear();


    if (masterOutput) {

        try {
            masterOutput.disconnect();
        }
        catch (fout) {
        }
    }


    if (
        audioContext &&
        audioContext.state !== "closed"
    ) {

        try {
            await audioContext.close();
        }
        catch (fout) {
        }
    }


    audioContext = null;

    masterOutput = null;


    maakAudioContext();


    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {

        await audioContext.resume();
    }


    const gelukt =
        await laadPiano();


    if (gelukt) {

        document.getElementById(
            "melding"
        ).textContent =
            "";
    }
}


/* =========================================================
   GESELECTEERDE INTERVALLEN
   ========================================================= */

function geselecteerdeIntervallen() {

    const resultaat = {};


    for (
        const [naam, gegevens]
        of Object.entries(
            ALLE_INTERVALLEN
        )
    ) {

        const checkbox =
            document.getElementById(
                gegevens.checkbox
            );


        if (checkbox.checked) {

            resultaat[naam] =
                gegevens.afstand;
        }
    }


    return resultaat;
}


/* =========================================================
   ARRAY SCHUDDEN
   ========================================================= */

function schudArray(array) {

    const kopie =
        [...array];


    for (
        let i = kopie.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            kopie[i],
            kopie[j]
        ]
        =
        [
            kopie[j],
            kopie[i]
        ];
    }


    return kopie;
}


/* =========================================================
   MELODIE GENEREREN
   ========================================================= */

function bouwMelodie(
    noten,
    intervallen,
    vorigType,
    aantalZelfde
) {

    if (
        noten.length ===
        INSTELLINGEN.aantalNoten
    ) {

        return [...noten];
    }


    const huidigeNoot =
        noten[
            noten.length - 1
        ];


    const aantalIntervalTypes =
        Object.keys(
            intervallen
        ).length;


    const richting =
        document.getElementById(
            "richting"
        ).value;


    let mogelijkheden = [];


    for (
        const [type, afstand]
        of Object.entries(
            intervallen
        )
    ) {

        if (
            aantalIntervalTypes > 1 &&
            type === vorigType &&
            aantalZelfde >=
                INSTELLINGEN.maxZelfdeInterval
        ) {

            continue;
        }


        if (
            richting === "stijgend" ||
            richting === "beide"
        ) {

            const omhoog =
                huidigeNoot +
                afstand;


            if (
                omhoog <=
                INSTELLINGEN.hoogsteNoot
            ) {

                mogelijkheden.push({
                    noot: omhoog,
                    type: type
                });
            }
        }


        if (
            richting === "dalend" ||
            richting === "beide"
        ) {

            const omlaag =
                huidigeNoot -
                afstand;


            if (
                omlaag >=
                INSTELLINGEN.laagsteNoot
            ) {

                mogelijkheden.push({
                    noot: omlaag,
                    type: type
                });
            }
        }
    }


    mogelijkheden =
        schudArray(
            mogelijkheden
        );


    for (
        const keuze
        of mogelijkheden
    ) {

        const nieuwAantalZelfde =

            keuze.type === vorigType

            ? aantalZelfde + 1

            : 1;


        noten.push(
            keuze.noot
        );


        const resultaat =
            bouwMelodie(
                noten,
                intervallen,
                keuze.type,
                nieuwAantalZelfde
            );


        if (resultaat) {

            return resultaat;
        }


        noten.pop();
    }


    return null;
}


/* =========================================================
   DICTEE MAKEN
   ========================================================= */

function maakDictee() {

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
            "audio kon niet worden gestart. probeer reset audio.";


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


    melodie.forEach(
        (noot, index) => {

            speelNoot(
                noot,
                start +
                index *
                tussenruimte,
                nootDuur
            );
        }
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
   NOTATIE
   ========================================================= */

const NOOTNAMEN = [
    "C",
    "C♯",
    "D",
    "E♭",
    "E",
    "F",
    "F♯",
    "G",
    "A♭",
    "A",
    "B♭",
    "B"
];


function midiNaarNaam(midi) {

    return NOOTNAMEN[
        midi % 12
    ];
}


function letterVoorMidi(midi) {

    const mapping = {
        0: "C",
        1: "C",
        2: "D",
        3: "E",
        4: "E",
        5: "F",
        6: "F",
        7: "G",
        8: "A",
        9: "A",
        10: "B",
        11: "B"
    };


    return mapping[
        midi % 12
    ];
}


function octaafVoorMidi(midi) {

    return (
        Math.floor(
            midi / 12
        ) - 1
    );
}


function diatonischeIndex(midi) {

    const letter =
        letterVoorMidi(midi);


    const octaaf =
        octaafVoorMidi(midi);


    const letterIndex = {
        C: 0,
        D: 1,
        E: 2,
        F: 3,
        G: 4,
        A: 5,
        B: 6
    };


    return (
        octaaf * 7 +
        letterIndex[letter]
    );
}


/* =========================================================
   NOTENBALK
   ========================================================= */

function tekenNotenbalk() {

    const canvas =
        document.getElementById(
            "notenbalk"
        );


    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const links = 45;
    const rechts = 730;

    const ondersteLijn = 190;
    const lijnAfstand = 16;


    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.lineWidth = 1.5;


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const y =
            ondersteLijn -
            i * lijnAfstand;


        ctx.beginPath();

        ctx.moveTo(
            links,
            y
        );

        ctx.lineTo(
            rechts,
            y
        );

        ctx.stroke();
    }


    ctx.font =
        "70px serif";


    ctx.fillText(
        "𝄞",
        48,
        190
    );


    const indexE4 =
        4 * 7 + 2;


    const halveAfstand =
        lijnAfstand / 2;


    const beginX = 145;

    const beschikbareBreedte =
        555;


    const stapX =

        melodie.length > 1

        ? beschikbareBreedte /
          (melodie.length - 1)

        : 0;


    melodie.forEach(
        (midi, i) => {

            const x =
                beginX +
                i * stapX;


            const index =
                diatonischeIndex(
                    midi
                );


            const verschil =
                index -
                indexE4;


            const y =
                ondersteLijn -
                verschil *
                halveAfstand;


            /* hulplijnen onder */

            if (
                y >
                ondersteLijn
            ) {

                for (
                    let ly =
                        ondersteLijn +
                        lijnAfstand;

                    ly <= y + 2;

                    ly +=
                        lijnAfstand
                ) {

                    ctx.beginPath();

                    ctx.moveTo(
                        x - 13,
                        ly
                    );

                    ctx.lineTo(
                        x + 13,
                        ly
                    );

                    ctx.stroke();
                }
            }


            /* hulplijnen boven */

            const bovensteLijn =
                ondersteLijn -
                4 *
                lijnAfstand;


            if (
                y <
                bovensteLijn
            ) {

                for (
                    let ly =
                        bovensteLijn -
                        lijnAfstand;

                    ly >= y - 2;

                    ly -=
                        lijnAfstand
                ) {

                    ctx.beginPath();

                    ctx.moveTo(
                        x - 13,
                        ly
                    );

                    ctx.lineTo(
                        x + 13,
                        ly
                    );

                    ctx.stroke();
                }
            }


            /* nootkop */

            ctx.save();

            ctx.translate(
                x,
                y
            );

            ctx.rotate(
                -0.25
            );


            ctx.beginPath();

            ctx.ellipse(
                0,
                0,
                9,
                6,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();


            /* kruis of mol */

            const naam =
                midiNaarNaam(
                    midi
                );


            if (
                naam.includes("♯") ||
                naam.includes("♭")
            ) {

                const teken =

                    naam.includes("♯")

                    ? "♯"

                    : "♭";


                ctx.font =
                    "22px serif";

                ctx.textAlign =
                    "center";


                ctx.fillText(
                    teken,
                    x - 24,
                    y + 7
                );
            }


            /* nootnaam */

            ctx.font =
                "bold 16px Arial";

            ctx.textAlign =
                "center";


            ctx.fillText(
                naam,
                x,
                315
            );
        }
    );


    ctx.textAlign =
        "start";
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

