/* Zone 1 Pub Crawl — map + pub data.
   The map is a hand-drawn schematic (Beck rules: horizontals, verticals, 45°
   diagonals) in a 1500×830 coordinate space. Only crawl stations are drawn —
   it is deliberately not a complete tube map. Ratings are indicative
   snapshots of public review scores, not live data. */

const LINE_META = {
  bakerloo:     { name: "Bakerloo",       color: "#B36305" },
  central:      { name: "Central",        color: "#E32017" },
  circle:       { name: "Circle",         color: "#FFD300", darkText: true },
  district:     { name: "District",       color: "#00782A" },
  hc:           { name: "H&C",            color: "#F3A9BB", darkText: true },
  jubilee:      { name: "Jubilee",        color: "#A0A5A9" },
  metropolitan: { name: "Metropolitan",   color: "#9B0056" },
  northern:     { name: "Northern",       color: "#000000" },
  piccadilly:   { name: "Piccadilly",     color: "#003688" },
  victoria:     { name: "Victoria",       color: "#0098D4" },
  elizabeth:    { name: "Elizabeth line", color: "#6950A1" },
  dlr:          { name: "DLR",            color: "#00A4A7" },
  wc:           { name: "W&C",            color: "#95CDBA", darkText: true },
};

/* Drawn line geometry. Multiple polylines may share one line id.
   An entry's `color` overrides the line colour (used for the Elizabeth
   line's white core, giving the classic double-stripe rail style). */
const MAP_LINES = [
  // Elizabeth line — drawn first so the tube lines cross over it.
  // True Zone 1 alignment: serves Paddington, Bond St, Tottenham Court Rd,
  // Farringdon and Liverpool St; dips under Oxford Circus and Holborn,
  // which it does not serve.
  { id: "elizabeth", width: 8, points: [
    [210,250],[400,440],[480,440],[496,456],[564,456],[580,440],[760,440],
    [776,456],[824,456],[840,440],[905,440],[985,360],[985,300],[1075,300],
    [1224,449]
  ]},
  { id: "elizabeth", color: "#ffffff", width: 3, points: [
    [210,250],[400,440],[480,440],[496,456],[564,456],[580,440],[760,440],
    [776,456],[824,456],[840,440],[905,440],[985,360],[985,300],[1075,300],
    [1224,449]
  ]},
  // Circle line — the Zone 1 "bottle" loop
  { id: "circle", width: 8, points: [
    [210,250],[265,195],[880,195],[1130,445],[1355,445],[1380,470],[1380,530],
    [1310,600],[430,600],[370,660],[210,660],[160,610],[160,300],[210,250]
  ]},
  // District — parallel to the Circle along the river, Tower Hill → South Ken
  { id: "district", width: 8, points: [
    [1310,608],[438,608],[378,668],[210,668]
  ]},
  // Central
  { id: "central", width: 8, points: [
    [160,430],[940,430],[1030,520],[1155,520],[1230,445]
  ]},
  // Piccadilly
  { id: "piccadilly", width: 8, points: [
    [210,660],[360,510],[680,510],[745,445],[800,430],[880,350],[880,195]
  ]},
  // Northern — Charing Cross branch
  { id: "northern", width: 8, points: [
    [680,160],[680,600],[795,715]
  ]},
  // Northern — Bank branch
  { id: "northern", width: 8, points: [
    [680,160],[703,183],[868,183],[880,195],[955,270],[1120,270],[1155,305],
    [1155,640],[1200,685],[1200,715]
  ]},
  // Victoria — crosses Oxford Circus on the 45° diagonal, as on the real map
  { id: "victoria", width: 8, points: [
    [430,600],[430,560],[480,510],[560,430],[640,350],[640,200],[680,160]
  ]},
  // Victoria — Euston → King's Cross corridor (parallel to Circle/Northern)
  { id: "victoria", width: 8, points: [
    [680,160],[691,171],[856,171],[880,195]
  ]},
  // Jubilee
  { id: "jubilee", width: 8, points: [
    [400,195],[400,330],[480,410],[480,510],[570,600],[580,600],
    [695,715],[1200,715]
  ]},
  // Bakerloo — Paddington → Baker Street (parallel to Circle)
  { id: "bakerloo", width: 8, points: [
    [218,258],[273,203],[394,203]
  ]},
  // Bakerloo — Baker Street → Embankment
  { id: "bakerloo", width: 8, points: [
    [406,201],[560,355],[560,510],[605,555],[670,555],[670,592]
  ]},
  // Bakerloo — Embankment → Waterloo (river crossing, parallel to Northern)
  { id: "bakerloo", width: 8, points: [
    [676,604],[787,715]
  ]},
];

