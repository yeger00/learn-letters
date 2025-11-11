// Hebrew letters with their possible transcriptions
// Including common transcription errors and variations

export interface HebrewLetter {
    letter: string;
    name: string;
    acceptableTranscriptions: string[];
}

export const HEBREW_LETTERS: HebrewLetter[] = [
    {
        letter: "א",
        name: "Alef",
        acceptableTranscriptions: ["א", "אלף", "אלפ", "אלפא", "אלפה"]
    },
    {
        letter: "ב",
        name: "Bet",
        acceptableTranscriptions: ["ב", "בית", "בת", "ביית", "ביית"]
    },
    {
        letter: "ג",
        name: "Gimel",
        acceptableTranscriptions: ["ג", "גימל", "גימל", "ג'ימל", "גמל"]
    },
    {
        letter: "ד",
        name: "Dalet",
        acceptableTranscriptions: ["ד", "דלת", "דלית", "דאלת", "דלד"]
    },
    {
        letter: "ה",
        name: "He",
        acceptableTranscriptions: ["ה", "הא", "היי", "הי", "הה"]
    },
    {
        letter: "ו",
        name: "Vav",
        acceptableTranscriptions: ["ו", "וו", "וב", "ואו", "ווו"]
    },
    {
        letter: "ז",
        name: "Zayin",
        acceptableTranscriptions: ["ז", "זיין", "זין", "זיין", "זאין"]
    },
    {
        letter: "ח",
        name: "Het",
        acceptableTranscriptions: ["ח", "חית", "חת", "חייט", "חט", "חטא"]
    },
    {
        letter: "ט",
        name: "Tet",
        acceptableTranscriptions: ["ט", "טית", "טת", "טיית", "טט"]
    },
    {
        letter: "י",
        name: "Yod",
        acceptableTranscriptions: ["י", "יוד", "יד", "יוד", "יי"]
    },
    {
        letter: "כ",
        name: "Kaf",
        acceptableTranscriptions: ["כ", "כף", "כף", "כאף", "כפ", "חף"]
    },
    {
        letter: "ל",
        name: "Lamed",
        acceptableTranscriptions: ["ל", "למד", "לאמד", "למד", "לד"]
    },
    {
        letter: "מ",
        name: "Mem",
        acceptableTranscriptions: ["מ", "מם", "מים", "מימ", "מם"]
    },
    {
        letter: "ן",
        name: "Nun Sofit",
        acceptableTranscriptions: ["ן", "נון", "נון סופית", "נו", "נון"]
    },
    {
        letter: "נ",
        name: "Nun",
        acceptableTranscriptions: ["נ", "נון", "נו", "ננ", "נון"]
    },
    {
        letter: "ס",
        name: "Samekh",
        acceptableTranscriptions: ["ס", "סמך", "סאמך", "סמך", "סמכ"]
    },
    {
        letter: "ע",
        name: "Ayin",
        acceptableTranscriptions: ["ע", "עין", "עיין", "איין", "עין"]
    },
    {
        letter: "פ",
        name: "Pe",
        acceptableTranscriptions: ["פ", "פא", "פה", "פי", "פא"]
    },
    {
        letter: "צ",
        name: "Tsadi",
        acceptableTranscriptions: ["צ", "צדי", "צדיק", "צדי", "צאדי"]
    },
    {
        letter: "ק",
        name: "Qof",
        acceptableTranscriptions: ["ק", "קוף", "קוף", "קו", "קופ"]
    },
    {
        letter: "ר",
        name: "Resh",
        acceptableTranscriptions: ["ר", "ריש", "רש", "ריש", "ריי"]
    },
    {
        letter: "ש",
        name: "Shin",
        acceptableTranscriptions: ["ש", "שין", "שיין", "שין", "שי"]
    },
    {
        letter: "ת",
        name: "Tav",
        acceptableTranscriptions: ["ת", "תו", "תיו", "תב", "תאו"]
    }
];

// Get a random Hebrew letter
export function getRandomLetter(): HebrewLetter {
    const randomIndex = Math.floor(Math.random() * HEBREW_LETTERS.length);
    return HEBREW_LETTERS[randomIndex];
}

// Strip non-Hebrew letters from text
export function stripNonHebrewLetters(text: string): string {
    return text.replace(/[^א-ת]/g, '');
}

// Check if transcription matches the letter
export function checkAnswer(letter: HebrewLetter, transcription: string): boolean {
    const cleanTranscription = stripNonHebrewLetters(transcription.trim());

    return letter.acceptableTranscriptions.some(acceptable => {
        const cleanAcceptable = stripNonHebrewLetters(acceptable);
        return cleanTranscription === cleanAcceptable;
    });
}
