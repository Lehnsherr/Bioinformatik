## Viterbi / Forwards  Algorithmus 

Viterbi / Forwards Algorithmus mit Skala plot.

#Benutztung: 
 Paramter in [] sind optional. 

python A4.py  [-h]
              -f FILE 
              -a ALGORITHMUS 
              [-p PLOT] 
              [-rs REVERSE_SEQUENZ] 
              [-rl REVERSE_LOOP]

#Beispiel: 
  Viterbi Algorithm + Plot Logaritmisch : 
  python A4.py -f wuerfel.txt -a vit -p l

  Vorwärts Alotithmus + Plot normal + Umdrehen Sequenz:
  python A4.py -f wuerfel.txt -a vor -p n -rs y

#optionale Argumente:
  -h, --help            zeige Hilfe Nachricht, Exit
  -f FILE, --file FILE  Text Datei mit Zahlenfolge Bsp.: -f wuerfel.txt  
  -a ALGORITHMUS, --algorithmus ALGORITHMUS
                        Viterbi-Alg == 'vit' oder 'Viterbi'. 
                        Vorwaerts-Alg == 'vor' oder 'Vorwaerts'. 
                        Bsp.: -a vit oder -a vor
  -p PLOT, --plot PLOT  Soll eine Skale erstellt werden ? 
                        (l = logarithmische Skala) ||p (p= normale Skala)
                        Bsp.: -p l oder -p n
  -rs REVERSE_SEQUENZ, --reverse_Sequenz REVERSE_SEQUENZ
                        Soll die Reihenfolge der Zeichen der Eingabesequenz vertauscht werden (y/n)? 
                        Bsp.: -rs y oder -rs n
  -rl REVERSE_LOOP, --reverse_Loop REVERSE_LOOP
                        Soll Reihenfolge der Zustaende vertauscht werden (y/n)? 
                        Bsp.: -rl y oder -rl n