/* The Thames — pale ribbon with the Vauxhall and Tower bends */
const RIVER = {
  width: 30,
  color: "#BFDFF3",
  points: [[310,795],[430,700],[490,648],[1240,648],[1320,700],[1408,770]],
  label: { x: 900, y: 653, text: "River Thames" },
};

/* Bank–Monument: the classic linked interchange */
const LINKS = [ { from: "bank", to: "monument" } ];

/* Stations.
   marker: "int" (interchange circle) or "tick" (line-coloured stub; tick = [dx,dy] direction)
   label:  anchor + offset of the station-name baseline from the station point;
           pub name renders 15px below (flip: true renders it 15px above).
   mapName / pub.mapName: shorter display name for the map; cards use the full name. */
const STATIONS = [
  { id: "paddington", name: "Paddington", x: 210, y: 250, marker: "int",
    label: { anchor: "end", dx: -16, dy: -10 },
    lines: ["bakerloo", "circle", "district", "elizabeth"],
    pub: { name: "The Victoria", rating: 4.5, drink: "Fuller's London Pride", walk: 4,
      address: "10a Strathearn Pl, W2 2NH",
      desc: "Ornate 1838 Fuller's corner house — gilt mirrors, painted panels, and a proper fire." } },

  { id: "bakerst", name: "Baker Street", x: 400, y: 195, marker: "int",
    label: { anchor: "middle", dx: 0, dy: -26 },
    lines: ["bakerloo", "circle", "hc", "jubilee", "metropolitan"],
    pub: { name: "The Barley Mow", rating: 4.4, drink: "Cask bitter of the day", walk: 5,
      address: "8 Dorset St, W1U 6QW",
      desc: "A Marylebone local since 1791, complete with tiny pawnbroker-booth snugs at the bar." } },

  { id: "euston", name: "Euston", x: 680, y: 160, marker: "int",
    label: { anchor: "middle", dx: 0, dy: -28 },
    lines: ["northern", "victoria"],
    pub: { name: "Euston Tap", rating: 4.4, drink: "Whatever rare keg is on — ask for a taster", walk: 1,
      address: "190 Euston Rd, NW1 2EF",
      desc: "A craft-beer shrine squeezed into a Victorian stone gate lodge — dozens of taps, zero frills." } },

  { id: "kingsx", name: "King's Cross St Pancras", mapName: "King's Cross", x: 880, y: 195, marker: "int",
    label: { anchor: "start", dx: 14, dy: -18 },
    lines: ["circle", "hc", "metropolitan", "northern", "piccadilly", "victoria"],
    pub: { name: "The Parcel Yard", rating: 4.3, drink: "Fuller's ESB", walk: 1,
      address: "King's Cross Station, N1C 4AH",
      desc: "Fuller's pub in the old Great Northern parcels office, up in the station roof itself." } },

  { id: "angel", name: "Angel", x: 1000, y: 270, marker: "tick", tick: [0, -1],
    label: { anchor: "middle", dx: 0, dy: -35 },
    lines: ["northern"],
    pub: { name: "The Camden Head", rating: 4.4, drink: "A well-poured Guinness", walk: 3,
      address: "2 Camden Walk, N1 8DY",
      desc: "Victorian glass palace on Camden Passage — etched mirrors outside, antiques market at the door." } },

  { id: "oldst", name: "Old Street", x: 1085, y: 270, marker: "tick", tick: [0, -1],
    label: { anchor: "start", dx: 14, dy: -24 },
    lines: ["northern"],
    pub: { name: "The Wenlock Arms", rating: 4.5, drink: "The cask mild — their calling card", walk: 9,
      address: "26 Wenlock Rd, N1 7TA",
      desc: "Beloved 1836 backstreet ale house the regulars saved from developers. Worth the walk." } },

  { id: "farringdon", name: "Farringdon", x: 985, y: 300, marker: "int",
    label: { anchor: "end", dx: -16, dy: 26 },
    lines: ["circle", "hc", "metropolitan", "elizabeth"],
    pub: { name: "The Jerusalem Tavern", rating: 4.6, drink: "St Peter's Best Bitter from the cask", walk: 3,
      address: "55 Britton St, EC1M 5UQ",
      desc: "Tiny, candle-dim Georgian shopfront pouring St Peter's Brewery ales. Get there early." } },

  { id: "barbican", name: "Barbican", x: 1055, y: 370, marker: "tick", tick: [-1, 1],
    label: { anchor: "end", dx: -44, dy: 4 },
    lines: ["circle", "hc", "metropolitan"],
    pub: { name: "Hand & Shears", rating: 4.4, drink: "Adnams Southwold Bitter", walk: 3,
      address: "1 Middle St, EC1A 7JA",
      desc: "Four tiny rooms by Smithfield, licensed since Tudor times — the cloth fair's old courthouse pub." } },

  { id: "liverpoolst", name: "Liverpool Street", x: 1230, y: 445, marker: "int",
    label: { anchor: "start", dx: 16, dy: -24 },
    lines: ["central", "circle", "hc", "metropolitan", "elizabeth"],
    pub: { name: "Dirty Dicks", rating: 4.3, drink: "Young's Ordinary", walk: 1,
      address: "202 Bishopsgate, EC2M 4NR",
      desc: "1745 tavern of beams and barrels directly opposite the station — named for a legendary hoarder." } },

  { id: "aldgate", name: "Aldgate", x: 1380, y: 500, marker: "tick", tick: [-1, 0],
    label: { anchor: "end", dx: -18, dy: 4 },
    lines: ["circle", "metropolitan"],
    pub: { name: "Hoop & Grapes", rating: 4.3, drink: "Nicholson's Pale Ale", walk: 1,
      address: "47 Aldgate High St, EC3N 1AL",
      desc: "Timber-framed survivor of the Great Fire, c. 1593 — one of the City's oldest licensed houses." } },

  { id: "towerhill", name: "Tower Hill", x: 1310, y: 600, marker: "int",
    label: { anchor: "middle", dx: 20, dy: 30 },
    lines: ["circle", "district"],
    pub: { name: "The Hung, Drawn & Quartered", mapName: "Hung Drawn & Quartered", rating: 4.3, drink: "Fuller's London Pride", walk: 3,
      address: "26-27 Great Tower St, EC3R 5AQ",
      desc: "Fuller's alehouse trading cheerfully on the Tower's grisly history. Ales are excellent; gallows optional." } },

  { id: "monument", name: "Monument", x: 1185, y: 600, marker: "int",
    label: { anchor: "start", dx: 12, dy: -18, flip: true },
    lines: ["circle", "district"],
    pub: { name: "The Lamb Tavern", rating: 4.4, drink: "Young's London Original", walk: 3,
      address: "10-12 Leadenhall Market, EC3V 1LR",
      desc: "1780 landmark under Leadenhall Market's painted ironwork — pints outside on the cobbles." } },

  { id: "bank", name: "Bank", x: 1155, y: 520, marker: "int",
    label: { anchor: "start", dx: 16, dy: 4 },
    lines: ["central", "northern", "wc", "dlr"],
    pub: { name: "The Counting House", rating: 4.3, drink: "London Pride, with one of the pies", walk: 2,
      address: "50 Cornhill, EC3V 3PD",
      desc: "A grand banking hall turned pub — dome, chandeliers, and the old counters as the bar." } },

  { id: "stpauls", name: "St Paul's", x: 1060, y: 520, marker: "tick", tick: [0, -1],
    label: { anchor: "middle", dx: 25, dy: -35 },
    lines: ["central"],
    pub: { name: "Ye Olde Watling", rating: 4.3, drink: "St Austell Proper Job", walk: 3,
      address: "29 Watling St, EC4M 9BR",
      desc: "Rebuilt 1668, reputedly with ships' timbers — and drunk in by Wren's cathedral crews." } },

  { id: "chancery", name: "Chancery Lane", x: 890, y: 430, marker: "tick", tick: [0, -1],
    label: { anchor: "middle", dx: -16, dy: -35 },
    lines: ["central"],
    pub: { name: "Ye Olde Mitre", rating: 4.6, drink: "The guest cask — the board changes weekly", walk: 4,
      address: "1 Ely Ct, EC1N 6SJ",
      desc: "A 1546 tavern hidden down Ely Court's alley — London's best game of find-the-pub." } },

  { id: "holborn", name: "Holborn", x: 800, y: 430, marker: "int",
    label: { anchor: "start", dx: 44, dy: 28 },
    lines: ["central", "piccadilly"],
    pub: { name: "Princess Louise", rating: 4.4, drink: "Sam Smith's Old Brewery Bitter (famously cheap)", walk: 2,
      address: "208 High Holborn, WC1V 7EP",
      desc: "The finest surviving Victorian gin-palace interior in London — screens, tiles, gilt and all." } },

  { id: "russellsq", name: "Russell Square", x: 845, y: 385, marker: "tick", tick: [-1, -1],
    label: { anchor: "end", dx: -20, dy: -20 },
    lines: ["piccadilly"],
    pub: { name: "The Lamb", rating: 4.5, drink: "Young's Special", walk: 5,
      address: "94 Lamb's Conduit St, WC1N 3LZ",
      desc: "1729 Young's house with rotating 'snob screens' at the bar and Bloomsbury literary ghosts." } },

  { id: "goodge", name: "Goodge Street", x: 680, y: 300, marker: "tick", tick: [1, 0],
    label: { anchor: "start", dx: 16, dy: 4 },
    lines: ["northern"],
    pub: { name: "The Fitzroy Tavern", rating: 4.4, drink: "Sam Smith's Taddy Lager", walk: 2,
      address: "16 Charlotte St, W1T 2LY",
      desc: "Fitzrovia's literary landmark — Orwell and Dylan Thomas drank here; Sam Smith's prices remain a miracle." } },

  { id: "tcr", name: "Tottenham Court Road", mapName: "Tottenham Ct Rd", x: 680, y: 430, marker: "int",
    label: { anchor: "start", dx: 12, dy: -33 },
    lines: ["central", "northern", "elizabeth"],
    pub: { name: "The Flying Horse", rating: 4.3, drink: "Cask ale of the day", walk: 1,
      address: "6 Oxford St, W1D 1AN",
      desc: "The last pub left on Oxford Street — 1790 licence, gorgeous painted ceiling at the back." } },

  { id: "oxfordcircus", name: "Oxford Circus", x: 560, y: 430, marker: "int",
    label: { anchor: "middle", dx: -30, dy: -35 },
    lines: ["bakerloo", "central", "victoria"],
    pub: { name: "The Argyll Arms", mapName: "Argyll Arms", rating: 4.4, drink: "Timothy Taylor Landlord", walk: 2,
      address: "18 Argyll St, W1F 7TP",
      desc: "1868 mahogany-and-etched-glass snugs two steps from the Circus — a Victorian miracle of survival." } },

  { id: "bondst", name: "Bond Street", x: 480, y: 430, marker: "int",
    label: { anchor: "end", dx: -14, dy: 30 },
    lines: ["central", "jubilee", "elizabeth"],
    pub: { name: "The Guinea", rating: 4.5, drink: "A pint of Young's while the grill does its work", walk: 4,
      address: "30 Bruton Pl, W1J 6NL",
      desc: "Mews-hidden Young's pub with roots claimed to 1423 and a famous grill out back." } },

  { id: "nottinghill", name: "Notting Hill Gate", x: 160, y: 430, marker: "int",
    label: { anchor: "start", dx: 12, dy: -26 },
    lines: ["central", "circle", "district"],
    pub: { name: "The Churchill Arms", rating: 4.6, drink: "London Pride with pad thai", walk: 3,
      address: "119 Kensington Church St, W8 7LN",
      desc: "The famous flower-drenched 1750 icon — Churchill memorabilia inside, a Thai kitchen out back." } },

  { id: "southken", name: "South Kensington", x: 210, y: 660, marker: "int",
    label: { anchor: "middle", dx: 0, dy: 30 },
    lines: ["circle", "district", "piccadilly"],
    pub: { name: "The Anglesea Arms", mapName: "Anglesea Arms", rating: 4.5, drink: "A crisp London-brewed pale ale", walk: 6,
      address: "15 Selwood Terrace, SW7 3QG",
      desc: "Handsome 1827 corner pub on a quiet terrace — Dickens lodged next door." } },

  { id: "knightsbridge", name: "Knightsbridge", x: 270, y: 600, marker: "tick", tick: [-1, -1],
    label: { anchor: "end", dx: -14, dy: 6 },
    lines: ["piccadilly"],
    pub: { name: "The Nag's Head", rating: 4.5, drink: "Adnams — it's all they serve, and rightly", walk: 5,
      address: "53 Kinnerton St, SW1X 8ED",
      desc: "A tiny mews time capsule where phones are banned and the bar is knee-height. Wonderful." } },

  { id: "hydepark", name: "Hyde Park Corner", x: 330, y: 540, marker: "tick", tick: [-1, -1],
    label: { anchor: "end", dx: -14, dy: 4 },
    lines: ["piccadilly"],
    pub: { name: "The Grenadier", rating: 4.5, drink: "The famous Bloody Mary", walk: 5,
      address: "18 Wilton Row, SW1X 7NR",
      desc: "1720 officers' mess in a cobbled Belgravia mews — famously haunted, famously hard to find." } },

  { id: "sloane", name: "Sloane Square", x: 330, y: 660, marker: "int",
    label: { anchor: "middle", dx: 0, dy: 30 },
    lines: ["circle", "district"],
    pub: { name: "The Antelope", rating: 4.4, drink: "Fuller's Seafarers by the fire", walk: 4,
      address: "22-24 Eaton Terrace, SW1W 8EZ",
      desc: "Panelled 1827 Belgravia local — dark wood, firelight, and Fuller's ales done properly." } },

  { id: "victoria", name: "Victoria", x: 430, y: 600, marker: "int",
    label: { anchor: "end", dx: -16, dy: 4 },
    lines: ["circle", "district", "victoria"],
    pub: { name: "The Albert", rating: 4.3, drink: "Greene King Abbot Ale", walk: 4,
      address: "52 Victoria St, SW1H 0NP",
      desc: "1862 Victorian glory standing defiantly alone among the glass towers of Victoria Street." } },

  { id: "greenpark", name: "Green Park", x: 480, y: 510, marker: "int",
    label: { anchor: "end", dx: -42, dy: 24 },
    lines: ["jubilee", "piccadilly", "victoria"],
    pub: { name: "The Red Lion", rating: 4.4, drink: "A pint of best bitter, village-local style", walk: 4,
      address: "23 Crown Passage, SW1Y 6PP",
      desc: "A 300-year-old village local hiding in Crown Passage, off Pall Mall — all brass and bonhomie." } },

  { id: "westminster", name: "Westminster", x: 580, y: 600, marker: "int",
    label: { anchor: "end", dx: -16, dy: 24 },
    lines: ["circle", "district", "jubilee"],
    pub: { name: "St Stephen's Tavern", rating: 4.3, drink: "Badger Fursty Ferret", walk: 2,
      address: "10 Bridge St, SW1A 2JR",
      desc: "Division-bell pub directly opposite Big Ben — the bell still rings MPs back to vote." } },

  { id: "embankment", name: "Embankment", x: 680, y: 600, marker: "int",
    label: { anchor: "start", dx: 12, dy: -10, flip: true },
    lines: ["bakerloo", "circle", "district", "northern"],
    pub: { name: "The Ship & Shovell", mapName: "Ship & Shovell", rating: 4.4, drink: "Badger Best Bitter", walk: 2,
      address: "1-3 Craven Passage, WC2N 5PH",
      desc: "One pub split across both sides of a Victorian alley — cross the passage, keep your pint." } },

  { id: "charingcross", name: "Charing Cross", x: 680, y: 555, marker: "int",
    label: { anchor: "end", dx: -14, dy: -10, flip: true },
    lines: ["bakerloo", "northern"],
    pub: { name: "The Harp", rating: 4.5, drink: "Harvey's Sussex Best — the house classic", walk: 2,
      address: "47 Chandos Pl, WC2N 4HS",
      desc: "Multi-award-winning ale house — a wall of pump clips, sausages on the bar, no nonsense." } },

  { id: "leicester", name: "Leicester Square", x: 680, y: 510, marker: "int",
    label: { anchor: "start", dx: 14, dy: 10 },
    lines: ["northern", "piccadilly"],
    pub: { name: "The Salisbury", rating: 4.4, drink: "Greene King IPA under the cut glass", walk: 2,
      address: "90 St Martin's Ln, WC2N 4AP",
      desc: "Glittering 1898 cut-glass and bronze Victorian palace on St Martin's Lane." } },

  { id: "coventgarden", name: "Covent Garden", x: 715, y: 475, marker: "tick", tick: [1, 1],
    label: { anchor: "start", dx: 14, dy: 12 },
    lines: ["piccadilly"],
    pub: { name: "The Lamb & Flag", rating: 4.4, drink: "Fuller's London Pride", walk: 3,
      address: "33 Rose St, WC2E 9EB",
      desc: "1772 'Bucket of Blood' down a brick alley off the Piazza — Dickens's old local." } },

  { id: "piccadillycircus", name: "Piccadilly Circus", x: 560, y: 510, marker: "int",
    label: { anchor: "start", dx: 14, dy: -12, flip: true },
    lines: ["bakerloo", "piccadilly"],
    pub: { name: "The Queens Head", rating: 4.4, drink: "The house Queens Head ale", walk: 2,
      address: "15 Denman St, W1D 7HN",
      desc: "Snug independent free house on Denman Street — a calm pint two minutes from the lights." } },

  { id: "waterloo", name: "Waterloo", x: 795, y: 715, marker: "int",
    label: { anchor: "middle", dx: 0, dy: 30 },
    lines: ["bakerloo", "jubilee", "northern", "wc"],
    pub: { name: "The Kings Arms", rating: 4.5, drink: "Whatever cask just came on — ask the bar", walk: 5,
      address: "25 Roupell St, SE1 8TB",
      desc: "Corner gem amid Roupell Street's gaslit conservation-area terraces — cask done right." } },

  { id: "londonbridge", name: "London Bridge", x: 1200, y: 715, marker: "int",
    label: { anchor: "middle", dx: 0, dy: 30 },
    lines: ["jubilee", "northern"],
    pub: { name: "The George Inn", rating: 4.4, drink: "The George Inn house ale", walk: 3,
      address: "75-77 Borough High St, SE1 1NH",
      desc: "1677 — London's last galleried coaching inn, now minded by the National Trust." } },

  { id: "blackfriars", name: "Blackfriars", x: 990, y: 600, marker: "int",
    label: { anchor: "middle", dx: 0, dy: -18, flip: true },
    lines: ["circle", "district"],
    pub: { name: "The Blackfriar", rating: 4.5, drink: "Nicholson's Pale Ale", walk: 1,
      address: "174 Queen Victoria St, EC4V 4EG",
      desc: "1905 Art Nouveau marvel on the old friary site — bronze friars watch you drink." } },
];

const MAP_BOUNDS = { x: 60, y: 90, width: 1400, height: 730 };
