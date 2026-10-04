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


