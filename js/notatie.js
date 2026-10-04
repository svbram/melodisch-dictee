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

let actieveNoot = -1;


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


            ctx.fillStyle =
                i === actieveNoot
                ? "#d32f2f"
                : "black";


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


