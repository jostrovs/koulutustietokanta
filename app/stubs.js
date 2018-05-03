let koulutukset = [
    {
        id: 1,
        uid: 1,
        tilaisuus: "III-lk",
        pvm: "2018-05-01",
        kouluttaja: "K.Kouluttaja",
        alue: "Etelä",
        paikka: "Kokoustila",
        lkm: 0,
        osallistujat: [
            {
                nimi: "Matti Meikäläinen",
                vuosi: "1990",
                paikka: "Vantaa",
                postino: "01690",
                gdpr: true,
                huom: "Lupaava kaveri",
            },
            {
                nimi: "Esko Esimerkki",
                vuosi: "1980",
                paikka: "Espoo",
                postino: "02290",
                gdpr: false,
                huom: "",
            },
            {
                nimi: "Maija Uusija",
                vuosi: "1985",
                paikka: "Helsinki",
                postino: "00290",
                gdpr: true,
                huom: "Aloittelee uudelleen",
            },
        ],
        info: "Huima tilaisuus!"
    },
    {
        id: 2,
        uid: 2,
        tilaisuus: "II-lk korotus",
        pvm: "2018-05-03",
        kouluttaja: "T.Korottaja",
        alue: "Etelä",
        paikka: "Kerhohuone",
        lkm: 0,
        osallistujat: [
            {
                nimi: "Esko Esimerkki",
                vuosi: "1980",
                paikka: "Espoo",
                postino: "02290",
                gdpr: false,
                huom: "Ennätyspisteet",
            },
        ],
        info: "Korotus järjestettiin heti perään"
    },

];

let users = [
    {
        uid: "StubUserID",
        nimi: "Jori Ostrovskij",
        admin: true,
        displayName: "Jori Ostrovskij",
    }
]

module.exports = {
    koulutukset: koulutukset,
    users: users,
}