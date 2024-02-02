## 🚩 PRIO:
### ⚒️ custom context menu öffnet sich bei jedem rechtsklick, unabhänig vom kontext
### ⚒️ nameslider rework (show native controls on safari)
### ⚒️ start stream error toasts
### ⚒️ loading spinner bauen (und an entsprechenden stellen einfügen, z.b. beim avatarupload)
### ⚒️ Chat File Upload Progressbar (CSS) 
### ⚒️ Bei Anderen Usern die eine Nachricht mit anhang bekommen der noch nicht hochgeladen ist ein Platzhalter einfügen
### ⚒️ (WIP) Bearbeiten von Chat Msgs ( server check !!! )


## Anmerkungen
### Bearbeiten fast fertig nur noch kleine fixes 
### beim upload von anhängen updatet der server die msg nicht richtig 


## Fixen:
### ⚒️ "show profile" modal
### ⚒️ Wenn der Initiator vom anderen Client keine SocketIO ID hat kommt es zu extrem hohen CPU-Lasten


## UI:
### ⚒️ ring in dominanter farbe aus profilbild um profilbild herum
### ⚒️ generelles UI-"re"work
### ⚒️ emojis picker für chat 
### ⚒️ Attachments Picker Style (Leiste über Text Input mit icons für file picker und emote picker über der liste oder woander die derzeit ausgewählten files anzeigen)
### ⚒️ Chatnachricht vergößern (Modal?) 
### ⚒️ Attachments große Modal anzeige (dc like)
### ⚒️ Möglichkeit Streams und Chat wechseln zu können
### ⚒️ Fehlermeldung für joinRoom error code 5 erstellen


## Funktionen:
### ⚒️ Voice Chat
### ⚒️ Login System (mit Discord/Google/Apple)
### ⚒️ settings
### ⚒️ Auf Chat msg reagieren und antworten können. kleine vorbereitung getroffen. jede Msg hat jetzt eine id sobalt sie beim server angekommen ist und verteilt wird 
### ⚒️ Hotkeys
### ⚒️ Animationen
### ⚒️ Senden Button für Chat für Mobile
### ⚒️ Bot Bar verbessern 
### ⚒️ Attachments mehr Formate unterstützen derzeit nur png jpg webp mp4
### ⚒️ Video beim Streamen deaktivieren oder thumbnail ausblenden (von einem selbst)
### ⚒️ STRG+V Bilder versenden - scheinbar nicht möglich im Browser
### ⚒️ Discord Status interaktion mit link zum raum in dem man ist (nur in eigener Electron App möglich)
### ⚒️ [Bilder Anpassen](https://fengyuanchen.github.io/cropperjs/)


## Fertig
### ✔️ streamen auf safari fixen
### ✔️ '/' landing page
### ✔️ modals enter drücken zum weiter-button-clicken
### ✔️ chat gestern/heute/datum
### ✔️ random identity server crash fixen
### ✔️ fixed stagewrapper padding
### ✔️ chatnachrichten die weniger als 2min auseinanderliegen zusammenlegen (fertig, gab noch einen bug den ich nicht reproduzieren könnte)
### ✔️ upload progress 
### ✔️ chat scroll to bottom wenn man einem raum beitritt 
### ✔️ Chat rework (Server Massages Handling) 
### ✔️ Chat File Upload 
### ✔️ context menu rework
### ✔️ avatar upload toasts (file too large,etc.)
### ✔️ joinRoom und createRoom
### ✔️ Toasts
### ✔️ fixed: mobile top navbar
### ✔️ fixed: camera streaming
### ✔️ fixed: start stream error messages
### ✔️ fixed: loadRoomMemberThumbnails() konnte color nicht lesen, weil daten nicht vom server gesendet wurden
### ✔️ fixed: stage mode funktioniert nicht, nachdem aus dem stage mode heraus angefangen wurde einem stream zuzuschauen
### ✔️ stream-starten-menü 
### ✔️ ein background image nutzen und src entweder farbe oder preview image, damit background color nicht an dem preview img vorbeischeint
### ✔️ videoelement background leer wenn stream aufhört fixen (soll wieder farbig sein)
### ✔️ bot_bar_hover entfernen
### ✔️ Chat Text Input Fixen es bleibt beim abschicken eine zeile bestehen
### ✔️ Sammlung aus Farben, aus denen Usern eine zufällige zugewiesen wird und/oder irgendwie aus Profilbild passende Farbe ziehen (random für user ohne PB, letzteres für user mit PB)
### ✔️ Bilder uploaden in Chat (Bilder im Chat verschicken)
### ✔️ neue farbe bei seitenreload
### ✔️ grundfuntionalität Chat
### ✔️ bitrate erhöhen Am client sdp settings anschauen
### ✔️ Stream zwischen Fenstern wechseln können 
### ✔️ kontrollelemente von videoelement begrenzen (nur ton und fullscreen)
### ✔️ localstream bei start mute
### ✔️ liste von leuten in räumen
### ✔️ streams zuschauen
### ✔️ identität erstellen wenn keine vorhanden ist (meistens beim ersten mal laden)
### ✔️ startseite: raum erstellen oder raum joinen
### ✔️ zugriffsbeschränkugen für räume
### ✔️ Wechsel zwischen Kamera und Stream
### ✔️ Verschwommenes Vorschaubild machen und in Raum senden, wenn Stream gestartet wird
### ✔️ Touch Gesten
### ✔️ Kleine Infomodals für Fehlermeldungen (z.B. wenn User getDisplaMedia blockiert)
### ✔️ Rechtsklick auf User soll eigenes Context menu anzeigen mit verschiedenen funktionen
### ✔️ Oberfläche für verschiedene Größen anpassen bzw. verbessern
### ✔️ stream starten button (mit auflösung und framerate) => Modal mit Animationen
### ✔️ stream muten/fullscreen -> controls
### ✔️ Chat UI verbessern


# Links 

https://stackoverflow.com/questions/57653899/how-to-increase-the-bitrate-of-webrtc

https://github.com/bbc/videocontext

https://developer.chrome.com/articles/fetch-streaming-requests/