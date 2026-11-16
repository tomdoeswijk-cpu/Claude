'use strict';
/* Lesinhoud: alfabet, getallen en hulpfuncties. Woordenschat staat in data-a1.js en data-a2.js. */

// ---------- Alfabet ----------
// [hoofdletter+kleine letter, kleine letter, naam, klank, uitleg, voorbeeldwoord, betekenis]
const ALPHA = [
  ['Α α', 'α', 'álfa', 'a', "als in 'pad'", 'αλάτι', 'zout'],
  ['Β β', 'β', 'víta', 'v', "als in 'vis' (dus geen b)", 'βιβλίο', 'boek'],
  ['Γ γ', 'γ', 'gháma', 'zachte g', "zachte g; vóór een e- of i-klank als 'j'", 'γάλα', 'melk'],
  ['Δ δ', 'δ', 'dhélta', 'dh', "Engelse th in 'this'", 'δέκα', 'tien'],
  ['Ε ε', 'ε', 'épsilon', 'e', "als in 'pet'", 'ένα', 'één'],
  ['Ζ ζ', 'ζ', 'zíta', 'z', "als in 'zon'", 'ζώο', 'dier'],
  ['Η η', 'η', 'íta', 'i (ie)', "als in 'niet' (dus geen h)", 'ημέρα', 'dag'],
  ['Θ θ', 'θ', 'thíta', 'th', "Engelse th in 'think'", 'θάλασσα', 'zee'],
  ['Ι ι', 'ι', 'jóta', 'i (ie)', "als in 'niet'", 'ιδέα', 'idee'],
  ['Κ κ', 'κ', 'kápa', 'k', "als in 'kat'", 'καλός', 'goed'],
  ['Λ λ', 'λ', 'lámdha', 'l', "als in 'lamp'", 'λεμόνι', 'citroen'],
  ['Μ μ', 'μ', 'mi', 'm', "als in 'man'", 'μαμά', 'mama'],
  ['Ν ν', 'ν', 'ni', 'n', "als in 'nee' (de kleine letter lijkt op een v)", 'νερό', 'water'],
  ['Ξ ξ', 'ξ', 'ksi', 'ks', "als de x in 'taxi'", 'ξένος', 'vreemdeling'],
  ['Ο ο', 'ο', 'ómikron', 'o', "als in 'pot'", 'όχι', 'nee'],
  ['Π π', 'π', 'pi', 'p', "als in 'pan'", 'πόρτα', 'deur'],
  ['Ρ ρ', 'ρ', 'ro', 'r', "rollende r (dus geen p)", 'ρύζι', 'rijst'],
  ['Σ σ ς', 'σ', 'síghma', 's', "als in 'sok'; aan het woordeinde schrijf je ς", 'σαλάτα', 'salade'],
  ['Τ τ', 'τ', 'taf', 't', "als in 'tas'", 'τρία', 'drie'],
  ['Υ υ', 'υ', 'ípsilon', 'i (ie)', "als in 'niet' (dus geen u of y)", 'ύπνος', 'slaap'],
  ['Φ φ', 'φ', 'fi', 'f', "als in 'fiets'", 'φίλος', 'vriend'],
  ['Χ χ', 'χ', 'chi', 'ch', "als in 'lachen' (dus geen x)", 'χέρι', 'hand'],
  ['Ψ ψ', 'ψ', 'psi', 'ps', "als in 'psycholoog'", 'ψωμί', 'brood'],
  ['Ω ω', 'ω', 'omégha', 'o', "als in 'pot', zelfde klank als ο", 'ώρα', 'uur'],
  // lettercombinaties
  ['ου', 'ου', 'combinatie', 'oe', "als in 'boek'", 'ούζο', 'ouzo'],
  ['αι', 'αι', 'combinatie', 'e', "als in 'pet', zelfde klank als ε", 'και', 'en'],
  ['ει', 'ει', 'combinatie', 'i (ie)', "als in 'niet'", 'είμαι', 'ik ben'],
  ['οι', 'οι', 'combinatie', 'i (ie)', "als in 'niet'", 'οικογένεια', 'gezin'],
  ['αυ', 'αυ', 'combinatie', 'av / af', "'av', of 'af' vóór een scherpe medeklinker", 'αύριο', 'morgen'],
  ['ευ', 'ευ', 'combinatie', 'ev / ef', "'ev', of 'ef' vóór een scherpe medeklinker", 'ευχαριστώ', 'dank je'],
  ['μπ', 'μπ', 'combinatie', 'b', "als in 'bal'", 'μπανάνα', 'banaan'],
  ['ντ', 'ντ', 'combinatie', 'd', "als in 'dak'; midden in een woord vaak 'nd'", 'ντομάτα', 'tomaat'],
  ['γκ', 'γκ', 'combinatie', 'g (Engels)', "Engelse g in 'go'", 'γκρι', 'grijs'],
  ['τσ', 'τσ', 'combinatie', 'ts', "als in 'tsaar'", 'τσάι', 'thee'],
  ['τζ', 'τζ', 'combinatie', 'dz', "als in 'tzatziki'", 'τζατζίκι', 'tzatziki'],
];

