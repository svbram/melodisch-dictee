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


    if (!await hervatAudioContext()) {
        return false;
    }


    const geladen =
        await laadPiano();


    if (!geladen) {
        return false;
    }


    return await hervatAudioContext();
}


async function hervatAudioContext() {

    if (
        audioContext.state !== "running"
    ) {

        try {
            await audioContext.resume();
        }
        catch (fout) {
            console.error(fout);
        }
    }


    return audioContext.state === "running";
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

