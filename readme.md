# Anmerkung für Julius 

Es gibt jetzt 2 Branches main und dev bei branches haben auf dem server einen ordner und werden unabhängig voneinander mit pm2 ausgeführt. 
Bitte in zukunft nur in dev entwickeln und in main nix mehr machen main bildet zu jeder zeit das live system ab was dauerhaft laufen soll. 
Also auf dev entwickeln testen und wenn es gut genug läuft auf den main branch mergen und aufm server pullen, danach mit "pm2 restart ecosystem.config.js --only Video-Stream-Server" neustarten. Der Dev server hat einen watcher auf server.js datei also sobald die geändert wird startet der server neu, das kann in der ecosystem.config.js geändert werden. Du kannst durchaus direkt aufm server arbeiten aber bitte immer in der dev umgebung. "/home/filetransfer/videochat-dev/videochat/"

## Server Starten 

Start Restart in Development 
```bash
pm2 start ecosystem.config.js --only Video-Stream-Server-DEV
pm2 restart ecosystem.config.js --only Video-Stream-Server-DEV
```

Start Restart in Production 
```bash
pm2 start ecosystem.config.js --only Video-Stream-Server
pm2 restart ecosystem.config.js --only Video-Stream-Server
```

```
pm2 restart ecosystem.config.js
```


## CSS Vars 

Primäre Hintergrund Farbe 
primary_bg: #202225;

Sekundäre Hintergrund Farbe
secondary_bg: #2f3136;
tertiary_bg: #36393F;

Modal Hintergrund Farbe
modal_header_bg: #36393F;


red: #f92c47;


text_primary_size: 10px;
text_secondary_size: 12px;
text_primary_color: #fff;
text_secondary_color: #fff;
text_primary_weight: 400;
text_secondary_weight: 600;
avatar_size: 20px;