const ALPHA_LESSONS = [
  { title: 'Bekende letters', sub: 'Α Ε Ο Ι Κ Μ Τ Ν', letters: ['α', 'ε', 'ο', 'ι', 'κ', 'μ', 'τ', 'ν'],
    tip: 'Deze letters lijken op de onze en klinken bijna hetzelfde. Let alleen op de kleine ν: die lijkt op een v, maar is een n. Het accentje (ά) geeft aan waar de klemtoon ligt.',
    read: ['μαμά', 'ένα', 'κάτι', 'νέο', 'τότε', 'κακό', 'μόνο', 'κανένα'] },
  { title: 'Nieuwe vormen', sub: 'Π Λ Σ Ρ Δ Γ', letters: ['π', 'λ', 'σ', 'ρ', 'δ', 'γ'],
    tip: 'Pas op voor de Ρ: die ziet eruit als een p maar is een r. De s schrijf je aan het einde van een woord als ς.',
    read: ['σαλάτα', 'πατάτα', 'δέκα', 'γάλα', 'πόρτα', 'καλός', 'μικρός', 'λεμόνι', 'πόδι', 'δρόμος', 'τρία'] },
  { title: 'Valse vrienden', sub: 'Β Η Υ Ω Ζ', letters: ['β', 'η', 'υ', 'ω', 'ζ'],
    tip: 'Het Grieks heeft drie losse letters voor de ie-klank (η, ι, υ) en twee voor de o (ο, ω). Dat maakt lezen makkelijk en spellen lastig. De Β is altijd een v.',
    read: ['βιβλίο', 'ώρα', 'ζώο', 'νησί', 'μέλι', 'ύπνος', 'ζέστη', 'ημέρα', 'δώρο', 'βράδυ'] },
  { title: 'Typisch Grieks', sub: 'Θ Φ Χ Ψ Ξ', letters: ['θ', 'φ', 'χ', 'ψ', 'ξ'],
    tip: 'Deze letters ken je misschien uit de wiskunde. De Χ is geen x maar de ch van lachen; de x-klank schrijf je met Ξ.',
    read: ['θέλω', 'φίλος', 'χαρά', 'ψωμί', 'ξένος', 'θάλασσα', 'φως', 'χέρι', 'ψάρι', 'έξι'] },
  { title: 'Klinkercombinaties', sub: 'ου αι ει οι αυ ευ', letters: ['ου', 'αι', 'ει', 'οι', 'αυ', 'ευ'],
    tip: 'Twee klinkers vormen samen vaak één klank. Staat het accent op de eerste klinker (άι) of staan er puntjes op de tweede (αϊ), dan spreek je ze los uit.',
    read: ['ούζο', 'μουσική', 'και', 'ναι', 'παιδί', 'είμαι', 'εκεί', 'αυτό', 'ευχαριστώ', 'αύριο'] },
  { title: 'Medeklinkercombinaties', sub: 'μπ ντ γκ τσ τζ', letters: ['μπ', 'ντ', 'γκ', 'τσ', 'τζ'],
    tip: 'Het Grieks heeft geen losse letter voor b, d en de harde g. Die klanken schrijf je met twee letters: μπ, ντ en γκ.',
    read: ['μπανάνα', 'μπίρα', 'ντομάτα', 'πέντε', 'γκρι', 'τσάι', 'τζατζίκι', 'μπαμπάς'],
    cognates: [['ταξί', 'taxi'], ['τηλέφωνο', 'telefoon'], ['σοκολάτα', 'chocolade'], ['θέατρο', 'theater'], ['φωτογραφία', 'foto'], ['μουσική', 'muziek'], ['πρόβλημα', 'probleem'], ['ιδέα', 'idee'], ['πιάνο', 'piano'], ['κιθάρα', 'gitaar'], ['δημοκρατία', 'democratie'], ['φιλοσοφία', 'filosofie']] },
];

