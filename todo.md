## 🚩 PRIO:
### ⚒️ fix "show profile" modal
### ⚒️ chat scroll to bottom wenn man einem raum beitritt
### ⚒️ avatar upload toasts (file too large,etc.)
### ⚒️ create room modal rework + create/join room rework
### ⚒️ (WIP) Dateien verschicken 


## Fixen:
### ⚒️ camera streaming (auch auf handy)
### ⚒️ mobile top navbar
### ⚒️ Wenn der Initiator vom anderen Client keine SocketIO ID hat kommt es zu extrem hohen CPU-Lasten


## UI:
### ⚒️ generelles UI-"re"work
### ⚒️ emojis picker für chat 
### ⚒️ Attachments Picker Style (Leiste über Text Input mit icons für file picker und emote picker über der liste oder woander die derzeit ausgewählten files anzeigen)
### ⚒️ Chatnachricht vergößern (Modal?) 
### ⚒️ Attachments große Modal anzeige (dc like)


## Funktionen:
### ⚒️ STRG+V Bilder versenden
### ⚒️ Voice Chat
### ⚒️ Login System (mit Discord/Google/Apple)
### ⚒️ settings
### ⚒️ Auf Chat msg reagieren und antworten können. kleine vorbereitung getroffen. jede Msg hat jetzt eine id sobalt sie beim server angekommen ist und verteilt wird 
### ⚒️ upload progress
### ⚒️ Hotkeys
### ⚒️ Animationen
### ⚒️ Senden Button für Chat für Mobile
### ⚒️ Bot Bar verbessern 
### ⚒️ Attachments mehr Formate unterstützen derzeit nur png jpg webp mp4
### ⚒️ Video beim Streamen deaktivieren oder thumbnail ausblenden (von einem selbst)
### ⚒️ Discord Status interaktion mit link zum raum in dem man ist 


## Fertig
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