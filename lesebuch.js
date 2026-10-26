// Lesebuch: der Stoff aus Buch und Arbeitsheft in kurzen, gut lesbaren Kapiteln
// t = Thema, e = Emoji, s = Seiten zum Nachschlagen
// Abschnitt: h = Überschrift, p = Text(e), steps = nummerierte Schritte, l = Liste, tab = Tabelle {k:[Kopf], z:[Zeilen]}, m = Merke-Kasten, tipp = Tipp-Kasten
var LESEBUCH = [
  // ================= VERKEHR =================
  {id:'v-hindernis', t:'verkehr', e:'🚧', titel:'Hindernisse und Engpässe', kurz:'So fährst du an einer Baustelle vorbei', s:['b58','b59','ah19'], teile:[
    {h:'Vorbeifahren in 5 Schritten', p:'Eine Baustelle oder ein parkendes Auto versperrt den Weg. Du musst auf die linke Spur wechseln. Das geht nur mit einem festen Ablauf:',
     steps:['<b>Umsehen</b> – Schulterblick! Kommt ein Fahrzeug von hinten?','<b>Handzeichen nach links</b> – so zeigst du, dass du die Spur wechselst.','<b>Links einordnen</b> – und dabei den <b>Gegenverkehr</b> beachten.','<b>Vorbeifahren</b> – mit etwa <b>1 Meter Sicherheitsabstand</b>, wenn von vorn nichts kommt.','<b>Umsehen, Handzeichen nach rechts</b> und wieder rechts einordnen.'],
     m:'Umsehen – Zeichen – Einordnen – Vorbei – Zeichen rechts.'},
    {h:'Die drei Schilder an engen Stellen', p:'Drei Verkehrszeichen regeln, wer an einer Engstelle zuerst fahren darf:',
     tab:{k:['Schild','Bedeutung','Was tust du?'], z:[
       ['🟦 blau, roter Pfeil nach unten, weißer nach oben','Vorrang vor dem Gegenverkehr','Du darfst zuerst fahren.'],
       ['🔴 rund, roter Rand, roter und schwarzer Pfeil','Dem Gegenverkehr Vorrang gewähren!','Du musst warten.'],
       ['⚠️ Dreieck mit sich verengenden Linien','Einseitig verengte Fahrbahn','Warnung: Die Straße wird enger.']]},
     tipp:'Auch wenn du Vorrang hast, fahre aufmerksam. Ein Fahrzeug könnte dich zu spät sehen.'}
  ]},
  {id:'v-links1', t:'verkehr', e:'↰', titel:'Links abbiegen: Einmündung', kurz:'Abbiegen ohne Verkehrszeichen', s:['b60','kv145','ah20'], teile:[
    {h:'An einer Einmündung ohne Verkehrszeichen', p:'Du fährst geradeaus und willst nach links in eine Seitenstraße. Beachte diese 7 Schritte:',
     steps:['<b>Umsehen</b>','<b>Handzeichen geben</b> (linker Arm)','<b>In der Mitte einordnen</b>','<b>Gegenverkehr Vorrang gewähren</b>','<b>Nochmals umsehen</b>','<b>In weitem Bogen abbiegen</b>','<b>Auf Fußgänger achten</b>'],
     m:'Weiter Bogen, nicht eng um die Ecke! Und: Vorher in der Mitte einordnen.'},
    {h:'Und wenn es zu gefährlich ist?', p:'Ist sehr viel Verkehr oder die Stelle unübersichtlich, kannst du auch absteigen und dein Rad schieben (Bild B im Buch).'}
  ]},
  {id:'v-links2', t:'verkehr', e:'🚦', titel:'Links abbiegen: Kreuzung ohne Vorfahrtszeichen', kurz:'8 Schritte an der Kreuzung', s:['b61','kv149'], teile:[
    {h:'Die acht Schritte', p:'An einer Kreuzung gilt: <b>rechts vor links</b>, wenn kein Schild etwas anderes sagt.',
     steps:['<b>Umsehen</b> – wechsle die Spur erst, wenn die Linksabbiegerspur frei ist.','<b>Handzeichen</b> nach links geben.','<b>Einordnen</b> – an der rechten Seite der Linksabbiegerspur.','<b>Vorfahrtsregeln beachten</b> – an der Kreuzung zuerst nach rechts schauen.','<b>Gegenverkehr beachten</b> – geradeaus sehen und Vorrang gewähren.','<b>Nochmals umsehen</b> und das Handzeichen geben.','<b>Richtig abbiegen</b> – in einem weiten Bogen nach links.','<b>Auf Fußgängerinnen und Fußgänger achten.</b>'],
     m:'Zuerst nach rechts schauen: Dort hat jemand Vorfahrt.'}
  ]},
  {id:'v-links3', t:'verkehr', e:'🛑', titel:'Sicher links abbiegen an großen Straßen', kurz:'In zwei Etappen über die Kreuzung', s:['b62','ah21','kv154'], teile:[
    {h:'Warum so vorsichtig?', p:'Auf großen Straßen und unübersichtlichen Kreuzungen siehst du oft nicht gut, was die anderen machen – und sie sehen dich vielleicht auch schlecht. Beim <b>sicheren Linksabbiegen</b> hast du Zeit für einen Überblick und fährst nicht zwischen den anderen Fahrzeugen.'},
    {h:'So geht es', steps:['<b>Vorsichtig nähern</b> – bis zur Ecke der Kreuzung am rechten Bordsteinrand.','<b>Sicherheitsblick</b> – noch einmal umsehen.','<b>Kreuzung überqueren</b> – wenn alles frei ist, geradeaus bis zur gegenüberliegenden Ecke.','<b>Fahrrad umstellen</b> – an der Ecke in die neue Fahrtrichtung drehen, Sicherheitsblick, wenn frei: geradeaus über die Kreuzung.','<b>Auf Fußgängerinnen und Fußgänger achten.</b>'],
     m:'Sicherheitsblick = noch einmal über die Schulter schauen, bevor du losfährst.'}
  ]},
  {id:'v-kreisel', t:'verkehr', e:'🔄', titel:'Im Kreisverkehr unterwegs', kurz:'Wer hat Vorfahrt im Kreisel?', s:['b63','ah22','kv166'], teile:[
    {h:'Die zwei Schilder', p:'Ein Kreisverkehr (Kreisel) wird meist mit zwei Schildern geregelt: dem Dreieck <b>„Vorfahrt gewähren!“</b> und dem blauen runden Schild <b>„Kreisverkehr“</b>.',
     m:'Wer schon im Kreisverkehr fährt, hat Vorfahrt. Wer hineinfahren will, wartet.'},
    {h:'A: Kreisverkehr ohne Radweg', l:['Du fährst nur nach <b>rechts</b> hinein.','Du gewährst den Fahrzeugen im Kreisverkehr die Vorfahrt.','Vor dem Verlassen gibst du ein <b>Handzeichen nach rechts</b>.']},
    {h:'B: Mit Radweg', p:'Alle Fahrzeuge, die den Kreisverkehr verlassen oder hineinfahren, müssen auf Menschen auf dem Rad oder zu Fuß achten und ihnen Vorrang geben. Wenn du auf dem Radweg die Straße überqueren willst, hast du Vorfahrt. Fahre trotzdem vorsichtig!'},
    {h:'C: Mit Radweg und Schild „Vorfahrt gewähren“', p:'Steht neben dem Radweg das Schild „Vorfahrt gewähren“, musst du <b>warten</b>. Die Fahrzeuge, die den Kreisverkehr verlassen oder hineinfahren, haben hier Vorfahrt.'}
  ]},
  {id:'v-abknick', t:'verkehr', e:'↪️', titel:'Abknickende Vorfahrt', kurz:'Wenn die Vorfahrtsstraße abbiegt', s:['b64'], teile:[
    {h:'Was ist das?', p:'Bei einer <b>abknickenden Vorfahrtsstraße</b> führt die Vorfahrtsstraße an der Kreuzung nach rechts oder links weiter. Das erkennst du am gelben Rautenschild mit einem Zusatzzeichen, das den Verlauf zeigt.'},
    {h:'Wie fährst du?', l:['Du bist auf der Vorfahrtsstraße und willst ihr nach links folgen: Handzeichen nach links, du darfst weiterfahren, ohne anzuhalten.','Du kommst von der Seite (Schild „Vorfahrt gewähren“): Handzeichen geben, warten, bis die Straße frei ist, dann vorsichtig abbiegen.','Du willst geradeaus in die Straße, die abknickt: Am rechten Fahrbahnrand stehen bleiben. Wenn alles frei ist, fährst du los.']}
  ]},
  {id:'v-winkel', t:'verkehr', e:'👁️', titel:'Toter Winkel', kurz:'Wo dich der Lkw nicht sieht', s:['b65','b68','pruef4'], teile:[
    {h:'Was ist der tote Winkel?', p:'Fahrerinnen und Fahrer von Autos, Bussen und Lkw können nicht alles sehen, was neben, vor oder hinter ihrem Fahrzeug passiert – weder aus dem Fenster noch im Spiegel. Diesen Bereich nennt man <b>toten Winkel</b>.'},
    {h:'Dein Verhalten', l:['Ein Lkw blinkt rechts? Stelle dich <b>nicht rechts neben ihn</b>. Dort wirst du übersehen!','Bleibe lieber hinter dem Lkw (mit Abstand) oder warte, bis er abgebogen ist.','Lange Fahrzeuge holen beim Rechtsabbiegen weit nach links aus, schwenken ein und biegen dann ein. Dabei können sie dich übersehen.'],
     m:'Wenn du den Fahrer im Spiegel nicht sehen kannst, sieht er dich auch nicht.'}
  ]},
  {id:'v-umwelt', t:'verkehr', e:'🌍', titel:'Umweltfreundlich unterwegs', kurz:'Verkehrsmittel und Umwelt', s:['b66','b67','b68'], teile:[
    {h:'Verkehrsmittel und Verkehrswege', p:'Heute kann man mit Auto, Bus, Zug, Flugzeug oder Schiff fast jeden Ort der Welt erreichen. Auch Waren werden jeden Tag transportiert.',
     tab:{k:['Verkehrsweg','Beispiele'], z:[['Straße','Auto, Bus, Lkw, Motorrad, Fahrrad'],['Schiene','Zug, Straßenbahn'],['Luftweg','Flugzeug'],['Wasserweg','Schiff']]}},
    {h:'Elektroauto oder Verbrenner?', p:'Autos, Busse, Lkw und Motorräder sind Kraftfahrzeuge. Manche fahren mit Strom (Elektroautos), andere mit Benzin oder Diesel (Verbrenner).',
     tab:{k:['Elektroauto','Nachteile'], z:[['leiser, keine Schadstoffe beim Fahren','Für die Akkus braucht man seltene Rohstoffe. Ihr Abbau kann die Umwelt schädigen. Akkus enthalten Schadstoffe.']]}},
    {h:'Was ist am besten für die Umwelt?', l:['Am umweltfreundlichsten: <b>zu Fuß gehen</b> und <b>Fahrrad fahren</b>.','Auch Züge, Straßenbahnen und Busse sind gut, weil sie viele Menschen auf einmal fahren.','<b>Fahrgemeinschaft</b>: Mehrere Personen fahren in einem Auto. Das schützt die Umwelt und spart Geld.']}
  ]},

  // ================= WALD =================
  {id:'w-leben', t:'wald', e:'🌳', titel:'Lebensgemeinschaft Wald', kurz:'Wer lebt im Wald?', s:['b70','b71','ah24'], teile:[
    {h:'Alle gehören zusammen', p:'In einem Wald leben Pflanzen, Tiere und Pilze zusammen. Sie bilden eine <b>Lebensgemeinschaft</b>.'},
    {h:'Waldtypen', p:'Es gibt verschiedene Waldtypen, zum Beispiel <b>Nadelwald</b>, <b>Laubwald</b> und <b>Mischwald</b>. Welche Pflanzen dort wachsen, hängt vom Waldboden, den Nährstoffen, dem Wasser und dem Licht ab.',
     m:'Der Mischwald hat die größte Artenvielfalt. In reinen Nadelwäldern leben nur wenige Arten.'},
    {h:'Was suchen Tiere im Wald?', p:'Tiere suchen Schutz, Wohnraum und Nahrung. Einige mögen sonnige Lichtungen, andere schattige Bereiche. Es gibt tagaktive und nachtaktive Tiere.'},
    {h:'Tiergruppen im Wald', tab:{k:['Gruppe','Beispiele'], z:[['🐗 Säugetiere','Reh, Wildschwein, Fuchs, Dachs, Eichhörnchen, Waldmaus, Baummarder'],['🐦 Vögel','Blaumeise, Buntspecht, Habicht, Waldkauz, Eichelhäher'],['🐛 Insekten','Ameise, Eichenwicklerraupe'],['🕷️ Spinnentiere','Kreuzspinne, Zecke']]}}
  ]},
  {id:'w-reh', t:'wald', e:'🦌', titel:'Das Reh', kurz:'Rehbock, Ricke und Kitz', s:['b72','ah25'], teile:[
    {h:'Steckbrief', tab:{k:['',''], z:[['Männchen','Rehbock'],['Weibchen','Ricke'],['Jungtier','Kitz'],['Lebensraum','Waldrand, Waldlichtungen, auch Felder und Wiesen'],['Nahrung','Pflanzen: Knospen, frische Gräser, Früchte (z. B. Brombeeren, Eicheln)'],['Tiergruppe','Säugetier – die Ricke säugt ihre Jungen']]}},
    {h:'So leben Rehe', l:['Im Sommer leben die Rehe in kleinen Gruppen: Ricke mit ihren Kitzen (meist zwei).','Im Herbst und Winter bilden sie größere Gruppen mit jungen Rehböcken.','Rehböcke, die älter als zehn Jahre sind, leben allein.','Rehe schlucken ihre Nahrung, würgen sie wieder ins Maul und kauen sie noch einmal (Wiederkäuer).']},
    {h:'Du findest ein Rehkitz', p:'Die Ricke lässt ihr Kitz oft allein, wenn sie Nahrung sucht.', m:'Ein Kitz nie anfassen und in Ruhe lassen! Wenn es nach Menschen riecht, verlässt die Ricke es.'}
  ]},
  {id:'w-sau', t:'wald', e:'🐗', titel:'Das Wildschwein', kurz:'Keiler, Bache und Frischlinge', s:['b73','ah25'], teile:[
    {h:'Steckbrief', tab:{k:['',''], z:[['Männchen','Keiler'],['Weibchen','Bache'],['Jungtier','Frischling'],['Lebensraum','Laub- und Mischwälder, tagsüber im Dickicht versteckt'],['Nahrung','Allesfresser: Wurzeln, Eicheln, Bucheckern, Würmer, Insekten, Schnecken, Mäuse, Aas'],['Tiergruppe','Säugetier']]}},
    {h:'Rotte und Suhle', l:['Eine <b>Rotte</b> besteht aus der Bache und ihren Frischlingen. Der Keiler lebt allein.','Nach vier Monaten bringt die Bache etwa sechs Frischlinge zur Welt.','In einer <b>Suhle</b> (Schlammbad) werden lästige Insekten abgewaschen und im Sommer kühlen sich die Tiere ab. Danach scheuern sie sich an Baumstämmen.']},
    {h:'Vorsicht!', m:'Nähert sich ein Mensch den Frischlingen, kann die Bache angreifen, weil sie ihre Jungen schützen will. Gehe ruhig weg und halte Abstand.'}
  ]},
  {id:'w-wolf', t:'wald', e:'🐺', titel:'Der Wolf', kurz:'Rüde, Fähe und Welpen', s:['b74','ah25'], teile:[
    {h:'Steckbrief', tab:{k:['',''], z:[['Männchen','Rüde'],['Weibchen','Fähe'],['Jungtier','Welpe'],['Gruppe','Rudel (Rüde, Fähe und Welpen)'],['Nahrung','Fleischfresser: Rehe, Rothirsche, Wildschweine, Hasen'],['Sinne','sehr gutes Riechen und Hören'],['Tiergruppe','Säugetier und Raubtier']]}},
    {h:'Wölfe in Deutschland', p:'Durch die Jagd waren Wölfe in Deutschland lange ausgestorben. Erst ab 1998 sah man wieder Wölfe. Sie stehen unter <b>Naturschutz</b> und ihre Zahl nimmt zu. Man sieht sie selten, oft nur ihre Spuren.'},
    {h:'Die Fähe und ihre Welpen', p:'Nach etwa zwei Monaten bekommt die Fähe zwei bis sechs Welpen. Sie säugt sie etwa zwei Monate lang.'}
  ]},
  {id:'w-nahrung', t:'wald', e:'🐿️', titel:'Waldtiere und ihre Nahrung', kurz:'Wer frisst was?', s:['b75'], teile:[
    {h:'Sechs Waldtiere', tab:{k:['Tier','Was es frisst und wie es lebt'], z:[
      ['🐛 Eichenwicklerraupe','frisst Eichenblätter, ist ein Insekt – aus der Raupe wird ein Schmetterling'],
      ['🐦 Blaumeise','frisst Eier von Insekten, Raupen und Larven; hängt sich mit den Krallen an Zweige und Blätter'],
      ['🪶 Buntspecht','meißelt mit dem Schnabel Löcher ins Holz und zieht Insekten mit der langen Zunge heraus'],
      ['🐿️ Eichhörnchen','frisst Samen, Nüsse, Eicheln, Bucheckern, Insekten, Vogeleier und Jungvögel; Nest = Kobel; vergräbt Wintervorräte'],
      ['🦅 Habicht','Raubvogel, jagt kleine Vögel und Säugetiere; erspäht die Beute von oben, schnell und wendig'],
      ['🦡 Baummarder','jagt nachts Mäuse, Eichhörnchen und Vögel; frisst auch Insekten, Vogeleier und Beeren; klettert gut mit buschigem Schwanz']]}}
  ]},
  {id:'w-pflanzen', t:'wald', e:'🌲', titel:'Bäume, Sträucher und Kräuter', kurz:'Die Pflanzen des Waldes', s:['b76','b77','ah27'], teile:[
    {h:'Der Baum', p:'Ein Baum besteht aus <b>Baumkrone, Blättern, Zweigen, Ästen und Stamm</b>. Man unterscheidet:',
     tab:{k:['Art','Merkmal','Beispiele'], z:[['Laubbaum','hat Laubblätter','Rotbuche, Eiche'],['Nadelbaum','hat Nadeln','Fichte']]}},
    {h:'Der Strauch', p:'Ein Strauch hat mehrere Stämme, dazu Zweige und Blätter. Sträucher wachsen meist an Waldrändern, auf Lichtungen oder an Wegrändern, weil sie dort genug Sonnenlicht bekommen. Beispiele: <b>Weißdorn, Brombeere, Haselnuss</b>.'},
    {h:'Kräuter', p:'Kräuter haben keine verholzten Stängel (<b>Sternmiere, Goldnessel, Große Brennnessel</b>). Die meisten sterben nach der Blüte ab, nur die Samen überwintern. Im nächsten Jahr wachsen aus den Samen neue Pflanzen. Schattenpflanzen wachsen unter Bäumen, andere brauchen mehr Licht.'},
    {h:'Farne und Moose', tab:{k:['','Farne','Moose'], z:[['Beispiele','Adlerfarn, Wurmfarn','Sternmoos'],['Vermehrung','Sporen in Sporenkapseln, keine Blüten und Samen','ebenfalls durch Sporen'],['Besonderheit','haben Wedel','keine Wurzeln; nehmen Wasser mit den Blättchen auf und speichern es; sterben nicht ab, wenn sie austrocknen']]}}
  ]},
  {id:'w-kette', t:'wald', e:'🔗', titel:'Nahrungsbeziehungen im Wald', kurz:'Nahrungskette und Nahrungsnetz', s:['b78'], teile:[
    {h:'Wer wird von wem gefressen?', p:'Die Raupe des Eichenwicklers frisst Eichenblätter. Diese Abhängigkeit heißt <b>Nahrungsbeziehung</b>. Die Blaumeise frisst die Raupe – das ist die nächste Beziehung. Sind mehrere Beziehungen hintereinander verbunden, entsteht eine <b>Nahrungskette</b>. Viele Nahrungsketten zusammen bilden ein <b>Nahrungsnetz</b>.',
     m:'Der Pfeil bedeutet „wird gefressen von“.'},
    {h:'Beispiele', steps:['Eichenblatt → Eichenwicklerraupe → Blaumeise → Habicht','Eichel → Eichhörnchen → Baummarder','Fichtenzapfen → Buntspecht → Baummarder']}
  ]},
  {id:'w-licht', t:'wald', e:'☀️', titel:'Licht im Lebensraum Wald', kurz:'Frühblüher und Schattenpflanzen', s:['b79'], teile:[
    {h:'Wettlauf zum Licht', p:'Im Wald wachsen die Bäume nach oben und verzweigen sich erst in großer Höhe, um ans Licht zu kommen. Wie viel Licht den Boden erreicht, entscheidet, welche Sträucher, Kräuter, Farne und Moose dort wachsen.'},
    {h:'Frühblüher', p:'Im Frühjahr haben die Laubbäume noch keine Blätter, die Sonne erreicht den Waldboden. Jetzt wachsen und blühen die <b>Frühblüher</b>, zum Beispiel das <b>Buschwindröschen</b>. Sie bilden Nährstoffe und speichern sie unter der Erde. Sobald die Bäume Blätter haben, verwelken die oberirdischen Teile. Im nächsten Frühjahr treiben die Pflanzen mit den gespeicherten Nährstoffen wieder aus.'},
    {h:'Schattenpflanzen', p:'Pflanzen wie das <b>Springkraut</b> brauchen Schatten. Sie wachsen erst, wenn die Bäume belaubt sind.'}
  ]},
  {id:'w-leistung', t:'wald', e:'💚', titel:'Leistungen des Waldes', kurz:'Was der Wald für uns tut', s:['b80','ah29'], teile:[
    {h:'Neun Aufgaben', tab:{k:['Leistung','Das bedeutet es'], z:[
      ['🌬️ Sauerstoffspender','Die Blätter geben Sauerstoff ab, den Menschen und Tiere zum Atmen brauchen.'],
      ['🧹 Staubfänger','Blätter und Nadeln sammeln Schmutz und Staub aus der Luft.'],
      ['🔇 Wind- und Lärmschutz','Wälder schützen Orte und Häuser vor Wind und Lärm.'],
      ['🏡 Lebensraum','Viele Tier- und Pflanzenarten brauchen den Wald.'],
      ['🪵 Holzlieferant','Holz für Hausbau, Möbel und Papier.'],
      ['👷 Arbeitsplatz','Menschen arbeiten in der Försterei, im Sägewerk und in Möbelfabriken.'],
      ['🚶 Freizeitort','Natur, gute Luft und angenehmes Klima laden zum Erholen ein.'],
      ['🌱 Bodenschutz','Wurzeln halten den Boden fest, Wind und Wasser tragen ihn nicht fort.'],
      ['💧 Wasserspeicher','Der Waldboden speichert Wasser und reinigt es, bevor es ins Grundwasser versickert.']]}}
  ]},
  {id:'w-gefahr', t:'wald', e:'⚠️', titel:'Gefahren für den Wald', kurz:'Was dem Wald schadet – und wie wir ihn schützen', s:['b81','ah30'], teile:[
    {h:'Gefahren', l:['<b>Luftverschmutzung</b>, <b>Stürme</b>, <b>Trockenheit</b> und <b>Waldbrände</b>','weggeworfener <b>Müll</b>','<b>Schädlinge</b>: Insekten wie der Borkenkäfer, aber auch Pilze und Bakterien. Geschwächte Bäume sind dafür besonders anfällig.','<b>Wildverbiss</b>: Gibt es zu viele Rehe und Hirsche, fressen sie die Knospen und Triebe junger Bäume, und die Bäume sterben ab.']},
    {h:'Warum Mischwälder besser sind', p:'Viele Jahre pflanzte man in Deutschland meist nur Fichten, um schnell viel Holz zu bekommen. Solche Wälder sind artenarm und anfällig für Stürme, Trockenheit und Schädlinge. <b>Mischwälder sind widerstandsfähiger.</b>'},
    {h:'Wie kann ich den Wald schützen?', l:['Müll einpacken und mitnehmen','Pflanzen nicht abreißen oder zerstören','Tiere nur beobachten','auf den Wegen wandern'], tipp:'Der Wald ist ein Lebensraum – wir sind dort nur zu Besuch.'}
  ]}
];