// ---------- Getallen ----------
const ONES = ['μηδέν', 'ένα', 'δύο', 'τρία', 'τέσσερα', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα', 'δέκα', 'έντεκα', 'δώδεκα', 'δεκατρία', 'δεκατέσσερα', 'δεκαπέντε', 'δεκαέξι', 'δεκαεπτά', 'δεκαοκτώ', 'δεκαεννέα'];
const TENS = { 2: 'είκοσι', 3: 'τριάντα', 4: 'σαράντα', 5: 'πενήντα', 6: 'εξήντα', 7: 'εβδομήντα', 8: 'ογδόντα', 9: 'ενενήντα' };
const HUND = { 1: 'εκατό', 2: 'διακόσια', 3: 'τριακόσια', 4: 'τετρακόσια', 5: 'πεντακόσια', 6: 'εξακόσια', 7: 'επτακόσια', 8: 'οκτακόσια', 9: 'εννιακόσια' };

/** Zet een getal (0-9999) om naar Griekse telwoorden. */
function elNum(n) {
  if (n < 20) return ONES[n];
  if (n < 100) { const r = n % 10; return TENS[Math.floor(n / 10)] + (r ? ' ' + ONES[r] : ''); }
  if (n < 1000) {
    const hh = Math.floor(n / 100), r = n % 100;
    if (!r) return HUND[hh];
    return (hh === 1 ? 'εκατόν' : HUND[hh]) + ' ' + elNum(r);
  }
  const k = Math.floor(n / 1000), r = n % 1000;
  const head = k === 1 ? 'χίλια' : (k === 3 ? 'τρεις' : k === 4 ? 'τέσσερις' : ONES[k]) + ' χιλιάδες';
  return r ? head + ' ' + elNum(r) : head;
}

const NUM_LESSONS = [
  { title: 'Getallen 0-10', nums: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], range: null,
    tip: 'Dit zijn de telvormen. Een, drie en vier passen zich in een zin aan het geslacht aan (ένας, μία, ένα), maar met de telvorm word je altijd begrepen.' },
  { title: 'Getallen 11-20', nums: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], range: [0, 20],
    tip: 'Vanaf dertien is het gewoon δέκα (tien) plus het getal, aan elkaar geschreven: δεκατρία, δεκατέσσερα.' },
  { title: 'Tientallen tot 100', nums: [30, 40, 50, 60, 70, 80, 90, 100], range: [21, 99],
    tip: 'Tiental eerst, dan de eenheid, zoals in het Engels: σαράντα επτά is veertig-zeven, dus 47.' },
  { title: 'Honderden en duizend', nums: [200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000], range: [101, 2999],
    tip: 'Εκατό wordt εκατόν zodra er iets achter komt: εκατόν δέκα is 110. Duizend is χίλια, daarna tel je χιλιάδες: δύο χιλιάδες.' },
];

// ---------- Woordenschat ----------
const UNITS = [];
function parseLines(txt) {
  return txt.trim().split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const i = l.indexOf(' | ');
    return { el: l.slice(0, i).trim(), nl: l.slice(i + 3).trim() };
  });
}
/** Voegt een thema toe: niveau, titel, uitleg, woorden en voorbeeldzinnen (elk 'grieks | nederlands' per regel). */
function U(level, title, tip, words, sents) {
  UNITS.push({ level, title, tip, words: parseLines(words), sents: parseLines(sents) });
}
